/**
 * Audit printable image size and TTFB.
 * Usage: npx tsx scripts/verify-image-performance.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type SlowImageAudit = {
  slug: string
  titleKo: string
  thumbnailUrl: string
  sizeKB: number
  format: string
  loadTimeMs: number
  status: 'FAST' | 'SLOW' | 'WARNING'
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

function pickUrl(row: {
  image_bw_url?: string | null
  image_color_url?: string | null
  line_art_url?: string | null
  color_image_url?: string | null
}) {
  return (
    String(row.image_color_url || row.color_image_url || row.image_bw_url || row.line_art_url || '').trim()
  )
}

function looksWebp(url: string, contentType: string) {
  return /\.webp(\?|$)/i.test(url) || /image\/webp/i.test(contentType)
}

async function probe(url: string) {
  const started = Date.now()
  const res = await fetch(url, { method: 'GET' })
  const loadTimeMs = Date.now() - started
  const contentType = res.headers.get('content-type') || ''
  let bytes = Number.parseInt(res.headers.get('content-length') || '0', 10) || 0
  const rangeTotal = res.headers.get('content-range')?.match(/\/(\d+)$/)?.[1]
  if (!bytes && rangeTotal) bytes = Number.parseInt(rangeTotal, 10)
  if (!bytes) {
    bytes = Buffer.from(await res.arrayBuffer()).byteLength
  } else {
    await res.body?.cancel().catch(() => undefined)
  }

  return {
    ok: res.status >= 200 && res.status < 400,
    status: res.status,
    loadTimeMs,
    sizeKB: Math.round(bytes / 1024),
    format: contentType.split(';')[0] || 'unknown',
  }
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const out: R[] = new Array(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next
      next += 1
      out[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return out
}

async function auditImagePerformance() {
  loadEnv()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('⚡ DOOLIA 도안 이미지 용량 & 로딩 속도 정밀 점검')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL/KEY 가 .env 에 없습니다.')
    process.exitCode = 1
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: printables, error } = await supabase
    .from('printables')
    .select('id, slug, title_ko, image_bw_url, image_color_url, line_art_url, color_image_url')
    .order('id', { ascending: false })
    .limit(500)

  if (error || !printables) {
    console.error('❌ Supabase 데이터 조회 실패:', error?.message)
    process.exitCode = 1
    return
  }

  console.log(`📦 전체 등록 도안 수: ${printables.length}개\n`)
  console.log('🚀 이미지 로딩 속도 및 용량 측정 중 (잠시만 기다려주세요)...')

  const slowList: SlowImageAudit[] = []
  let probed = 0
  let missing = 0
  let webpCount = 0
  let heavySizeCount = 0
  let slowTtfbCount = 0
  let notWebpCount = 0
  const sizes: number[] = []
  const times: number[] = []

  await mapPool(printables, 8, async (item) => {
    const targetUrl = pickUrl(item)
    if (!targetUrl) {
      missing += 1
      return
    }
    probed += 1
    try {
      const result = await probe(targetUrl)
      sizes.push(result.sizeKB)
      times.push(result.loadTimeMs)
      const isWebp = looksWebp(targetUrl, result.format)
      if (isWebp) webpCount += 1
      else notWebpCount += 1
      if (result.sizeKB > 300) heavySizeCount += 1
      if (result.loadTimeMs > 400) slowTtfbCount += 1

      const isHeavy = !result.ok || result.sizeKB > 300 || !isWebp
      if (isHeavy) {
        slowList.push({
          slug: String(item.slug || item.id),
          titleKo: String(item.title_ko || '제목 없음'),
          thumbnailUrl: targetUrl,
          sizeKB: result.sizeKB,
          format: result.ok ? result.format : `HTTP ${result.status}`,
          loadTimeMs: result.loadTimeMs,
          status: !result.ok || result.sizeKB > 500 ? 'WARNING' : 'SLOW',
        })
      }
    } catch {
      slowList.push({
        slug: String(item.slug || item.id),
        titleKo: String(item.title_ko || '제목 없음'),
        thumbnailUrl: targetUrl,
        sizeKB: 0,
        format: 'ERROR',
        loadTimeMs: 9999,
        status: 'WARNING',
      })
    }
  })

  slowList.sort((a, b) => b.sizeKB - a.sizeKB || b.loadTimeMs - a.loadTimeMs)

  console.log('\n───────────────────────────────────────────────────────────────')
  console.log('📊 [지연 유발 및 대용량 의심 이미지 분석 결과]')
  console.log('───────────────────────────────────────────────────────────────')

  if (slowList.length === 0) {
    console.log('✨ 모든 도안 이미지가 초경량 WebP 포맷이며 빠르게 로딩됩니다.')
  } else {
    slowList.slice(0, 15).forEach((item, idx) => {
      const badge = item.status === 'WARNING' ? '🚨 [대용량 경고]' : '⚠️ [지연 발생]'
      console.log(`${badge} ${idx + 1}. [${item.slug}] ${item.titleKo}`)
      console.log(`   - 파일 용량 : ${item.sizeKB} KB (권장: 100KB 미만)`)
      console.log(`   - 응답 속도 : ${item.loadTimeMs} ms`)
      console.log(`   - 포맷 타입 : ${item.format}`)
      console.log(`   - 이미지 URL: ${item.thumbnailUrl}`)
      console.log('')
    })
    if (slowList.length > 15) {
      console.log(`   … 외 ${slowList.length - 15}개`)
    }
  }

  const avgSize = sizes.length ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
  const maxSize = sizes.length ? Math.max(...sizes) : 0
  const maxTime = times.length ? Math.max(...times) : 0

  const over100 = sizes.filter((n) => n > 100).length
  const over300 = sizes.filter((n) => n > 300).length
  const over500 = sizes.filter((n) => n > 500).length
  const sortedTimes = [...times].sort((a, b) => a - b)
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0

  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`🎯 점검 요약: 전체 ${printables.length}개 중 측정 ${probed}개 · URL 없음 ${missing}개`)
  console.log(`   WebP 비율: ${probed ? Math.round((webpCount / probed) * 100) : 0}% (${webpCount}/${probed}) · 비WebP ${notWebpCount}개`)
  console.log(`   평균 용량: ${avgSize} KB · 최대 ${maxSize} KB`)
  console.log(`   용량 구간: >100KB ${over100}개 · >300KB ${over300}개 · >500KB ${over500}개`)
  console.log(`   평균 TTFB: ${avgTime} ms · p50 ${p50} ms · p95 ${p95} ms · 최대 ${maxTime} ms`)
  console.log(`   TTFB >400ms: ${slowTtfbCount}개 (R2 origin 지연, 용량과 별개)`)
  console.log(`   최적화 필요 도안(용량>300KB 또는 비WebP/오류): ${slowList.length}개`)
  console.log(`   대용량 파일(>300KB): ${heavySizeCount}개`)
  console.log('═══════════════════════════════════════════════════════════════\n')
}

await auditImagePerformance()
