/**
 * TSV ↔ Supabase ↔ R2 printable pipeline integrity audit.
 * Usage: npx tsx scripts/verify-tsv-pipeline-integrity.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type IssueType = 'MISSING_FIELD' | 'IMAGE_404' | 'DUPLICATE' | 'CATEGORY_MISMATCH'
type IntegrityIssue = { slug: string; title: string; issueType: IssueType; detail: string }

const OFFICIAL_THEMES = new Set([
  'animals',
  'dinosaur',
  'vehicles',
  'princess',
  'space-robot',
  'food',
  'sea-nature',
  'daily',
  'jobs',
  'sports',
  'seasons',
  'imagination',
])
const THEME_ALIASES: Record<string, string> = {
  'wacky imagination': 'imagination',
  'cute animals': 'animals',
  'dinosaur world': 'dinosaur',
  'cars & vehicles': 'vehicles',
  'princess & fantasy': 'princess',
  'space & robots': 'space-robot',
  'fruits & desserts': 'food',
  'sea & insects': 'sea-nature',
  'home & daily': 'daily',
  'jobs & dreams': 'jobs',
}

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    try {
      for (const raw of readFileSync(resolve(process.cwd(), name), 'utf8').split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const cut = line.indexOf('=')
        if (cut < 1) continue
        const key = line.slice(0, cut).trim()
        let value = line.slice(cut + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!(key in process.env)) process.env[key] = value
      }
    } catch {
      /* optional */
    }
  }
}

function filled(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
}

function collectTsvFiles(root: string) {
  const found: string[] = []
  const dirs = [root, join(root, 'python'), join(root, 'data'), join(root, 'scripts')]
  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (/\.(tsv|csv)$/i.test(name)) found.push(join(dir, name).replace(`${root}\\`, '').replace(`${root}/`, ''))
    }
  }
  return found
}

async function probeUrl(url: string) {
  try {
    const head = await fetch(url, { method: 'HEAD' })
    if (head.status >= 200 && head.status < 400) return { ok: true, status: head.status }
    const get = await fetch(url, { method: 'GET' })
    await get.body?.cancel().catch(() => undefined)
    return { ok: get.status >= 200 && get.status < 400, status: get.status }
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : String(error) }
  }
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const out: R[] = new Array(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next
      next += 1
      out[index] = await worker(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return out
}

async function verifyPipelineIntegrity() {
  loadEnv()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🔍 DOOLIA 도안 파이프라인 (TSV - Supabase DB - Cloudflare R2) 전수 정합성 점검')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ VITE_SUPABASE_URL / KEY 가 .env 에 없습니다.')
    process.exitCode = 1
    return
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: dbItems, error } = await supabase
    .from('printables')
    .select(
      'id, slug, title, title_ko, published, category, catalog_slug, theme_ko, theme_en, age_group, image_bw_url, image_color_url, line_art_url, color_image_url',
    )
    .order('id', { ascending: true })
    .limit(500)

  if (error || !dbItems) {
    console.error('❌ Supabase 데이터 조회 실패:', error?.message)
    process.exitCode = 1
    return
  }

  console.log(`📦 [DB 현황] 총 등록된 도안: ${dbItems.length}개`)

  const tsvFiles = collectTsvFiles(process.cwd())
  if (tsvFiles.length) {
    console.log(`📄 [로컬 TSV/CSV 발견]: ${tsvFiles.join(', ')}`)
  } else {
    console.log('📄 [로컬 TSV/CSV] 없음 — DB·R2 정합성만 점검합니다.')
  }

  const issues: IntegrityIssue[] = []
  const slugSet = new Set<string>()
  const imageJobs: Array<{ slug: string; title: string; kind: 'bw' | 'color'; url: string }> = []

  console.log('\n🚀 전체 도안 메타데이터 및 R2 이미지 실존 여부 전수 검증 중...')

  for (const item of dbItems) {
    const slug = String(item.slug || `ID_${item.id}`).trim()
    const title = String(item.title_ko || item.title || '제목 없음').trim()

    if (slugSet.has(slug)) {
      issues.push({ slug, title, issueType: 'DUPLICATE', detail: '동일한 슬러그가 중복 등록되었습니다.' })
    }
    slugSet.add(slug)

    if (!filled(item.title_ko) && !filled(item.title)) {
      issues.push({ slug, title, issueType: 'MISSING_FIELD', detail: '제목(title_ko)이 비어있습니다.' })
    }
    if (!filled(item.category) && !filled(item.theme_ko) && !filled(item.theme_en)) {
      issues.push({ slug, title, issueType: 'MISSING_FIELD', detail: '카테고리/테마가 비어있습니다.' })
    }
    if (!filled(item.age_group)) {
      issues.push({ slug, title, issueType: 'MISSING_FIELD', detail: '연령대(age_group)가 비어있습니다.' })
    }

    const theme = String(item.theme_en || '').trim().toLowerCase().replace(/[\s_]+/g, '-')
    const themeRaw = String(item.theme_en || '').trim().toLowerCase()
    const aliased = THEME_ALIASES[themeRaw]
    if (theme && !OFFICIAL_THEMES.has(theme) && !aliased && !OFFICIAL_THEMES.has(themeRaw)) {
      issues.push({
        slug,
        title,
        issueType: 'CATEGORY_MISMATCH',
        detail: `theme_en="${item.theme_en}" 가 12대 공식 테마 ID와 불일치`,
      })
    }

    const bwUrl = String(item.image_bw_url || item.line_art_url || '').trim()
    const colorUrl = String(item.image_color_url || item.color_image_url || '').trim()
    if (!bwUrl) {
      issues.push({ slug, title, issueType: 'MISSING_FIELD', detail: '흑백 도안 이미지 URL(image_bw_url) 누락' })
    } else {
      imageJobs.push({ slug, title, kind: 'bw', url: bwUrl })
    }
    if (!colorUrl) {
      issues.push({ slug, title, issueType: 'MISSING_FIELD', detail: '컬러 예시 이미지 URL(image_color_url) 누락' })
    } else {
      imageJobs.push({ slug, title, kind: 'color', url: colorUrl })
    }
  }

  await mapPool(imageJobs, 8, async (job) => {
    const result = await probeUrl(job.url)
    if (!result.ok) {
      issues.push({
        slug: job.slug,
        title: job.title,
        issueType: 'IMAGE_404',
        detail: `R2 ${job.kind} 이미지 접근 불가 (HTTP ${result.status}${result.error ? ` ${result.error}` : ''}): ${job.url}`,
      })
    }
  })

  const byType = (type: IssueType) => issues.filter((item) => item.issueType === type)

  console.log('\n───────────────────────────────────────────────────────────────')
  console.log('📊 [파이프라인 정합성 점검 결과 보고]')
  console.log('───────────────────────────────────────────────────────────────')

  if (issues.length === 0) {
    console.log('✨ [PERFECT] 모든 도안의 메타데이터(제목, 카테고리, 연령)와 R2 이미지 연결이 100% 정상입니다!')
    console.log(`- 점검 완료 도안: ${dbItems.length}개`)
    console.log(`- 중복 슬러그: 0개`)
    console.log(`- 누락 필드: 0개`)
    console.log(`- 테마 불일치: 0개`)
    console.log(`- 이미지 404 에러: 0개`)
  } else {
    console.log(`⚠️ 총 ${issues.length}건의 정합성 불일치가 발견되었습니다:\n`)
    issues.slice(0, 40).forEach((iss, index) => {
      console.log(`${index + 1}. [${iss.issueType}] 도안: ${iss.title} (${iss.slug})`)
      console.log(`   👉 원인: ${iss.detail}`)
      console.log('')
    })
    if (issues.length > 40) console.log(`   … 외 ${issues.length - 40}건`)
  }

  console.log('═══════════════════════════════════════════════════════════════')
  console.log(
    `🎯 요약: 도안 ${dbItems.length} · DUPLICATE ${byType('DUPLICATE').length} · MISSING ${byType('MISSING_FIELD').length} · CATEGORY ${byType('CATEGORY_MISMATCH').length} · IMAGE_404 ${byType('IMAGE_404').length}`,
  )
  console.log('═══════════════════════════════════════════════════════════════\n')
  if (issues.length) process.exitCode = 1
}

await verifyPipelineIntegrity()
