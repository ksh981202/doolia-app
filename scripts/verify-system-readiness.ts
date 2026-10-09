/**
 * Pre-launch integrity audit: DB/RLS, SEO files, affiliate media.
 * Usage: npx tsx scripts/verify-system-readiness.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type Grade = 'PASS' | 'WARN' | 'FAIL'
type SystemCheck = { title: string; status: Grade; messages: string[] }

const SITE = 'https://doolia.com'
const EXPECTED_AFFILIATES = [
  { id: '01_crayons', image: 'affiliate_01_crayons.webp', video: 'affiliate_01_crayons.mp4' },
  { id: '02_colored_pencils', image: 'affiliate_02_colored_pencils.webp', video: 'affiliate_02_colored_pencils.mp4' },
  { id: '03_markers', image: 'affiliate_03_markers.webp', video: 'affiliate_03_markers.mp4' },
  { id: '04_water_brush', image: 'affiliate_04_water_brush.webp', video: 'affiliate_04_water_brush-silent.mp4' },
  { id: '05_art_smock', image: 'affiliate_05_art_smock.webp', video: 'affiliate_05_art_smock-silent.mp4' },
  { id: '06_craft_mat', image: 'affiliate_06_craft_mat.webp', video: 'affiliate_06_craft_mat-silent.mp4' },
  { id: '07_safety_scissors', image: 'affiliate_07_safety_scissors.webp', video: 'affiliate_07_safety_scissors-silent.mp4' },
  { id: '08_kids_art_set', image: 'affiliate_08_kids_art_set.webp', video: 'affiliate_08_kids_art_set-silent.mp4' },
] as const

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

function worse(a: Grade, b: Grade): Grade {
  if (a === 'FAIL' || b === 'FAIL') return 'FAIL'
  if (a === 'WARN' || b === 'WARN') return 'WARN'
  return 'PASS'
}

function selectDenied(error: { message?: string; code?: string } | null) {
  const msg = `${error?.message || ''} ${error?.code || ''}`.toLowerCase()
  return /permission|rls|not authorized|42501|pgrst301|jwt/.test(msg)
}

async function probePrivateTable(
  supabase: SupabaseClient,
  table: string,
): Promise<{ blocked: boolean; leaked: boolean; detail: string }> {
  const { data, error } = await supabase.from(table).select('id').limit(1)
  if (selectDenied(error)) {
    return { blocked: true, leaked: false, detail: error?.message || 'permission denied' }
  }
  if (error) {
    return { blocked: false, leaked: false, detail: error.message }
  }
  if (Array.isArray(data) && data.length > 0) {
    return { blocked: false, leaked: true, detail: `anon SELECT로 ${data.length}행 반환` }
  }
  return {
    blocked: false,
    leaked: false,
    detail: '에러 없이 0행 — 테이블이 비었거나 SELECT는 열려 있고 행이 없을 수 있음',
  }
}

async function runSystemReadinessAudit() {
  loadEnv()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🛡️ DOOLIA 운영 개시 전 내부 시스템 종합 무결성 정밀 진단')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const results: SystemCheck[] = []
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 .env 에 없습니다.')
    process.exitCode = 1
    return
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const dbMsgs: string[] = []
  let dbStatus: Grade = 'PASS'
  try {
    const { count: printableCount, error: pErr } = await supabase
      .from('printables')
      .select('id', { count: 'exact', head: true })

    if (pErr) {
      dbStatus = 'FAIL'
      dbMsgs.push(`❌ printables 테이블 접근 에러: ${pErr.message}`)
    } else {
      dbMsgs.push(`✅ printables 테이블 정상 연결 (anon 조회 ${printableCount ?? 0}개)`)
    }

    const { count: publishedCount, error: pubErr } = await supabase
      .from('printables')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
    if (!pubErr) {
      dbMsgs.push(`✅ published=true 도안 ${publishedCount ?? 0}개`)
      if ((printableCount ?? 0) > (publishedCount ?? 0)) {
        dbStatus = worse(dbStatus, 'WARN')
        dbMsgs.push(
          `⚠️ anon이 unpublished 행까지 읽을 수 있음 (전체 ${printableCount} · 공개 ${publishedCount})`,
        )
      }
    }

    for (const table of ['general_inquiries', 'copyright_reports'] as const) {
      const probe = await probePrivateTable(supabase, table)
      if (probe.leaked) {
        dbStatus = worse(dbStatus, 'FAIL')
        dbMsgs.push(`❌ ${table}: ${probe.detail} — RLS SELECT 차단 실패`)
      } else if (probe.blocked) {
        dbMsgs.push(`✅ ${table} anon SELECT 차단 (${probe.detail})`)
      } else {
        dbStatus = worse(dbStatus, 'WARN')
        dbMsgs.push(`⚠️ ${table}: ${probe.detail}`)
      }
    }

    const { data: affiliates, error: affErr } = await supabase
      .from('affiliate_items')
      .select('id, is_active, image_url, video_url')
      .eq('is_active', true)
    if (affErr) {
      dbStatus = worse(dbStatus, 'WARN')
      dbMsgs.push(`⚠️ affiliate_items 조회 실패: ${affErr.message}`)
    } else {
      dbMsgs.push(`✅ affiliate_items 활성 ${affiliates?.length ?? 0}개 (anon SELECT 활성 행만)`)
    }
  } catch (error) {
    dbStatus = 'FAIL'
    dbMsgs.push(`❌ Supabase 통신 실패: ${error instanceof Error ? error.message : String(error)}`)
  }
  results.push({ title: '1. Supabase DB & RLS 보안 체계', status: dbStatus, messages: dbMsgs })

  const seoMsgs: string[] = []
  let seoStatus: Grade = 'PASS'
  const publicDir = resolve(process.cwd(), 'public')
  const sitemapPath = resolve(publicDir, 'sitemap.xml')
  const robotsPath = resolve(publicDir, 'robots.txt')

  if (existsSync(robotsPath)) {
    const robots = readFileSync(robotsPath, 'utf8')
    if (robots.includes('Sitemap:') && robots.includes('doolia.com') && robots.includes('sitemap.xml')) {
      seoMsgs.push('✅ robots.txt 정식 도메인(doolia.com) 및 sitemap 연동 정상')
    } else {
      seoStatus = worse(seoStatus, 'WARN')
      seoMsgs.push('⚠️ robots.txt 도메인/sitemap 선언을 확인하세요')
    }
    if (robots.includes('doolia.app')) {
      seoStatus = worse(seoStatus, 'WARN')
      seoMsgs.push('⚠️ robots.txt에 doolia.app 혼재 — 정식은 doolia.com')
    }
    if (!/Disallow:\s*\/admin/i.test(robots)) {
      seoStatus = worse(seoStatus, 'WARN')
      seoMsgs.push('⚠️ robots.txt에 /admin Disallow가 없습니다')
    } else {
      seoMsgs.push('✅ robots.txt /admin 크롤 차단')
    }
  } else {
    seoStatus = 'FAIL'
    seoMsgs.push('❌ public/robots.txt 파일 누락')
  }

  if (existsSync(sitemapPath)) {
    const sitemap = readFileSync(sitemapPath, 'utf8')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    const printableLocs = locs.filter((url) => url.includes('/printable/'))
    const foreign = locs.filter((url) => !url.startsWith(SITE))
    seoMsgs.push(`✅ sitemap.xml 존재 (총 ${locs.length}개 URL · 도안 ${printableLocs.length}개)`)
    if (foreign.length) {
      seoStatus = worse(seoStatus, 'WARN')
      seoMsgs.push(`⚠️ sitemap에 ${SITE} 가 아닌 URL ${foreign.length}개`)
    }
    const { count: publishedCount } = await supabase
      .from('printables')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
    if (typeof publishedCount === 'number' && printableLocs.length < publishedCount) {
      seoStatus = worse(seoStatus, 'WARN')
      seoMsgs.push(
        `⚠️ sitemap 도안 URL ${printableLocs.length}개 < published ${publishedCount}개 — generate-seo-assets 재생성 필요`,
      )
    }
  } else {
    seoStatus = worse(seoStatus, 'WARN')
    seoMsgs.push('ℹ️ sitemap.xml이 없습니다. 빌드 시 generate-seo-assets 로 생성되는지 확인하세요.')
  }
  results.push({ title: '2. SEO 크롤러 & 사이트맵 인덱싱', status: seoStatus, messages: seoMsgs })

  const mediaMsgs: string[] = []
  let mediaStatus: Grade = 'PASS'
  const affiliateDir = resolve(publicDir, 'affiliate')
  if (existsSync(affiliateDir)) {
    const files = new Set(readdirSync(affiliateDir))
    const mp4s = [...files].filter((name) => name.endsWith('.mp4'))
    const posters = [...files].filter((name) => name.endsWith('.webp') || name.endsWith('.png'))
    mediaMsgs.push(`✅ public/affiliate 비디오 ${mp4s.length}개 · 포스터 ${posters.length}개`)
    let missing = 0
    for (const item of EXPECTED_AFFILIATES) {
      const hasImage = files.has(item.image)
      const hasVideo = files.has(item.video)
      if (!hasImage || !hasVideo) {
        missing += 1
        mediaStatus = worse(mediaStatus, 'FAIL')
        mediaMsgs.push(
          `❌ ${item.id} 누락 — image ${hasImage ? 'OK' : '없음'} / video ${hasVideo ? 'OK' : '없음'}`,
        )
      }
    }
    if (!missing) {
      mediaMsgs.push('✅ 제휴마케팅 8종 비디오+포스터 파일 매핑 완료')
    }
  } else {
    mediaStatus = 'FAIL'
    mediaMsgs.push('❌ public/affiliate 디렉토리가 없습니다.')
  }
  results.push({ title: '3. 제휴마케팅 8종 미디어 에셋 무결성', status: mediaStatus, messages: mediaMsgs })

  results.forEach((res) => {
    const icon = res.status === 'PASS' ? '🟢' : res.status === 'WARN' ? '🟡' : '🔴'
    console.log(`${icon} [${res.title}] -> ${res.status}`)
    res.messages.forEach((m) => console.log(`   ${m}`))
    console.log('───────────────────────────────────────────────────────────────')
  })

  const failed = results.filter((r) => r.status === 'FAIL').length
  const warned = results.filter((r) => r.status === 'WARN').length
  console.log(`\n🏁 종합 진단 완료: FAIL ${failed} · WARN ${warned} · PASS ${results.length - failed - warned}`)
  if (failed) process.exitCode = 1
}

await runSystemReadinessAudit()
