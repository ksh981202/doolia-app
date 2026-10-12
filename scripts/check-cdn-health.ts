/**
 * Read-only DNS, CDN response, R2 image comparison, and frontend URL audit.
 * Usage: npx tsx scripts/check-cdn-health.ts
 */
import { lookup as systemLookup } from 'node:dns/promises'
import { existsSync, readFileSync } from 'node:fs'
import { request as httpsRequest, type RequestOptions } from 'node:https'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { createClient } from '@supabase/supabase-js'

const CDN_HOST = 'cdn.doolia.app'
const CDN_ROOT = `https://${CDN_HOST}/`
const SAMPLE_SIZE = 5
const TIMEOUT_MS = 20_000

type PrintableRow = {
  id: string
  slug: string | null
  title_ko: string | null
  image_color_url: string | null
  image_bw_url: string | null
  line_art_url?: string | null
  color_image_url?: string | null
}

type ProbeResult = {
  status: number | string
  ttfbMs: number | null
  totalMs: number | null
  bytes: number
  cache: string
  cacheControl: string
  finalUrl: string
  error: string | null
}

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    const file = resolve(process.cwd(), name)
    if (!existsSync(file)) continue
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
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

function displayUrl(value: string) {
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    return '(invalid URL)'
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function publicDnsLookup(hostname: string) {
  const response = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  )
  if (!response.ok) throw new Error(`Google DNS-over-HTTPS HTTP ${response.status}`)
  const result = (await response.json()) as {
    Status?: number
    Answer?: Array<{ type?: number; data?: string }>
  }
  if (result.Status !== 0) throw new Error(`Google DNS-over-HTTPS DNS status ${result.Status}`)
  return (result.Answer || [])
    .filter((answer) => answer.type === 1 && answer.data)
    .map((answer) => answer.data as string)
}

function probe(
  url: string,
  cdnAddresses: string[],
  started = performance.now(),
  redirects = 0,
): Promise<ProbeResult> {
  return new Promise((resolveProbe) => {
    const target = new URL(url)
    const options: RequestOptions = {
      hostname: target.hostname,
      port: target.port ? Number(target.port) : 443,
      method: 'GET',
      path: `${target.pathname}${target.search}`,
      servername: target.hostname,
      timeout: TIMEOUT_MS,
    }
    if (target.hostname === CDN_HOST && cdnAddresses.length) {
      options.lookup = (_hostname, lookupOptions, callback) => {
        const entries = cdnAddresses.map((address) => ({
          address,
          family: address.includes(':') ? 6 : 4,
        }))
        if (typeof lookupOptions === 'object' && lookupOptions.all) {
          callback(null, entries)
        } else {
          callback(null, entries[0].address, entries[0].family)
        }
      }
    }

    const request = httpsRequest(options, (response) => {
      const location = response.headers.location
      if (
        location &&
        response.statusCode !== undefined &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        redirects < 5
      ) {
        response.resume()
        response.on('end', () => {
          const redirectedUrl = new URL(location, url).toString()
          void probe(redirectedUrl, cdnAddresses, started, redirects + 1).then(resolveProbe)
        })
        return
      }

      const ttfbMs = performance.now() - started
      let bytes = 0
      response.on('data', (chunk: Buffer | string) => {
        bytes += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk)
      })
      response.on('end', () => {
        resolveProbe({
          status: response.statusCode || 'ERROR',
          ttfbMs,
          totalMs: performance.now() - started,
          bytes,
          cache: response.headers['cf-cache-status']?.toString() || '(없음)',
          cacheControl: response.headers['cache-control']?.toString() || '(없음)',
          finalUrl: displayUrl(url),
          error: null,
        })
      })
      response.on('error', (error) => {
        resolveProbe({
          status: 'ERROR',
          ttfbMs,
          totalMs: performance.now() - started,
          bytes,
          cache: '-',
          cacheControl: '-',
          finalUrl: displayUrl(url),
          error: errorMessage(error),
        })
      })
    })

    request.setTimeout(TIMEOUT_MS, () => request.destroy(new Error(`요청 제한 시간 ${TIMEOUT_MS}ms 초과`)))
    request.on('error', (error) => {
      resolveProbe({
        status: 'ERROR',
        ttfbMs: null,
        totalMs: performance.now() - started,
        bytes: 0,
        cache: '-',
        cacheControl: '-',
        finalUrl: displayUrl(url),
        error: errorMessage(error),
      })
    })
    request.end()
  })
}

async function getSamples() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL/key를 찾지 못했습니다. 프로젝트 .env를 확인하세요.')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('printables')
    .select('id, slug, title_ko, image_color_url, image_bw_url, color_image_url, line_art_url')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error(`Supabase 샘플 조회 실패: ${error.message}`)
  if (!data) throw new Error('Supabase 샘플 조회 결과가 비어 있습니다.')

  const rows = data as PrintableRow[]
  const samples = rows.flatMap((row) => {
    const color = row.image_color_url || row.color_image_url
    const bw = row.image_bw_url || row.line_art_url
    const imageUrl = color || bw
    return imageUrl
      ? [
          {
            label: row.slug || row.id,
            title: row.title_ko || '(제목 없음)',
            kind: color ? 'color' : 'bw',
            url: imageUrl,
          },
        ]
      : []
  })
  if (!samples.length) throw new Error('Supabase에서 유효한 이미지 URL을 찾지 못했습니다.')
  return samples.slice(0, SAMPLE_SIZE)
}

function cdnUrlFor(originUrl: string) {
  const source = new URL(originUrl)
  if (!source.hostname.endsWith('.r2.dev') && !source.hostname.endsWith('.r2.cloudflarestorage.com')) {
    throw new Error(`샘플 이미지가 R2 원본 도메인이 아닙니다: ${source.hostname}`)
  }
  source.hostname = CDN_HOST
  source.protocol = 'https:'
  return source.toString()
}

function frontendAudit() {
  const assetPath = resolve(process.cwd(), 'src/shared/utils/printableAssets.ts')
  if (!existsSync(assetPath)) throw new Error(`프론트엔드 이미지 헬퍼를 찾지 못했습니다: ${assetPath}`)
  const source = readFileSync(assetPath, 'utf8')
  const configuredHostMatch = source.match(/new Set\(\[([^\]]+)\]\)/)
  const configuredHosts = configuredHostMatch
    ? [...configuredHostMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
    : []
  const hasR2HostCheck = /function isR2ObjectHost[\s\S]*?return hostname\.endsWith\('\.r2\.dev'\)[\s\S]*?hostname\.endsWith\('\.r2\.cloudflarestorage\.com'\)/.test(
    source,
  )
  const resizeOrigin = process.env.VITE_IMAGE_RESIZE_ORIGIN?.trim().replace(/\/$/, '') || ''
  const publicBase = process.env.VITE_R2_PUBLIC_BASE_URL?.trim() || ''
  let publicBaseHost = ''
  try {
    publicBaseHost = new URL(publicBase).hostname
    if (!publicBaseHost.endsWith('.r2.dev') && !publicBaseHost.endsWith('.r2.cloudflarestorage.com')) {
      configuredHosts.push(publicBaseHost)
    }
  } catch {
    if (publicBase) console.log('  VITE_R2_PUBLIC_BASE_URL: 설정값이 URL 형식이 아닙니다.')
  }
  try {
    if (resizeOrigin) configuredHosts.push(new URL(resizeOrigin).hostname)
  } catch {
    console.log('  VITE_IMAGE_RESIZE_ORIGIN: 설정값이 URL 형식이 아닙니다.')
  }

  const cdnIsAllowlisted = configuredHosts.includes(CDN_HOST)
  const r2PassesThrough = hasR2HostCheck && !resizeOrigin
  console.log('\n[프론트엔드 이미지 URL 변환 로직]')
  console.log(`  구현 파일: src/shared/utils/printableAssets.ts (getDisplayImageUrl)`)
  console.log(`  기본 허용 CDN 호스트: ${configuredHostMatch ? configuredHostMatch[1].trim() : '(확인 실패)'}`)
  console.log(`  로컬 VITE_R2_PUBLIC_BASE_URL 호스트: ${publicBaseHost || '(미설정)'}`)
  console.log(`  VITE_IMAGE_RESIZE_ORIGIN: ${resizeOrigin ? displayUrl(resizeOrigin) : '(미설정)'}`)
  console.log(`  ${CDN_HOST} 허용 여부: ${cdnIsAllowlisted ? '예' : '아니요'}`)
  if (r2PassesThrough) {
    console.log('  R2 r2.dev URL: 변환 원본 미설정으로 원본 URL 그대로 반환되는 경로')
  } else if (resizeOrigin) {
    console.log('  R2 r2.dev URL: VITE_IMAGE_RESIZE_ORIGIN + /cdn-cgi/image/.../<원본 URL> 형태로 변환')
  } else {
    console.log('  R2 URL 처리: 소스의 호스트 판별·변환 조건을 확인하세요.')
  }
  return { cdnIsAllowlisted, r2PassesThrough }
}

function ms(value: number | null) {
  return value === null ? '-' : `${value.toFixed(0)}`
}

async function main() {
  loadEnv()
  console.log(`=== CDN 커스텀 도메인 정밀 점검: ${CDN_HOST} ===`)

  let cdnAddresses: string[] = []
  let systemDnsError = ''
  try {
    const addresses = await systemLookup(CDN_HOST, { all: true })
    cdnAddresses = addresses.map(({ address }) => address)
    console.log('\n[DNS]')
    console.log(`  시스템 리졸버: ${addresses.map(({ address, family }) => `${address} (IPv${family})`).join(', ')}`)
  } catch (error) {
    console.log('\n[DNS]')
    systemDnsError = errorMessage(error)
    console.log(`  시스템 리졸버: 실패 — ${systemDnsError}`)
    try {
      cdnAddresses = await publicDnsLookup(CDN_HOST)
      console.log(`  Google 공개 DNS: ${cdnAddresses.join(', ')} (이 주소로 HTTPS 연결을 재검증)`)
    } catch (publicDnsError) {
      console.log(`  공개 DNS 재검증 실패: ${errorMessage(publicDnsError)}`)
    }
  }

  console.log('\n[CDN 루트 HTTPS 응답]')
  const rootResult = await probe(CDN_ROOT, cdnAddresses)
  console.table([
    {
      URL: CDN_ROOT,
      HTTP: rootResult.status,
      TTFB_ms: ms(rootResult.ttfbMs),
      전체_ms: ms(rootResult.totalMs),
      크기_B: rootResult.bytes,
      'cf-cache-status': rootResult.cache,
      'cache-control': rootResult.cacheControl,
    },
  ])
  if (rootResult.error) console.log(`  오류: ${rootResult.error}`)

  const samples = await getSamples()
  console.log(`\n[이미지 원본 R2 vs 커스텀 CDN] DB 최근 도안 ${samples.length}개 · 실제 전체 GET`)
  const measurements: Array<{
    label: string
    kind: string
    origin: ProbeResult
    cdn: ProbeResult
    warm: ProbeResult
  }> = []
  for (const sample of samples) {
    const cdnUrl = cdnUrlFor(sample.url)
    const origin = await probe(sample.url, cdnAddresses)
    const cdn = await probe(cdnUrl, cdnAddresses)
    const warm = await probe(cdnUrl, cdnAddresses)
    measurements.push({ label: sample.label, kind: sample.kind, origin, cdn, warm })
    if (origin.error) console.log(`  ${sample.label} 원본 오류: ${origin.error}`)
    if (cdn.error) console.log(`  ${sample.label} CDN 오류: ${cdn.error}`)
    if (warm.error) console.log(`  ${sample.label} CDN 재요청 오류: ${warm.error}`)
    if (origin.cacheControl !== '(없음)' || cdn.cacheControl !== '(없음)') {
      console.log(
        `  ${sample.label} cache-control: 원본=${origin.cacheControl} · CDN=${cdn.cacheControl}`,
      )
    }
    console.log(`  ${sample.label} URL: ${displayUrl(sample.url)} → ${displayUrl(cdnUrl)}`)
  }
  console.table(
    measurements.map(({ label, kind, origin, cdn, warm }) => ({
      도안: label,
      종류: kind,
      원본_HTTP: origin.status,
      원본_TTFB_ms: ms(origin.ttfbMs),
      원본_전체_ms: ms(origin.totalMs),
      원본_KB: (origin.bytes / 1024).toFixed(1),
      CDN_HTTP: cdn.status,
      CDN_TTFB_ms: ms(cdn.ttfbMs),
      CDN_전체_ms: ms(cdn.totalMs),
      CDN_cache_1차: cdn.cache,
      CDN_cache_재요청: warm.cache,
      CDN_재요청_TTFB_ms: ms(warm.ttfbMs),
    })),
  )

  const frontend = frontendAudit()
  const cdn2xx = measurements.filter(({ cdn }) => cdn.status === 200).length
  const origin2xx = measurements.filter(({ origin }) => origin.status === 200).length
  const cacheHits = measurements.filter(({ cdn }) => cdn.cache.toLowerCase() === 'hit').length
  const repeatCacheHits = measurements.filter(({ warm }) => warm.cache.toLowerCase() === 'hit').length
  const mean = (values: Array<number | null>) => {
    const available = values.filter((value): value is number => value !== null)
    return available.length
      ? available.reduce((total, value) => total + value, 0) / available.length
      : null
  }
  const originTtfb = mean(measurements.map(({ origin }) => origin.ttfbMs))
  const cdnTtfb = mean(measurements.map(({ cdn }) => cdn.ttfbMs))
  const originTotal = mean(measurements.map(({ origin }) => origin.totalMs))
  const cdnTotal = mean(measurements.map(({ cdn }) => cdn.totalMs))
  console.log('\n[진단 요약]')
  console.log(`  DNS: 위에서 확인한 A/AAAA 응답`)
  console.log(`  루트 HTTPS: HTTP ${rootResult.status}, TTFB ${ms(rootResult.ttfbMs)} ms`)
  console.log(`  이미지 성공: R2 원본 ${origin2xx}/${measurements.length} · CDN ${cdn2xx}/${measurements.length}`)
  console.log(
    `  평균 TTFB: R2 ${ms(originTtfb)} ms → CDN 1차 ${ms(cdnTtfb)} ms · 평균 전체: R2 ${ms(originTotal)} ms → CDN 1차 ${ms(cdnTotal)} ms`,
  )
  if (originTtfb !== null && cdnTtfb !== null && originTtfb > 0) {
    console.log(
      `  평균 TTFB 차이: CDN 1차 기준 ${ms(originTtfb - cdnTtfb)} ms 단축 (${(((originTtfb - cdnTtfb) / originTtfb) * 100).toFixed(1)}%)`,
    )
  }
  console.log(
    `  CDN 이미지 캐시 HIT: 1차 ${cacheHits}/${measurements.length} · 즉시 재요청 ${repeatCacheHits}/${measurements.length}`,
  )
  console.log(
    `  프론트엔드 도메인 경로: ${frontend.cdnIsAllowlisted ? `${CDN_HOST} 허용 목록에 있음` : `${CDN_HOST} 허용 목록에 없어 직접 CDN URL로 변환되지 않음`}`,
  )
  if (frontend.r2PassesThrough) {
    console.log('  결론: 현재 로컬 설정 기준 화면용 URL도 R2 원본 주소를 유지합니다.')
  }
  if (
    systemDnsError ||
    (rootResult.status !== 404 && rootResult.status !== 200) ||
    cdn2xx !== measurements.length ||
    repeatCacheHits !== measurements.length
  ) {
    process.exitCode = 1
  }
}

await main()
