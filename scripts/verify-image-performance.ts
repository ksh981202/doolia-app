/**
 * Measures printable image download performance and inspects card loading hints.
 * Usage: npx tsx scripts/verify-image-performance.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 500
const SAMPLE_SIZE = 25
const CONCURRENCY = 6
const TIMEOUT_MS = 30_000
const LARGE_IMAGE_BYTES = 200 * 1024

type PrintableRow = {
  id: string
  slug: string | null
  title_ko: string | null
  created_at: string | null
  image_bw_url: string | null
  image_color_url: string | null
}

type ImageResult = {
  slug: string
  title: string
  kind: 'color' | 'bw'
  url: string
  status: number | 'ERROR'
  bytes: number
  ttfbMs: number | null
  downloadMs: number | null
  cacheStatus: string
  cacheControl: string
  contentType: string
  error: string | null
}

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    const path = resolve(process.cwd(), name)
    if (!existsSync(path)) continue

    for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
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
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

function safeUrl(value: string) {
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    return '(invalid URL)'
  }
}

async function getAllPrintables() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase URL/key가 없습니다. .env의 VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY를 확인하세요.',
    )
  }

  const supabase = createClient(url, key)
  const rows: PrintableRow[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('printables')
      .select('id, slug, title_ko, created_at, image_bw_url, image_color_url')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw new Error(`Supabase 도안 조회 실패: ${error.message}`)
    if (!data) throw new Error('Supabase 도안 조회 결과가 비어 있습니다.')

    rows.push(...(data as PrintableRow[]))
    if (data.length < PAGE_SIZE) break
  }
  return rows
}

function chooseSample(rows: PrintableRow[]) {
  const count = Math.min(SAMPLE_SIZE, rows.length)
  if (count === rows.length) return rows
  return Array.from({ length: count }, (_, index) => {
    const rowIndex = Math.round((index * (rows.length - 1)) / (count - 1))
    return rows[rowIndex]
  })
}

async function measureImage(
  row: PrintableRow,
  kind: 'color' | 'bw',
  rawUrl: string,
): Promise<ImageResult> {
  const result: ImageResult = {
    slug: row.slug || row.id,
    title: row.title_ko || '(제목 없음)',
    kind,
    url: safeUrl(rawUrl),
    status: 'ERROR',
    bytes: 0,
    ttfbMs: null,
    downloadMs: null,
    cacheStatus: '-',
    cacheControl: '-',
    contentType: '-',
    error: null,
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const startedAt = performance.now()

  try {
    const response = await fetch(rawUrl, { signal: controller.signal })
    const headersAt = performance.now()
    result.status = response.status
    result.ttfbMs = headersAt - startedAt
    result.cacheStatus = response.headers.get('cf-cache-status') || '(없음)'
    result.cacheControl = response.headers.get('cache-control') || '(없음)'
    result.contentType = response.headers.get('content-type') || '(없음)'

    if (response.body) {
      const reader = response.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          result.bytes += value.byteLength
        }
      } finally {
        reader.releaseLock()
      }
    }
    result.downloadMs = performance.now() - startedAt
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
    result.downloadMs = performance.now() - startedAt
  } finally {
    clearTimeout(timeout)
  }

  return result
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const output = new Array<R>(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next++
      output[index] = await worker(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return output
}

function inspectCardLoading() {
  const path = resolve(process.cwd(), 'src/components/PrintableCard.tsx')
  if (!existsSync(path)) {
    console.log('\n[프론트엔드 이미지 태그] src/components/PrintableCard.tsx를 찾지 못했습니다.')
    return
  }

  const source = readFileSync(path, 'utf8')
  const imgTag = source.match(/<img\b[\s\S]*?>/)?.[0]
  if (!imgTag) {
    console.log('\n[프론트엔드 이미지 태그] img 태그를 찾지 못했습니다.')
    return
  }

  const loading = imgTag.match(/\bloading\s*=\s*\{([^}]+)\}/)?.[1]?.trim()
  const fetchPriority = imgTag.match(/\bfetchpriority\s*:\s*([^,}]+)/)?.[1]?.trim()
  console.log('\n[프론트엔드 이미지 태그] src/components/PrintableCard.tsx')
  console.log(`  loading: ${loading ? `{${loading}}` : '(설정 없음)'}`)
  console.log(`  fetchpriority: ${fetchPriority || '(설정 없음)'}`)
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

function formatMs(value: number | null) {
  return value === null ? '-' : `${value.toFixed(1)} ms`
}

async function main() {
  loadEnv()
  console.log('=== DOOLIA 도안 이미지 성능 및 CDN 응답 정밀 진단 ===')

  const allRows = await getAllPrintables()
  const sample = chooseSample(allRows)
  const imageTargets = sample.flatMap((row) =>
    ([
      ['color', row.image_color_url],
      ['bw', row.image_bw_url],
    ] as const)
      .filter((entry): entry is readonly ['color' | 'bw', string] =>
        Boolean(entry[1]?.trim()),
      )
      .map(([kind, imageUrl]) => ({ row, kind, imageUrl })),
  )
  const missingUrls = sample.reduce(
    (count, row) =>
      count + Number(!row.image_color_url?.trim()) + Number(!row.image_bw_url?.trim()),
    0,
  )

  console.log(
    `DB 등록 ${allRows.length}개 중 ${sample.length}개 도안 표본 · 이미지 URL ${imageTargets.length}개 측정 · URL 누락 ${missingUrls}개`,
  )
  console.log(`실제 GET 다운로드 · 동시 측정 ${CONCURRENCY}개 · 제한 시간 ${TIMEOUT_MS / 1000}초`)
  console.log('\n[이미지별 결과]')

  const results = await mapPool(imageTargets, CONCURRENCY, ({ row, kind, imageUrl }) =>
    measureImage(row, kind, imageUrl),
  )
  for (const result of results) {
    const status = result.status === 'ERROR' ? 'ERROR' : `HTTP ${result.status}`
    const sizeKB = `${(result.bytes / 1024).toFixed(1)} KB`
    console.log(
      `  ${status.padEnd(9)} ${result.slug} [${result.kind}] ${sizeKB} (${result.bytes.toLocaleString()} B) · TTFB ${formatMs(result.ttfbMs)} · 전체 ${formatMs(result.downloadMs)}`,
    )
    console.log(
      `    ${result.url} · cf-cache-status: ${result.cacheStatus} · cache-control: ${result.cacheControl}`,
    )
    if (result.status === 'ERROR') console.log(`    오류: ${result.error}`)
    if (result.bytes >= LARGE_IMAGE_BYTES) {
      console.log('    ⚠ 200 KB 이상 고용량 이미지')
    }
  }

  const successful = results.filter(
    (result) => typeof result.status === 'number' && result.status >= 200 && result.status < 300,
  )
  const failures = results.filter(
    (result) => result.status === 'ERROR' || result.status < 200 || result.status >= 300,
  )
  const large = successful.filter((result) => result.bytes >= LARGE_IMAGE_BYTES)
  const ttfbValues = successful.flatMap((result) =>
    result.ttfbMs === null ? [] : [result.ttfbMs],
  )
  const downloadValues = successful.flatMap((result) =>
    result.downloadMs === null ? [] : [result.downloadMs],
  )
  const cacheHits = results.filter((result) => result.cacheStatus.toLowerCase() === 'hit').length
  const cacheMisses = results.filter(
    (result) => result.cacheStatus.toLowerCase() === 'miss',
  ).length
  const cacheDynamics = results.filter(
    (result) => result.cacheStatus.toLowerCase() === 'dynamic',
  ).length

  console.log('\n[요약]')
  console.log(`  성공 HTTP 2xx: ${successful.length}/${results.length} · 실패/비2xx: ${failures.length}`)
  console.log(
    `  평균 TTFB: ${formatMs(average(ttfbValues))} · 평균 전체 다운로드: ${formatMs(average(downloadValues))}`,
  )
  console.log(
    `  200 KB 이상: ${large.length}개${large.length ? ` (${large.map((item) => `${item.slug}/${item.kind} ${(item.bytes / 1024).toFixed(1)} KB`).join(', ')})` : ''}`,
  )
  console.log(
    `  Cloudflare 캐시: HIT ${cacheHits} · MISS ${cacheMisses} · DYNAMIC ${cacheDynamics} · 기타/헤더 없음 ${results.length - cacheHits - cacheMisses - cacheDynamics}`,
  )
  console.log(`  이미지 URL 누락: ${missingUrls}개`)

  inspectCardLoading()

  if (failures.length || missingUrls) process.exitCode = 1
}

await main()
