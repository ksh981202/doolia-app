/**
 * Read-only perceived-speed / bundle audit. Does not mutate app source or DB.
 * Usage: npx tsx scripts/verify-site-speed.ts
 *
 * If dist/assets is missing, runs `npx vite build` once so JS/CSS sizes are real.
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

type Grade = 'PASS' | 'WARN' | 'FAIL'

type Check = {
  grade: Grade
  area: string
  title: string
  detail: string
}

type AssetRow = {
  name: string
  ext: string
  bytes: number
  gzip: number
}

const ROOT = resolve(process.cwd())
const DIST_ASSETS = resolve(ROOT, 'dist/assets')
const CHUNK_WARN_BYTES = 500 * 1024
const LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
const LAZY_TARGETS = [
  'ContactPage',
  'FaqPage',
  'CopyrightReportPage',
  'AdminLoginPage',
  'AdminDashboardPage',
  'AdminPrintablesPage',
  'AdminUploadPage',
  'AdminTipsPage',
  'AdminCopyrightReportsPage',
  'AdminGeneralInquiriesPage',
  'PlayHubPage',
  'CategoryPage',
  'AboutPage',
] as const

const I18N_MARKERS: Record<(typeof LOCALES)[number], string> = {
  ko: '문의 및 신고 접수하기',
  en: 'Submit Inquiry & Report',
  ja: 'お問い合わせ・報告を送信',
  zh: '提交諮詢與侵權申訴',
  es: 'Enviar consulta y aviso',
  pt: 'Enviar consulta e denúncia',
  de: 'Anfrage & Meldung einreichen',
  fr: 'Envoyer la demande et le signalement',
  it: 'Invia richiesta e segnalazione',
  vi: 'Gửi yêu cầu & Báo cáo',
}

const checks: Check[] = []

function add(grade: Grade, area: string, title: string, detail: string) {
  checks.push({ grade, area, title, detail })
}

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function read(rel: string) {
  const path = resolve(ROOT, rel)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

function fileBytes(rel: string) {
  const path = resolve(ROOT, rel)
  return existsSync(path) ? statSync(path).size : 0
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(next))
    else out.push(next)
  }
  return out
}

function ensureDistAssets() {
  const js = existsSync(DIST_ASSETS)
    ? readdirSync(DIST_ASSETS).filter((name) => name.endsWith('.js'))
    : []
  if (js.length) return false
  console.log('dist/assets JS missing — running `npx vite build` (read-only of src)...')
  execSync('npx vite build', { cwd: ROOT, stdio: 'inherit', shell: true })
  return true
}

function collectAssets(): AssetRow[] {
  if (!existsSync(DIST_ASSETS)) return []
  return readdirSync(DIST_ASSETS)
    .filter((name) => /\.(js|css)$/i.test(name))
    .map((name) => {
      const buf = readFileSync(join(DIST_ASSETS, name))
      return {
        name,
        ext: extname(name).slice(1).toLowerCase(),
        bytes: buf.length,
        gzip: gzipSync(buf).length,
      }
    })
    .sort((a, b) => b.bytes - a.bytes)
}

function parseImgs(source: string) {
  const tags = source.match(/<img\b[\s\S]*?>/g) ?? []
  return tags.map((tag) => ({
    tag: tag.replace(/\s+/g, ' ').slice(0, 220),
    lazy: /\bloading\s*=\s*["']lazy["']/.test(tag),
    asyncDec: /\bdecoding\s*=\s*["']async["']/.test(tag),
    width: /\bwidth\s*=/.test(tag),
    height: /\bheight\s*=/.test(tag),
    resized: /getDisplayImageUrl\(/.test(tag) || /width=\d+/.test(tag) || /\/cdn-cgi\/image\//.test(tag),
  }))
}

function analyzeBundle(assets: AssetRow[]) {
  const js = assets.filter((item) => item.ext === 'js')
  const css = assets.filter((item) => item.ext === 'css')
  const jsBytes = js.reduce((sum, item) => sum + item.bytes, 0)
  const jsGzip = js.reduce((sum, item) => sum + item.gzip, 0)
  const cssBytes = css.reduce((sum, item) => sum + item.bytes, 0)
  const oversized = js.filter((item) => item.bytes > CHUNK_WARN_BYTES)

  if (!js.length) {
    add('FAIL', 'bundle', 'dist/assets JS 없음', 'vite build 이후에도 JS 청크가 없습니다.')
    return
  }

  add(
    oversized.length ? 'FAIL' : jsBytes > 1.5 * 1024 * 1024 ? 'WARN' : 'PASS',
    'bundle',
    `JS ${js.length}개 / 합계 ${kb(jsBytes)} (gzip ${kb(jsGzip)})`,
    `CSS ${css.length}개 ${kb(cssBytes)}. 500KB 초과 JS: ${
      oversized.length ? oversized.map((item) => `${item.name} ${kb(item.bytes)}`).join(', ') : '없음'
    }. 상위: ${js
      .slice(0, 6)
      .map((item) => `${item.name} ${kb(item.bytes)} / gz ${kb(item.gzip)}`)
      .join(' · ')}`,
  )

  const indexHtml = read('dist/index.html') ?? ''
  const entryNames = [...indexHtml.matchAll(/\/assets\/([^"']+\.js)/g)].map((match) => match[1])
  const entry = js.filter((item) => entryNames.includes(item.name))
  const entryBytes = entry.reduce((sum, item) => sum + item.bytes, 0)
  const entryGzip = entry.reduce((sum, item) => sum + item.gzip, 0)
  add(
    entryGzip > 250 * 1024 || entryBytes > 700 * 1024 ? 'WARN' : 'PASS',
    'bundle',
    `초기 엔트리 JS ${entry.length}개 ${kb(entryBytes)} (gzip ${kb(entryGzip)})`,
    entry.length
      ? entry.map((item) => `${item.name} ${kb(item.bytes)} / gz ${kb(item.gzip)}`).join(' · ')
      : 'index.html에서 엔트리 스크립트를 찾지 못했습니다.',
  )

  const heavyLibs = [
    { id: 'jspdf', re: /jsPDF|jspdf/i },
    { id: 'tinymce', re: /tinymce/i },
    { id: 'i18n-all-locales', re: /Submit Inquiry & Report/ },
  ] as const
  for (const asset of js.slice(0, 12)) {
    const text = readFileSync(join(DIST_ASSETS, asset.name), 'utf8')
    const hits = heavyLibs.filter((lib) => lib.re.test(text)).map((lib) => lib.id)
    if (!hits.length) continue
    const inEntry = entryNames.includes(asset.name)
    add(
      inEntry && (hits.includes('jspdf') || hits.includes('tinymce')) ? 'FAIL' : 'WARN',
      'bundle',
      `${asset.name}에 ${hits.join(', ')} 포함`,
      inEntry
        ? `초기 엔트리 ${kb(asset.bytes)} / gz ${kb(asset.gzip)}. 홈 방문자가 첫 페인트 전에 받습니다.`
        : `지연 청크 ${kb(asset.bytes)} / gz ${kb(asset.gzip)}. 해당 라우트 진입 시에만 받습니다.`,
    )
  }
}

function analyzeCodeSplitting() {
  const router = read('src/app/router.tsx') ?? read('src/App.tsx') ?? ''
  if (!router) {
    add('FAIL', 'split', '라우터 파일을 찾지 못함', 'src/app/router.tsx 또는 src/App.tsx가 필요합니다.')
    return
  }

  const hasSuspense = /<Suspense\b/.test(router)
  add(
    hasSuspense ? 'PASS' : 'FAIL',
    'split',
    hasSuspense ? '라우터에 Suspense 적용됨' : '라우터에 Suspense가 없음',
    'src/app/router.tsx',
  )

  const missing: string[] = []
  const present: string[] = []
  for (const name of LAZY_TARGETS) {
    const lazyRe = new RegExp(`const\\s+${name}\\s*=\\s*lazy\\(`)
    if (lazyRe.test(router)) present.push(name)
    else missing.push(name)
  }
  add(
    missing.length ? 'WARN' : 'PASS',
    'split',
    `lazy 대상 ${present.length}/${LAZY_TARGETS.length}`,
    missing.length
      ? `미적용: ${missing.join(', ')}`
      : `Contact/Faq/Report/Admin 포함 ${present.length}개 페이지가 React.lazy 입니다.`,
  )

  const eagerDetail = /import PrintableDetailPage from/.test(router)
  add(
    eagerDetail ? 'FAIL' : 'PASS',
    'split',
    eagerDetail ? 'PrintableDetailPage가 정적 import' : 'PrintableDetailPage도 lazy',
    eagerDetail
      ? '상세 페이지가 라우터 청크에 붙어 홈 첫 로딩에 포함됩니다. lazy()로 분리하면 초기 JS가 줄어듭니다.'
      : '상세 페이지가 별도 청크입니다.',
  )

  const appLayout = read('src/components/layout/AppLayout.tsx') ?? ''
  const modalEager = /import\s+\{\s*DownloadModal/.test(appLayout)
  const pdfSrc = read('src/features/download/ui/DownloadModal.tsx') ?? ''
  const pdfEager = /import\s+\{\s*generatePrintablePdf/.test(pdfSrc)
  add(
    modalEager && pdfEager ? 'FAIL' : modalEager ? 'WARN' : 'PASS',
    'split',
    modalEager
      ? 'AppLayout이 DownloadModal(→ jsPDF)을 정적 import'
      : '다운로드/PDF가 레이아웃에서 분리됨',
    'jspdf는 다운로드 순간에만 필요합니다. AppLayout + DownloadModal + generatePrintablePdf 체인을 dynamic import로 끊으면 초기 번들이 크게 줄어듭니다.',
  )
}

function analyzeImages() {
  const cardPath = existsSync(resolve(ROOT, 'src/components/PrintableCard.tsx'))
    ? 'src/components/PrintableCard.tsx'
    : 'src/components/printable/PrintableCard.tsx'
  const card = read(cardPath) ?? ''
  const cardImgs = parseImgs(card)
  const cardOk = cardImgs.length > 0 && cardImgs.every((img) => img.lazy && img.asyncDec)
  const cardDims = cardImgs.every((img) => img.width && img.height)
  const cardResize = /getDisplayImageUrl\([^)]*,\s*640\s*\)/.test(card)

  add(
    cardOk ? 'PASS' : 'FAIL',
    'image',
    `${cardPath} img lazy/async`,
    cardImgs.length
      ? cardImgs
          .map(
            (img, i) =>
              `#${i + 1} lazy=${img.lazy} decoding=${img.asyncDec} width/height=${img.width && img.height}`,
          )
          .join(' · ')
      : 'img 태그를 찾지 못했습니다.',
  )
  add(
    cardDims ? 'PASS' : 'WARN',
    'image',
    'PrintableCard width/height 미지정',
    cardDims
      ? 'width/height가 있어 CLS를 줄입니다.'
      : 'aspect-[3/4] 박스는 있지만 이미지 고유 크기가 없어 레이아웃 시프트 여지가 있습니다.',
  )
  add(
    cardResize ? 'PASS' : 'WARN',
    'image',
    cardResize ? '카드 썸네일 getDisplayImageUrl(..., 640)' : '카드 썸네일 리사이즈 없음',
    'Cloudflare /cdn-cgi/image/width=… 변환은 카드 그리드 체감에 직접 영향을 줍니다.',
  )

  const heroPath = existsSync(resolve(ROOT, 'src/components/home/HeroSection.tsx'))
    ? 'src/components/home/HeroSection.tsx'
    : existsSync(resolve(ROOT, 'src/components/HeroSection.tsx'))
      ? 'src/components/HeroSection.tsx'
      : 'src/pages/PlayHubPage.tsx'
  const hero = read(heroPath) ?? ''
  const heroImgs = parseImgs(hero)
  const heroUsesResize = /getDisplayImageUrl\(/.test(hero)
  const heroLazyCount = heroImgs.filter((img) => img.lazy).length
  const heroAsyncCount = heroImgs.filter((img) => img.asyncDec).length
  const heroDimCount = heroImgs.filter((img) => img.width && img.height).length

  if (!heroImgs.length) {
    add('WARN', 'image', `${heroPath}에 img 없음`, 'HeroSection.tsx가 없고 히어로 이미지 검사가 비어 있습니다.')
  } else {
    add(
      heroLazyCount === 0 && heroPath.includes('PlayHub') ? 'WARN' : heroAsyncCount ? 'PASS' : 'WARN',
      'image',
      `히어로(${heroPath}) img ${heroImgs.length}개 — lazy ${heroLazyCount}, async ${heroAsyncCount}, wh ${heroDimCount}`,
      'LCP 전면 카드는 loading="eager" + fetchpriority="high" + getDisplayImageUrl이 맞고, 좌우 장식 카드는 lazy가 맞습니다. 현재 히어로 원본 URL을 그대로 씁니다.',
    )
    add(
      heroUsesResize ? 'PASS' : 'FAIL',
      'image',
      heroUsesResize ? '히어로 썸네일 리사이즈 적용' : '히어로가 원본 이미지 URL을 그대로 로드',
      'PlayHub 히어로 3장 + 스플릿 프리뷰가 getDisplayImageUrl을 쓰지 않으면 첫 화면에서 풀해상도 R2 이미지를 받습니다.',
    )
  }
}

function analyzeQueryCache() {
  const hook = read('src/features/gallery/model/usePrintablesQuery.ts') ?? ''
  const providers = read('src/app/providers.tsx') ?? ''
  if (!hook) {
    add('FAIL', 'query', 'usePrintablesQuery를 찾지 못함', 'src/features/gallery/model/usePrintablesQuery.ts')
    return
  }

  const stale = hook.match(/staleTime\s*:\s*([^\n,]+)/)?.[1]?.trim() ?? 'unset'
  const gc = hook.match(/gcTime\s*:\s*([^\n,]+)/)?.[1]?.trim()
  const cacheTime = hook.match(/cacheTime\s*:\s*([^\n,]+)/)?.[1]?.trim()
  const refetchMount = hook.match(/refetchOnMount\s*:\s*([^\n,]+)/)?.[1]?.trim() ?? 'default'
  const defaultStale = providers.match(/staleTime\s*:\s*([^\n,]+)/)?.[1]?.trim() ?? 'unset'

  const staleZero = /staleTime\s*:\s*0\b/.test(hook)
  const always = /refetchOnMount\s*:\s*['"]always['"]/.test(hook)

  add(
    staleZero || always ? 'FAIL' : 'PASS',
    'query',
    `usePrintablesQuery staleTime=${stale}, refetchOnMount=${refetchMount}`,
    `훅이 글로벌 기본값(${defaultStale})을 덮어씁니다. staleTime:0 + refetchOnMount:'always'면 홈↔카테고리↔상세 이동마다 printables 전체를 다시 받습니다. gcTime=${gc ?? cacheTime ?? 'default(5m)'}.`,
  )

  const consumers = [
    'src/pages/PlayHubPage.tsx',
    'src/pages/CategoryPage.tsx',
    'src/pages/PrintableDetailPage.tsx',
    'src/pages/BookmarksPage.tsx',
    'src/pages/CopyrightReportPage.tsx',
    'src/features/gallery/ui/PrintableGrid.tsx',
    'src/components/home/TopDownloads.tsx',
  ].filter((rel) => /usePrintablesQuery\(/.test(read(rel) ?? ''))

  add(
    consumers.length >= 4 && (staleZero || always) ? 'WARN' : 'PASS',
    'query',
    `동일 키 ['printables','all'] 소비처 ${consumers.length}곳`,
    `${consumers.join(', ')}. 키는 공유되지만 staleTime 0이면 마운트마다 네트워크가 나갑니다.`,
  )
}

function analyzeI18n(assets: AssetRow[]) {
  const i18nRel = 'src/i18n/index.ts'
  const src = read(i18nRel) ?? ''
  const bytes = fileBytes(i18nRel)
  const gzip = src ? gzipSync(Buffer.from(src)).length : 0
  const localeDir = resolve(ROOT, 'src/i18n/locales')
  const localeFiles = existsSync(localeDir)
    ? readdirSync(localeDir).filter((name) => /\.(json|ts)$/.test(name))
    : []
  const lazyLoad =
    /i18next-http-backend/.test(src) ||
    /import\(`\.\/locales\//.test(src) ||
    /import\.meta\.glob\(/.test(src)
  const allInline = LOCALES.every((lng) => new RegExp(`\\b${lng}\\s*:`).test(src)) && /resources\s*=/.test(src)
  const awaitsInit = /await initI18n\(/.test(read('src/main.tsx') ?? '')

  add(
    lazyLoad && localeFiles.length >= 10 && !allInline ? 'PASS' : 'FAIL',
    'i18n',
    lazyLoad
      ? `로케일 동적 로드 (${localeFiles.length} files, loader ${kb(bytes)} / gz ${kb(gzip)})`
      : allInline
        ? `10개 언어가 ${i18nRel}에 인라인 (${kb(bytes)}, gzip ${kb(gzip)})`
        : 'i18n 리소스 구조를 확인하지 못함',
    awaitsInit
      ? '기본 언어만 initI18n에서 로드하고, 헤더 전환 시 loadLocaleResource가 해당 JSON 청크만 가져옵니다.'
      : 'src/main.tsx가 로케일 로드를 await하지 않으면 첫 페인트에 키가 비어 보일 수 있습니다.',
  )

  const js = assets.filter((item) => item.ext === 'js')
  if (!js.length) return

  const localeHits: Record<string, string[]> = {}
  for (const asset of js) {
    const text = readFileSync(join(DIST_ASSETS, asset.name), 'utf8')
    const found = LOCALES.filter((lng) => text.includes(I18N_MARKERS[lng]))
    if (found.length) localeHits[asset.name] = found
  }

  const bundledTogether = Object.entries(localeHits).filter(([, langs]) => langs.length >= 6)
  const splitHits = Object.entries(localeHits).filter(([, langs]) => langs.length === 1)
  add(
    bundledTogether.length ? 'FAIL' : splitHits.length >= 8 ? 'PASS' : Object.keys(localeHits).length ? 'WARN' : 'WARN',
    'i18n',
    bundledTogether.length
      ? `빌드 JS에 10개 언어 문구가 한 청크에 포함`
      : splitHits.length >= 8
        ? `언어별 청크 ${splitHits.length}개로 분리됨`
        : '로케일 마커 분산 상태',
    bundledTogether.length
      ? bundledTogether
          .map(([name, langs]) => `${name}: ${langs.join(',')}`)
          .join(' · ')
      : `청크별 히트: ${
          Object.entries(localeHits)
            .map(([name, langs]) => `${name}[${langs.join(',')}]`)
            .join(' · ') || '마커 없음(minify/분할로 문자열이 깨졌을 수 있음)'
        }`,
  )
}

function printReport(builtNow: boolean, assets: AssetRow[]) {
  const counts = {
    FAIL: checks.filter((item) => item.grade === 'FAIL').length,
    WARN: checks.filter((item) => item.grade === 'WARN').length,
    PASS: checks.filter((item) => item.grade === 'PASS').length,
  }
  const jsBytes = assets.filter((item) => item.ext === 'js').reduce((sum, item) => sum + item.bytes, 0)
  const jsGzip = assets.filter((item) => item.ext === 'js').reduce((sum, item) => sum + item.gzip, 0)

  console.log('')
  console.log('DOOLIA site-speed audit (read-only, no src mutation)')
  if (builtNow) console.log('note: dist was empty — vite build ran inside this script')
  console.log(`summary: FAIL=${counts.FAIL}  WARN=${counts.WARN}  PASS=${counts.PASS}`)
  console.log(`bundle: JS ${kb(jsBytes)} raw / ${kb(jsGzip)} gzip`)
  console.log('')

  for (const grade of ['FAIL', 'WARN', 'PASS'] as const) {
    const group = checks.filter((item) => item.grade === grade)
    if (!group.length) continue
    console.log(`=== ${grade} (${group.length}) ===`)
    for (const item of group) {
      console.log(`[${item.area}] ${item.title}`)
      console.log(`    ${item.detail}`)
      console.log('')
    }
  }

  const failAreas = new Set(checks.filter((item) => item.grade === 'FAIL').map((item) => item.area))
  console.log('=== ACTION PLAN (not applied — 체감 2배 목표) ===')
  console.log('우선순위는 초기 JS와 첫 화면 바이트를 줄이는 순입니다.')
  console.log('')
  console.log('1. [P0] jsPDF / DownloadModal을 클릭 시점 dynamic import')
  console.log('   AppLayout → DownloadModal → generatePrintablePdf → jspdf 정적 체인을 끊습니다.')
  console.log('   예상: 초기 JS에서 수백 KB 제거, TTI/TBT 즉시 개선.')
  console.log('2. [P0] PrintableDetailPage를 React.lazy + Suspense로 분리')
  console.log('   홈 방문자가 상세/인쇄 코드를 받지 않게 합니다.')
  console.log('3. [P0] i18n 로케일 코드 스플리팅')
  console.log('   resources를 언어별 파일로 나누고 i18n.changeLanguage 시 import().')
  console.log(`   현재 ${kb(fileBytes('src/i18n/index.ts'))} 인라인 10개 국어가 엔트리에 들어갑니다.`)
  console.log('4. [P0] usePrintablesQuery 캐시')
  console.log("   staleTime: 5~10분, refetchOnMount: false (또는 기본값). staleTime:0 + 'always' 제거.")
  console.log('   홈↔카테고리↔상세 왕복의 중복 카탈로그 fetch가 사라집니다.')
  console.log('5. [P1] 히어로 이미지 LCP')
  console.log('   전면 카드: getDisplayImageUrl(src, 640~800) + fetchpriority="high" + width/height.')
  console.log('   좌우 카드: loading="lazy" + 리사이즈. 풀해상도 R2 URL 금지.')
  console.log('6. [P1] PrintableCard에 width/height(또는 aspect-ratio 유지 + sizes)')
  console.log('   lazy/640 리사이즈는 이미 있습니다. CLS만 고정하면 체감이 안정됩니다.')
  console.log('7. [P2] vite manualChunks')
  console.log('   react/react-dom/scheduler, i18next, supabase-js를 vendor 청크로 분리하고 장기 캐시.')
  console.log('8. [P2] TinyMCE는 관리자 청크에만 (이미 lazy admin이면 유지, 엔트리 혼입만 차단)')
  console.log('')
  if (failAreas.has('bundle') || failAreas.has('split') || failAreas.has('i18n') || failAreas.has('query')) {
    console.log('이 4개(PDF 분리 · 상세 lazy · i18n 분할 · 쿼리 staleTime)만 적용해도')
    console.log('홈 첫 방문의 JS+네트워크 왕복이 절반 가까이 줄어 체감 2배에 가장 가깝습니다.')
  }
}

const builtNow = ensureDistAssets()
const assets = collectAssets()
analyzeBundle(assets)
analyzeCodeSplitting()
analyzeImages()
analyzeQueryCache()
analyzeI18n(assets)
printReport(builtNow, assets)

process.exitCode = checks.some((item) => item.grade === 'FAIL') ? 1 : 0
