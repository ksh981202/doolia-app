/**
 * DOOLIA printables pipeline audit.
 * Usage: npx tsx scripts/verify-all-pipeline.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
const LOCALE_PREFIXES = ['title', 'description', 'parent_guide'] as const
const OFFICIAL_THEMES = [
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
] as const
const THEME_ALIASES: Record<string, (typeof OFFICIAL_THEMES)[number]> = {
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
const FOCUS_SLUGS = ['gl21', 'gl22', 'gl23', 'gl24', 'gl25', 'gl26', 'gl27', 'gl28', 'gl29', 'gl30']
const MIN_IMAGE_BYTES = 1024
const SOURCE_CHECKS = [
  {
    file: 'src/pages/PrintableDetailPage.tsx',
    needles: ['usePrintableQuery', 'A4Preview', 'detailTitle'],
  },
  {
    file: 'src/features/download/ui/DownloadModal.tsx',
    needles: ['printableViewUrl(printable, viewMode)', "setViewMode('bw')", "setViewMode('color')"],
  },
  {
    file: 'src/shared/utils/printableAssets.ts',
    needles: ['export function printableViewUrl', "mode === 'color'", 'printableLineArtUrl', 'printableColorUrl'],
  },
  {
    file: 'src/shared/store/useDownloadStore.ts',
    needles: ["viewMode: 'bw'", 'setViewMode'],
  },
  {
    file: 'src/admin/useBulkPrintableUpload.ts',
    needles: ['renameUploadFile', '${slug}_${variant}', 'uploadAdminFile', 'bwFiles', 'colorFiles'],
  },
  {
    file: 'src/services/adminPrintableService.ts',
    needles: ['convertToOptimizedWebP', 'uploadR2PrintableFile'],
  },
] as const

type PrintableRow = {
  id: string
  slug: string | null
  published: boolean | null
  category: string | null
  catalog_slug: string | null
  theme_en: string | null
  theme_ko: string | null
  age_group: string | null
  benefit_1: string | null
  benefit_2: string | null
  benefit_3: string | null
  image_bw_url: string | null
  image_color_url: string | null
  line_art_url: string | null
  color_image_url: string | null
  created_at: string | null
} & Record<string, string | boolean | null>

type Finding = { level: 'FAIL' | 'WARN' | 'INFO'; slug: string; message: string }

type ImageProbe = {
  url: string
  ok: boolean
  status: number
  contentType: string
  bytes: number
  webp: boolean
  error?: string
}

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    const path = resolve(process.cwd(), name)
    try {
      const text = readFileSync(path, 'utf8')
      for (const raw of text.split(/\r?\n/)) {
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
      /* optional env file */
    }
  }
}

function filled(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function slugIssues(slug: string) {
  const issues: string[] = []
  if (!slug) issues.push('slug 없음')
  if (/\s/.test(slug)) issues.push('slug에 공백')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) issues.push('slug 형식(영문·숫자·하이픈) 위반')
  return issues
}

function filenameFromUrl(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
  } catch {
    return url
  }
}

function expectedAssetName(slug: string, variant: 'b' | 'c') {
  return `${slug}_${variant}.webp`
}

function urlMatchesAsset(url: string, slug: string, variant: 'b' | 'c') {
  const name = filenameFromUrl(url).toLowerCase()
  return name === expectedAssetName(slug, variant) || new RegExp(`(^|[/_])${slug}_${variant}\\.(webp|jpe?g|png)$`, 'i').test(name)
}

async function probeImage(url: string): Promise<ImageProbe> {
  if (!url) {
    return { url, ok: false, status: 0, contentType: '', bytes: 0, webp: false, error: 'URL 없음' }
  }
  try {
    const head = await fetch(url, { method: 'HEAD' })
    const type = (head.headers.get('content-type') || '').split(';')[0].trim()
    const length = Number(head.headers.get('content-length') || 0)
    const get = await fetch(url, { headers: { Range: 'bytes=0-15' } })
    const chunk = new Uint8Array(await get.arrayBuffer())
    const ascii = Buffer.from(chunk.subarray(0, 12)).toString('ascii')
    const webp = ascii.startsWith('RIFF') && ascii.includes('WEBP')
    const bytes = length || Number(get.headers.get('content-range')?.split('/')[1] || chunk.byteLength)
    const status = head.ok ? head.status : get.status
    const ok = (head.ok || get.ok) && bytes >= MIN_IMAGE_BYTES && (type.includes('webp') || webp)
    return {
      url,
      ok,
      status,
      contentType: type || get.headers.get('content-type') || '',
      bytes,
      webp,
      error: ok ? undefined : `status=${status} type=${type || '-'} bytes=${bytes} webp=${webp}`,
    }
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      contentType: '',
      bytes: 0,
      webp: false,
      error: error instanceof Error ? error.message : 'fetch 실패',
    }
  }
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const out: R[] = []
  let index = 0
  async function run() {
    while (index < items.length) {
      const current = index
      index += 1
      out[current] = await worker(items[current])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return out
}

function staticSourceAudit() {
  const findings: Finding[] = []
  for (const check of SOURCE_CHECKS) {
    const path = resolve(process.cwd(), check.file)
    let source = ''
    try {
      source = readFileSync(path, 'utf8')
    } catch {
      findings.push({ level: 'FAIL', slug: 'source', message: `${check.file} 파일을 읽지 못했습니다.` })
      continue
    }
    for (const needle of check.needles) {
      if (!source.includes(needle)) {
        findings.push({ level: 'FAIL', slug: 'source', message: `${check.file}에 \`${needle}\` 경로가 없습니다.` })
      }
    }
  }
  if (!findings.length) {
    findings.push({
      level: 'INFO',
      slug: 'source',
      message: 'PrintableDetailPage / DownloadModal / printableViewUrl / 업로더 리네임 경로가 소스에 존재합니다.',
    })
  }
  return findings
}

function viewModeSwitch(row: PrintableRow) {
  const bw = row.image_bw_url || row.line_art_url || ''
  const color = row.image_color_url || row.color_image_url || ''
  return {
    bw,
    color,
    distinct: Boolean(bw && color && bw !== color),
  }
}

async function main() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다.')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('printables')
    .select(
      [
        'id',
        'slug',
        'published',
        'category',
        'catalog_slug',
        'theme_en',
        'theme_ko',
        'age_group',
        'benefit_1',
        'benefit_2',
        'benefit_3',
        'image_bw_url',
        'image_color_url',
        'line_art_url',
        'color_image_url',
        'created_at',
        ...LOCALE_PREFIXES.flatMap((prefix) => LOCALES.map((locale) => `${prefix}_${locale}`)),
      ].join(','),
    )
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Supabase 조회 실패:', error.message)
    process.exit(1)
  }

  const rows = (data ?? []) as PrintableRow[]
  const findings: Finding[] = []
  const slugCounts = new Map<string, number>()
  for (const row of rows) {
    const slug = (row.slug || '').trim()
    slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1)
  }

  for (const row of rows) {
    const slug = (row.slug || '').trim()
    const label = slug || row.id
    for (const issue of slugIssues(slug)) findings.push({ level: 'FAIL', slug: label, message: issue })
    if ((slugCounts.get(slug) || 0) > 1) findings.push({ level: 'FAIL', slug: label, message: 'slug 중복' })
    if (row.category !== 'coloring-pages') {
      findings.push({
        level: slug.startsWith('gl') ? 'FAIL' : 'WARN',
        slug: label,
        message: `category=${row.category || '(empty)'} (기대: coloring-pages)`,
      })
    }
    const theme = (row.theme_en || '').trim().toLowerCase()
    const aliased = THEME_ALIASES[theme]
    if (OFFICIAL_THEMES.includes(theme as (typeof OFFICIAL_THEMES)[number])) {
      /* canonical */
    } else if (aliased) {
      findings.push({
        level: 'WARN',
        slug: label,
        message: `theme_en="${row.theme_en}" 는 영문 라벨입니다. 공식 ID는 ${aliased}`,
      })
    } else {
      findings.push({
        level: slug.startsWith('gl') ? 'FAIL' : 'WARN',
        slug: label,
        message: `theme_en="${row.theme_en || ''}" 가 12대 공식 테마 ID와 불일치`,
      })
    }
    for (const prefix of LOCALE_PREFIXES) {
      const missing = LOCALES.filter((locale) => !filled(row[`${prefix}_${locale}`]))
      if (missing.length) {
        findings.push({
          level: 'FAIL',
          slug: label,
          message: `${prefix}_* 빈값: ${missing.join(', ')}`,
        })
      }
    }
    for (const key of ['benefit_1', 'benefit_2', 'benefit_3'] as const) {
      if (!filled(row[key])) findings.push({ level: 'FAIL', slug: label, message: `${key} 비어 있음` })
    }
    const switcher = viewModeSwitch(row)
    if (!switcher.bw) findings.push({ level: 'FAIL', slug: label, message: 'image_bw_url 없음' })
    if (!switcher.color) findings.push({ level: 'FAIL', slug: label, message: 'image_color_url 없음' })
    if (switcher.bw && switcher.color && !switcher.distinct) {
      findings.push({ level: 'FAIL', slug: label, message: '흑백/컬러 URL이 동일합니다 (토글 무의미)' })
    }
    if (switcher.bw && !urlMatchesAsset(switcher.bw, slug, 'b')) {
      findings.push({ level: 'FAIL', slug: label, message: `흑백 파일명 불일치: ${filenameFromUrl(switcher.bw)}` })
    }
    if (switcher.color && !urlMatchesAsset(switcher.color, slug, 'c')) {
      findings.push({ level: 'FAIL', slug: label, message: `컬러 파일명 불일치: ${filenameFromUrl(switcher.color)}` })
    }
  }

  const imageJobs = rows.flatMap((row) => {
    const slug = (row.slug || row.id).trim()
    return [
      { slug, kind: 'bw' as const, url: row.image_bw_url || '' },
      { slug, kind: 'color' as const, url: row.image_color_url || '' },
    ]
  })
  const probes = await mapPool(imageJobs, 6, async (job) => ({ ...job, probe: await probeImage(job.url) }))
  const probeByKey = new Map(probes.map((item) => [`${item.slug}:${item.kind}`, item.probe]))

  for (const job of probes) {
    if (!job.probe.ok) {
      findings.push({
        level: 'FAIL',
        slug: job.slug,
        message: `${job.kind} 이미지 실패: ${job.probe.error || job.probe.status}`,
      })
    }
  }

  for (const row of rows) {
    const slug = (row.slug || '').trim()
    const bw = probeByKey.get(`${slug}:bw`)
    const color = probeByKey.get(`${slug}:color`)
    if (bw?.ok && color?.ok && color.bytes > 0 && bw.bytes > color.bytes * 2.2) {
      findings.push({
        level: 'WARN',
        slug,
        message: `용량 이상(흑백 ${bw.bytes}B > 컬러 ${color.bytes}B ×2.2). 뒤바뀜 가능성 재확인`,
      })
    }
  }

  findings.push(...staticSourceAudit())

  const glRows = rows.filter((row) => /^gl\d+$/i.test(row.slug || ''))
  const glNumbers = glRows
    .map((row) => Number((row.slug || '').replace(/^gl/i, '')))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
  const missingFocus = FOCUS_SLUGS.filter((slug) => !rows.some((row) => row.slug === slug))
  for (const slug of missingFocus) {
    findings.push({ level: 'INFO', slug, message: 'DB에 아직 등록되지 않음' })
  }

  const fails = findings.filter((item) => item.level === 'FAIL')
  const warns = findings.filter((item) => item.level === 'WARN')
  const infos = findings.filter((item) => item.level === 'INFO')
  const focusRows = FOCUS_SLUGS.map((slug) => rows.find((row) => row.slug === slug)).filter(Boolean) as PrintableRow[]

  console.log('============================================================')
  console.log('DOOLIA 업로드/미디어/DB 파이프라인 점검 보고서')
  console.log(new Date().toISOString())
  console.log('============================================================')
  console.log(`DB 전체 행: ${rows.length}`)
  console.log(`GL 시리즈: ${glRows.length}건 (gl${glNumbers[0] ?? '-'} ~ gl${glNumbers.at(-1) ?? '-'})`)
  console.log(`판정: FAIL ${fails.length} / WARN ${warns.length} / INFO ${infos.length}`)
  console.log('')

  console.log('[1] DB 컬럼 매핑')
  console.log(
    [
      'slug'.padEnd(8),
      'cat'.padEnd(16),
      'theme'.padEnd(14),
      'locale'.padEnd(8),
      'benefit',
    ].join(' '),
  )
  for (const row of rows) {
    const slug = (row.slug || '').trim()
    const localeOk = LOCALE_PREFIXES.every((prefix) => LOCALES.every((locale) => filled(row[`${prefix}_${locale}`])))
    const benefitOk = filled(row.benefit_1) && filled(row.benefit_2) && filled(row.benefit_3)
    console.log(
      [
        slug.padEnd(8),
        (row.category || '-').padEnd(16),
        (row.theme_en || '-').padEnd(14),
        (localeOk ? '30/30' : 'GAP').padEnd(8),
        benefitOk ? '3/3' : 'GAP',
      ].join(' '),
    )
  }

  console.log('')
  console.log('[2] R2/CDN 이미지')
  console.log(
    ['slug'.padEnd(8), 'kind'.padEnd(6), 'status'.padEnd(7), 'type'.padEnd(14), 'bytes'.padEnd(10), 'webp', 'file'].join(
      ' ',
    ),
  )
  for (const job of probes) {
    const name = filenameFromUrl(job.url)
    console.log(
      [
        job.slug.padEnd(8),
        job.kind.padEnd(6),
        String(job.probe.status).padEnd(7),
        (job.probe.contentType || '-').padEnd(14),
        String(job.probe.bytes).padEnd(10),
        String(job.probe.webp).padEnd(5),
        name,
      ].join(' '),
    )
  }

  console.log('')
  console.log('[3] 흑백/컬러 페어링 (포커스 gl21-gl30)')
  if (!focusRows.length) {
    console.log('포커스 slug 중 등록된 행이 없습니다.')
  }
  for (const row of focusRows) {
    const slug = row.slug || ''
    const bw = probeByKey.get(`${slug}:bw`)
    const color = probeByKey.get(`${slug}:color`)
    const switcher = viewModeSwitch(row)
    const pairOk =
      urlMatchesAsset(switcher.bw, slug, 'b') &&
      urlMatchesAsset(switcher.color, slug, 'c') &&
      switcher.distinct &&
      Boolean(bw?.ok && color?.ok)
    console.log(
      `${slug}  ${pairOk ? 'PAIR_OK' : 'PAIR_FAIL'}  bw=${filenameFromUrl(switcher.bw)}  color=${filenameFromUrl(switcher.color)}  viewMode.bw≠color=${switcher.distinct}`,
    )
  }
  for (const slug of missingFocus) {
    console.log(`${slug}  NOT_IN_DB`)
  }

  console.log('')
  console.log('[4] 상세/모달 정적 호환성')
  for (const item of findings.filter((finding) => finding.slug === 'source')) {
    console.log(`${item.level}  ${item.message}`)
  }
  const switchFails = rows.filter((row) => !viewModeSwitch(row).distinct)
  console.log(
    switchFails.length
      ? `viewMode 토글 실패 후보: ${switchFails.map((row) => row.slug).join(', ')}`
      : '전 행 viewMode(bw/color) URL이 서로 다릅니다.',
  )

  console.log('')
  console.log('[이슈 목록]')
  if (!findings.filter((item) => item.level !== 'INFO').length) {
    console.log('FAIL/WARN 없음')
  }
  for (const item of findings) {
    if (item.level === 'INFO' && !FOCUS_SLUGS.includes(item.slug) && item.slug !== 'source') continue
    console.log(`${item.level.padEnd(4)}  ${item.slug.padEnd(10)}  ${item.message}`)
  }

  console.log('')
  console.log(fails.length ? '결과: FAIL — 위 항목을 수정하세요.' : warns.length ? '결과: PASS(경고 있음)' : '결과: PASS')
  process.exit(fails.length ? 1 : 0)
}

void main()
