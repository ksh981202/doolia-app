import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { createClient } from '@supabase/supabase-js'

type PrintableFields = {
  id: string
  slug: string
  titleEn: string
  title: string
}

type DatabaseRow = {
  id: string | null
  slug: string | null
  title_en: string | null
  title_ko: string | null
  published: boolean | null
}

const root = process.cwd()

function readText(relativePath: string) {
  const filePath = path.join(root, relativePath)
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
}

function loadLocalEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    const filePath = path.join(root, name)
    if (!existsSync(filePath)) continue
    for (const raw of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const separator = line.indexOf('=')
      if (separator < 1) continue
      const key = line.slice(0, separator).trim()
      let value = line.slice(separator + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  }
}

function propertyValue(object: ts.ObjectLiteralExpression, names: string[]) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = property.name
    const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : ''
    if (!names.includes(key)) continue
    const initializer = property.initializer
    if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
      return initializer.text.trim()
    }
  }
  return ''
}

function readLocalDemoRows() {
  const filePath = path.join(root, 'src', 'services', 'demoPrintables.ts')
  if (!existsSync(filePath)) return []
  const source = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const rows: PrintableFields[] = []

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'DEMO_ROWS' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const entry of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(entry)) continue
        rows.push({
          id: propertyValue(entry, ['id']),
          slug: propertyValue(entry, ['slug']),
          titleEn: propertyValue(entry, ['titleEn', 'title_en']),
          title: propertyValue(entry, ['title', 'title_ko']),
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return rows
}

function summarizeRows(label: string, rows: PrintableFields[]) {
  const missingId = rows.filter((row) => !row.id)
  const missingSlug = rows.filter((row) => !row.slug)
  const missingTitleEn = rows.filter((row) => !row.titleEn)
  const duplicateSlugs = [...new Set(
    rows
      .map((row) => row.slug)
      .filter((slug, index, slugs) => Boolean(slug) && slugs.indexOf(slug) !== index),
  )]
  const codeSlugs = rows.filter((row) => row.slug && /^[a-z]{1,8}\d+$/i.test(row.slug))

  console.log(`\n[${label}] ${rows.length}건`)
  console.log(`id 누락 ${missingId.length} | slug 누락 ${missingSlug.length} | titleEn/title_en 누락 ${missingTitleEn.length}`)
  console.log(`코드형 slug ${codeSlugs.length} | 중복 slug ${duplicateSlugs.length}`)
  if (duplicateSlugs.length) console.log(`중복 slug 목록: ${duplicateSlugs.join(', ')}`)
  console.log('id | slug | titleEn/title_en | title')
  for (const row of rows) {
    console.log(`${row.id || '(누락)'} | ${row.slug || '(누락)'} | ${row.titleEn || '(누락)'} | ${row.title || '(누락)'}`)
  }
  if (missingTitleEn.length) {
    console.log(`영문 제목 누락 id: ${missingTitleEn.map((row) => row.id || '(id 누락)').join(', ')}`)
  }
}

async function readDatabaseRows(): Promise<DatabaseRow[] | null> {
  loadLocalEnv()
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.log('\n[라이브 DB] 환경변수가 없어 조회하지 않음 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
    return null
  }

  const client = createClient(url, key)
  const rows: DatabaseRow[] = []
  const pageSize = 1000
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await client
      .from('printables')
      .select('id,slug,title_en,title_ko,published')
      .range(start, start + pageSize - 1)
    if (error) {
      console.log(`\n[라이브 DB] 읽기 전용 조회 실패: ${error.message}`)
      return null
    }
    const page = (data ?? []) as DatabaseRow[]
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows
}

function reportSourceAnalysis() {
  const card = readText('src/components/PrintableCard.tsx')
  const pathHelper = readText('src/shared/config/catalog.ts')
  const router = readText('src/app/router.tsx')
  const detail = readText('src/pages/PrintableDetailPage.tsx')
  const service = readText('src/services/printableService.ts')
  const query = readText('src/features/gallery/model/usePrintablesQuery.ts')
  const seoPlugin = readText('vite-plugin-seo-prerender.ts')
  const seoScript = readText('scripts/generate-seo-assets.ts')

  console.log('\n[카드 링크 / 라우팅]')
  console.log(`PrintableCard 링크 경로: ${card.match(/to=\{([^}]+)\}/)?.[1] ?? '확인 불가'}`)
  console.log(`printablePath 구현: ${pathHelper.match(/return\s+(['"`][^'"`]*printable[^'"`]*['"`])/m)?.[1] ?? '확인 불가'}`)
  console.log(`상세 라우트: ${(router.match(/<Route\s+path="\/printables?\/:id"/g) ?? []).join(', ') || '확인 불가'}`)
  console.log(`상세 페이지 키 매칭: ${detail.includes('item.id === key || item.slug === key') ? 'id 또는 slug' : '확인 불가'}`)
  console.log(`상세 쿼리 캐시 조회: ${query.includes('item.id === id || item.slug === id') ? 'id 또는 slug' : '확인 불가'}`)
  console.log(`서비스 DB 조회: UUID 형식이면 id 조회 후 slug 컬럼으로 조회; slug 조회 오류 시 demo 반환`)
  console.log(`실제 구현 확인: ${service.includes(".eq('slug', id)") && service.includes(".eq('id', id)") ? 'id/slug 양쪽 조회 확인' : '추가 확인 필요'}`)
  console.log(`ID가 UUID가 아닌 slug 요청은 DB slug 조회가 핵심. 오래된 slug 컬럼 스키마/쿼리 오류 시 상세 데이터를 찾지 못할 수 있음.`)

  console.log('\n[SEO 사전 렌더링 / sitemap]')
  console.log(`플러그인 요청 경로 패턴: ${seoPlugin.match(/pathOnly\.match\((\/[^;]+)\)/)?.[1] ?? '확인 불가'}`)
  console.log(`플러그인 파일 조회 기준: ${seoPlugin.includes("'public', 'printable', slug") ? 'public/printable/{slug}/index.html' : '확인 불가'}`)
  console.log(`SEO 데이터 선택: ${seoScript.match(/\.select\('([^']+)'\)/)?.[1] ?? '확인 불가'}`)
  console.log(`SEO URL 생성 기준: ${seoScript.includes('/printable/${xml(row.slug)}') && seoScript.includes("'printable', row.slug") ? 'row.slug로 sitemap과 prerender 생성' : '확인 불가'}`)
  console.log(`SEO 생성 대상: published=true 행만 조회하며, 현재 SELECT에는 id/title_en이 포함되지 않음.`)

  const mockPath = path.join(root, 'src', 'data', 'mockPrintables.ts')
  console.log(`\nsrc/data/mockPrintables.ts: ${existsSync(mockPath) ? '존재' : '없음'}`)
}

async function main() {
  console.log('읽기 전용 슬러그/라우팅 무결성 점검')
  console.log('저장·수정·삭제 작업은 수행하지 않습니다.')

  const demoRows = readLocalDemoRows()
  summarizeRows('로컬 DEMO_ROWS 원본 (src/services/demoPrintables.ts)', demoRows)
  reportSourceAnalysis()

  const databaseRows = await readDatabaseRows()
  if (databaseRows) {
    summarizeRows(
      'Supabase printables (RLS 정책이 허용한 전체 행)',
      databaseRows.map((row) => ({
        id: row.id?.trim() ?? '',
        slug: row.slug?.trim() ?? '',
        titleEn: row.title_en?.trim() ?? '',
        title: row.title_ko?.trim() ?? '',
      })),
    )
    const unpublished = databaseRows.filter((row) => row.published === false).length
    console.log(`DB에서 확인된 published=false 행: ${unpublished} (RLS가 숨긴 행은 포함될 수 없음)`)
  }
}

main().catch((error: unknown) => {
  console.error('점검 스크립트 실행 실패:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
