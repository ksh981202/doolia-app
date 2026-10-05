/**
 * Storage, bandwidth, CDN cache, and frontend serving audit.
 * Usage: npx tsx scripts/verify-storage-and-speed.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type Finding = { level: 'PASS' | 'FAIL' | 'WARN' | 'INFO'; area: string; message: string }
type AssetProbe = {
  slug: string
  kind: 'bw' | 'color'
  url: string
  status: number
  bytes: number
  contentType: string
  cacheControl: string
  etag: string
  age: string
}

const findings: Finding[] = []
const R2_STORAGE_USD_PER_GB = 0.015
const R2_CLASS_B_USD_PER_MILLION = 0.36

function note(level: Finding['level'], area: string, message: string) {
  findings.push({ level, area, message })
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

function readSrc(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), 'utf8')
}

function stats(values: number[]) {
  if (!values.length) return { n: 0, min: 0, max: 0, avg: 0, median: 0, sum: 0 }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  const sum = sorted.reduce((acc, n) => acc + n, 0)
  return { n: sorted.length, min: sorted[0], max: sorted[sorted.length - 1], avg: sum / sorted.length, median, sum }
}

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)}KB`
}

function mb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

function usd(value: number) {
  if (value < 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(2)}`
}

function isLongCache(header: string) {
  const value = header.toLowerCase()
  return value.includes('max-age=31536000') || /max-age=(\d+)/.exec(value)?.[1] === '31536000'
}

function isNoCache(header: string) {
  const value = header.toLowerCase()
  return value.includes('max-age=0') || value.includes('no-store') || value.includes('must-revalidate')
}

async function probeUrl(url: string): Promise<Omit<AssetProbe, 'slug' | 'kind'>> {
  const res = await fetch(url, { method: 'HEAD' })
  let bytes = Number(res.headers.get('content-length') || 0)
  if (!bytes) {
    const get = await fetch(url)
    bytes = Number(get.headers.get('content-length') || (await get.arrayBuffer()).byteLength)
  }
  return {
    url,
    status: res.status,
    bytes,
    contentType: (res.headers.get('content-type') || '').split(';')[0],
    cacheControl: res.headers.get('cache-control') || '',
    etag: res.headers.get('etag') || '',
    age: res.headers.get('age') || '',
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

function staticFrontendAudit() {
  const card = readSrc('src/components/PrintableCard.tsx')
  const assets = readSrc('src/shared/utils/printableAssets.ts')
  const grid = readSrc('src/features/gallery/ui/PrintableGrid.tsx')
  const preview = readSrc('src/components/detail/A4Preview.tsx')
  const modal = readSrc('src/features/download/ui/DownloadModal.tsx')
  const r2 = readSrc('server/r2Media.ts')
  const envExample = readSrc('.env.example')

  if (card.includes('loading="lazy"') && card.includes('decoding="async"')) {
    note('PASS', 'grid', 'PrintableCard에 loading=lazy, decoding=async가 있습니다.')
  } else {
    note('FAIL', 'grid', '카드 지연 로딩 속성이 없습니다.')
  }
  if (card.includes('aspect-[3/4]')) {
    note('PASS', 'cls', '카드 이미지 영역이 aspect-[3/4]로 고정되어 있습니다.')
  } else {
    note('WARN', 'cls', '카드 종횡비 고정이 없습니다.')
  }
  if (grid.includes('animate-pulse') && grid.includes('aspect-[3/4]')) {
    note('PASS', 'cls', '목록 스켈레톤이 aspect-[3/4]로 CLS를 막습니다.')
  }
  if (card.includes('new Image()') && card.includes('onPointerDown')) {
    note('INFO', 'grid', '카드 hover/pointerdown 시 흑백 미리보기 URL을 한 장 더 prefetch합니다.')
  }
  if (assets.includes('isR2ObjectHost') && assets.includes('return false')) {
    note(
      'WARN',
      'cdn',
      'r2.dev 호스트는 Cloudflare Image Resizing 대상이 아닙니다. VITE_IMAGE_RESIZE_ORIGIN이 없으면 카드가 원본 WebP를 받습니다.',
    )
  }
  if (!envExample.includes('VITE_IMAGE_RESIZE_ORIGIN')) {
    note('WARN', 'cdn', '.env.example에 VITE_IMAGE_RESIZE_ORIGIN이 없습니다. 리사이즈 존 미설정 가능성이 큽니다.')
  }
  if (preview.includes("loading=\"eager\"") && preview.includes("fetchpriority: 'high'")) {
    note('PASS', 'detail', '상세 A4 뷰어는 eager + fetchpriority=high입니다.')
  } else {
    note('WARN', 'detail', '상세 대표 이미지 우선 로딩 속성이 약합니다.')
  }
  if (preview.includes('prefetchImage') && preview.includes('THUMB_WIDTH')) {
    note('INFO', 'detail', '상세는 반대 모드/썸네일을 prefetch합니다. 토글 체감은 빠르고 첫 페인트는 요청이 늘어납니다.')
  }
  if (modal.includes('getDisplayImageUrl(originalSrc') && modal.includes('printableViewUrl(printable, viewMode)')) {
    note('PASS', 'modal', '다운로드 모달 화면은 display URL, 인쇄/PDF는 원본 URL을 씁니다.')
  } else {
    note('WARN', 'modal', '다운로드 모달 프리뷰가 원본 URL을 그대로 쓸 수 있습니다.')
  }
  if (r2.includes('PRINTABLE_CACHE_CONTROL') && r2.includes('max-age=31536000') && r2.includes('immutable')) {
    note('PASS', 'cache', '신규 도안 업로드는 장기 immutable Cache-Control을 붙입니다. ?v= 로 덮어쓰기를 무효화합니다.')
  } else {
    note('FAIL', 'cache', '도안 업로드 Cache-Control이 장기 캐시가 아닙니다.')
  }
  if (r2.includes("CacheControl: 'public, max-age=0, must-revalidate'")) {
    note('WARN', 'cache', 'max-age=0 업로드 경로가 남아 있습니다.')
  }
}

async function qualityCompare(samples: { label: string; url: string }[]) {
  const dir = mkdtempSync(join(tmpdir(), 'doolia-q-'))
  try {
    const local: [string, string][] = []
    for (const sample of samples) {
      const res = await fetch(sample.url)
      if (!res.ok) throw new Error(`${sample.label} 다운로드 실패 HTTP ${res.status}`)
      const dest = join(dir, `${sample.label.replace(/[^\w.-]+/g, '_')}.webp`)
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
      local.push([sample.label, dest])
    }
    const py = join(dir, 'compare.py')
    writeFileSync(
      py,
      `
import json, sys
from io import BytesIO
from PIL import Image, ImageFilter, ImageStat

def sharpness(im):
    edges = im.convert('L').filter(ImageFilter.FIND_EDGES)
    return round(ImageStat.Stat(edges).stddev[0], 2)

def run(path):
    raw = open(path, 'rb').read()
    im = Image.open(BytesIO(raw)).convert('RGB')
    rows = []
    for q in (85, 90, 94):
        buf = BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        data = buf.getvalue()
        back = Image.open(BytesIO(data)).convert('RGB')
        rows.append({
            'q': q,
            'bytes': len(data),
            'w': back.size[0],
            'h': back.size[1],
            'sharp': sharpness(back),
        })
    return {
        'src_bytes': len(raw),
        'w': im.size[0],
        'h': im.size[1],
        'src_sharp': sharpness(im),
        'rows': rows,
    }

print(json.dumps({label: run(path) for label, path in json.loads(sys.argv[1])}))
`,
    )
    return JSON.parse(execFileSync('python', [py, JSON.stringify(local)], { encoding: 'utf8' })) as Record<
      string,
      { src_bytes: number; w: number; h: number; src_sharp: number; rows: { q: number; bytes: number; sharp: number }[] }
    >
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function main() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 필요합니다.')
    process.exit(1)
  }

  console.log('============================================================')
  console.log('DOOLIA 용량 / 속도 / CDN 캐시 종합 점검')
  console.log(new Date().toISOString())
  console.log('============================================================')

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('printables')
    .select('slug, image_bw_url, image_color_url')
    .order('slug')
  if (error || !data?.length) {
    console.error('printables 조회 실패:', error?.message || '행 없음')
    process.exit(1)
  }

  const jobs = data.flatMap((row) => [
    { slug: String(row.slug), kind: 'bw' as const, url: String(row.image_bw_url || '') },
    { slug: String(row.slug), kind: 'color' as const, url: String(row.image_color_url || '') },
  ])
  const probes = await mapPool(jobs, 8, async (job) => ({ ...job, ...(await probeUrl(job.url)) }))

  const bw = probes.filter((item) => item.kind === 'bw' && item.bytes > 0)
  const color = probes.filter((item) => item.kind === 'color' && item.bytes > 0)
  const all = [...bw, ...color]
  const bwS = stats(bw.map((item) => item.bytes))
  const colorS = stats(color.map((item) => item.bytes))
  const allS = stats(all.map((item) => item.bytes))
  const pairBytes = data.map((row) => {
    const a = probes.find((item) => item.slug === row.slug && item.kind === 'bw')?.bytes || 0
    const b = probes.find((item) => item.slug === row.slug && item.kind === 'color')?.bytes || 0
    return a + b
  })
  const pairS = stats(pairBytes)

  console.log('')
  console.log(`[A] 스토리지 실측  (${data.length}도안 / ${all.length}장)`)
  console.log('구분     n    최소      중앙값    평균      최대      합계')
  for (const [label, s] of [
    ['흑백', bwS],
    ['컬러', colorS],
    ['전체', allS],
    ['도안쌍', pairS],
  ] as const) {
    console.log(
      `${label.padEnd(6)} ${String(s.n).padEnd(4)} ${kb(s.min).padEnd(8)} ${kb(s.median).padEnd(8)} ${kb(s.avg).padEnd(8)} ${kb(s.max).padEnd(8)} ${mb(s.sum)}`,
    )
  }

  const perPair = pairS.avg
  for (const n of [1_000, 10_000]) {
    const images = n * 2
    const bytes = perPair * n
    const storageMo = (bytes / (1024 * 1024 * 1024)) * R2_STORAGE_USD_PER_GB
    const views = n * 200
    const classB = (views / 1_000_000) * R2_CLASS_B_USD_PER_MILLION
    console.log(
      `추정 ${n.toLocaleString()}도안(${images.toLocaleString()}장): 저장 ${mb(bytes)} / R2 storage ${usd(storageMo)}/월 / 도안당 200뷰 Class B ${usd(classB)}/월 (R2 egress $0)`,
    )
  }

  const cacheHeaders = new Map<string, number>()
  for (const item of probes) {
    const key = item.cacheControl || '(없음)'
    cacheHeaders.set(key, (cacheHeaders.get(key) || 0) + 1)
  }
  console.log('')
  console.log('[C] 라이브 Cache-Control')
  for (const [header, count] of cacheHeaders) {
    console.log(`  ${count}장  ${header}`)
  }
  const noCacheCount = probes.filter((item) => isNoCache(item.cacheControl)).length
  const longCount = probes.filter((item) => isLongCache(item.cacheControl)).length
  if (noCacheCount) {
    note('WARN', 'cache', `라이브 도안 ${noCacheCount}/${probes.length}장이 단기/재검증 캐시입니다.`)
  }
  if (longCount) {
    note('PASS', 'cache', `장기 immutable 캐시 ${longCount}장`)
  }
  const etagCount = probes.filter((item) => item.etag).length
  note(
    etagCount ? 'INFO' : 'WARN',
    'cache',
    longCount
      ? `ETag ${etagCount}/${probes.length}장. 장기 캐시가 켜져 재방문은 브라우저/CDN 캐시를 씁니다.`
      : `ETag ${etagCount}/${probes.length}장. max-age=0이면 매 요청마다 재검증합니다.`,
  )

  const sampleBw = [...bw].sort((a, b) => b.bytes - a.bytes)[0]
  const sampleColor = [...color].sort((a, b) => b.bytes - a.bytes)[0]
  const sampleSmall = [...bw].sort((a, b) => a.bytes - b.bytes)[0]
  console.log('')
  console.log('[A] WebP quality 재압축 비교 (기존 WebP 디코드 후 85/90/94)')
  const compared = await qualityCompare([
    { label: `${sampleBw.slug}_b`, url: sampleBw.url },
    { label: `${sampleColor.slug}_c`, url: sampleColor.url },
    { label: `${sampleSmall.slug}_b_small`, url: sampleSmall.url },
  ])
  for (const [label, item] of Object.entries(compared)) {
    const q94 = item.rows.find((row) => row.q === 94)
    const q90 = item.rows.find((row) => row.q === 90)
    const q85 = item.rows.find((row) => row.q === 85)
    console.log(
      `  ${label} 원본 ${kb(item.src_bytes)} ${item.w}x${item.h} sharp=${item.src_sharp} | q85 ${kb(q85?.bytes || 0)} sharp=${q85?.sharp} | q90 ${kb(q90?.bytes || 0)} sharp=${q90?.sharp} | q94 ${kb(q94?.bytes || 0)} sharp=${q94?.sharp}`,
    )
  }
  const first = Object.values(compared)[0]
  if (first) {
    const q85 = first.rows.find((row) => row.q === 85)
    const q94 = first.rows.find((row) => row.q === 94)
    if (q85 && q94) {
      const save = 1 - q85.bytes / q94.bytes
      note(
        'INFO',
        'quality',
        `재압축 기준 q94→q85 약 ${(save * 100).toFixed(0)}% 용량 감소. 선명도 ${q94.sharp}→${q85.sharp}. 인쇄 원본은 q94 유지, 화면 썸네일은 리사이즈가 더 큼.`,
      )
    }
  }

  staticFrontendAudit()

  console.log('')
  console.log('[B/C] 프론트·CDN 정적 점검')
  const fails = findings.filter((item) => item.level === 'FAIL')
  const warns = findings.filter((item) => item.level === 'WARN')
  for (const item of findings) {
    console.log(`${item.level.padEnd(4)}  [${item.area}]  ${item.message}`)
  }
  console.log('')
  console.log(`판정: FAIL ${fails.length} / WARN ${warns.length}`)
  console.log(fails.length ? '결과: FAIL' : warns.length ? '결과: PASS(경고 있음 — 개선 권고)' : '결과: PASS')
  process.exit(fails.length ? 1 : 0)
}

void main()
