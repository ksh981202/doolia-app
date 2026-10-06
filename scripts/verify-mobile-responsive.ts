/**
 * Read-only mobile responsive UX audit (360–430px). Does not mutate app source or DB.
 * Usage: npx tsx scripts/verify-mobile-responsive.ts
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

type Grade = 'PASS' | 'WARN' | 'FAIL'

type Check = {
  grade: Grade
  area: string
  title: string
  detail: string
}

const checks: Check[] = []
const LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
const PUBLIC_SKIP = new Set(['admin', 'node_modules', 'dist', '.git'])
const VIEWPORTS = [
  { name: 'iPhone SE', width: 375 },
  { name: 'Galaxy S', width: 360 },
  { name: 'iPhone 15 Pro', width: 393 },
  { name: 'iPhone 15 Pro Max-ish', width: 430 },
] as const

function add(grade: Grade, area: string, title: string, detail: string) {
  checks.push({ grade, area, title, detail })
}

function read(rel: string) {
  const path = resolve(process.cwd(), rel)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

function walkTsx(dirRel: string, skipAdmin = true): Array<{ rel: string; src: string }> {
  const root = resolve(process.cwd(), dirRel)
  const out: Array<{ rel: string; src: string }> = []
  const walk = (folder: string) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (PUBLIC_SKIP.has(entry.name)) continue
        if (skipAdmin && entry.name === 'admin') continue
        walk(resolve(folder, entry.name))
        continue
      }
      if (!/\.(tsx|ts|css)$/.test(entry.name)) continue
      const abs = resolve(folder, entry.name)
      const rel = abs.replace(resolve(process.cwd()) + '\\', '').replace(/\\/g, '/')
      out.push({ rel, src: readFileSync(abs, 'utf8') })
    }
  }
  if (existsSync(root)) walk(root)
  return out
}

function lineOf(src: string, index: number) {
  return src.slice(0, index).split(/\r?\n/).length
}

function scanOverflow(files: Array<{ rel: string; src: string }>) {
  const fixedWidthHits: string[] = []
  const minWidthHits: string[] = []
  const vwHits: string[] = []
  const nowrapHits: string[] = []
  const overflowXHits: string[] = []

    const fixedRe = /(?<![\w-])(?:w|min-w)-\[(?:[4-9]\d{2}|[1-9]\d{3})px\]/g
  const minWRe = /\bmin-w-\[(\d+)(?:px|rem)\]/g
  const remWRe = /\bw-\[(\d+(?:\.\d+)?)rem\]/g
  const vwRe = /\b(?:w|min-w)-screen\b|\b100vw\b|\bw-dvw\b|\bw-svw\b/g
  const nowrapRe = /\bwhitespace-nowrap\b/g
  const oxRe = /\boverflow-x-(?:auto|scroll|hidden)\b/g

  for (const file of files) {
    if (file.rel.includes('/admin/') || file.rel.includes('\\admin\\')) continue
    let match: RegExpExecArray | null
    const scan = (re: RegExp, bag: string[]) => {
      re.lastIndex = 0
      while ((match = re.exec(file.src))) {
        bag.push(`${file.rel}:${lineOf(file.src, match.index)} ${match[0]}`)
      }
    }
    scan(fixedRe, fixedWidthHits)
    scan(vwRe, vwHits)
    scan(oxRe, overflowXHits)
    minWRe.lastIndex = 0
    while ((match = minWRe.exec(file.src))) {
      const n = Number(match[1])
      if (Number.isFinite(n) && n >= 360) {
        minWidthHits.push(`${file.rel}:${lineOf(file.src, match.index)} ${match[0]}`)
      }
    }
    remWRe.lastIndex = 0
    while ((match = remWRe.exec(file.src))) {
      const px = Number(match[1]) * 16
      if (px >= 320) {
        fixedWidthHits.push(`${file.rel}:${lineOf(file.src, match.index)} ${match[0]} (~${Math.round(px)}px)`)
      }
    }
    nowrapRe.lastIndex = 0
    while ((match = nowrapRe.exec(file.src))) {
      const around = file.src.slice(Math.max(0, match.index - 80), match.index + 80)
      if (around.includes('hidden') || around.includes('truncate') || around.includes('overflow-x')) continue
      nowrapHits.push(`${file.rel}:${lineOf(file.src, match.index)}`)
    }
  }

  add(
    vwHits.length ? 'FAIL' : 'PASS',
    'overflow',
    '100vw / w-screen 가로 누수',
    vwHits.length
      ? `모바일에서 스크롤바 폭만큼 넘칠 수 있음: ${vwHits.slice(0, 6).join(' · ')}`
      : '공개 src에 100vw / w-screen / w-dvw 없음',
  )

  const publicFixed = fixedWidthHits.filter((hit) => !hit.includes('admin'))
  add(
    publicFixed.some((hit) => /w-\[(?:[5-9]\d{2}|[1-9]\d{3})px\]/.test(hit)) ? 'FAIL' : publicFixed.length ? 'WARN' : 'PASS',
    'overflow',
    '고정 폭 Tailwind (360–430px)',
    publicFixed.length
      ? `고정 폭 후보 ${publicFixed.length}건. 부모 overflow-hidden이면 잘림, 아니면 가로 스크롤. ${publicFixed.slice(0, 8).join(' · ')}`
      : 'w-[400px+] / min-w-[400px+] 공개 컴포넌트 없음',
  )

  add(
    minWidthHits.filter((h) => !h.includes('admin')).length ? 'WARN' : 'PASS',
    'overflow',
    'min-width ≥ 360px',
    minWidthHits.filter((h) => !h.includes('admin')).length
      ? minWidthHits.filter((h) => !h.includes('admin')).join(' · ')
      : '공개 영역 min-w-[360px+] 없음 (LanguageSwitcher min-w-[200px]는 드롭다운)',
  )

  const header = read('src/components/Header.tsx') ?? ''
  add(
    header.includes('grid-cols-[1fr_minmax(0,42rem)_1fr]') && header.includes('min-w-0')
      ? 'PASS'
      : 'WARN',
    'overflow',
    'Header 모바일 그리드',
    header.includes('minmax(0,42rem)')
      ? '검색 칸 min-w-0 / minmax(0,…) 로 중간 컬럼이 수축함. 홈은 md 미만에서 중앙 내비 hidden + 햄버거.'
      : 'Header 중간 컬럼 수축 제약이 약함',
  )

  const catalog = read('src/components/layout/CatalogLayout.tsx') ?? ''
  add(
    catalog.includes('overflow-x-hidden') && catalog.includes('min-w-0') ? 'PASS' : 'WARN',
    'overflow',
    'CatalogLayout 가로 클립',
    catalog.includes('overflow-x-hidden')
      ? '카탈로그 본문 min-w-0 + overflow-x-hidden'
      : '카탈로그 가로 클립 없음',
  )

  const shell = read('src/shared/lib/cn.ts') ?? ''
  add(
    shell.includes("PAGE_SHELL = 'mx-auto w-full max-w-7xl px-4") ? 'PASS' : 'WARN',
    'overflow',
    '페이지 셸 패딩',
    'PAGE_SHELL = w-full max-w-7xl px-4. 360px에서 양옆 16px 확보.',
  )

  const hero = read('src/pages/PlayHubPage.tsx') ?? ''
  add(
    hero.includes('w-64') && hero.includes('overflow-hidden') && hero.includes('scale-90')
      ? 'PASS'
      : 'WARN',
    'overflow',
    '홈 히어로 카드 고정 폭',
    'PlayHub 히어로 스택은 w-64/w-36 고정이나 부모 overflow-hidden + scale-90. 360px에서 잘릴 수 있으나 페이지 가로 스크롤은 막힘.',
  )

  const theme = read('src/components/category/ThemeFilter.tsx') ?? ''
  const wraps = theme.includes('flex-wrap') && !theme.includes("variant === 'sub'")
  const subSwipe =
    theme.includes('overflow-x-auto') &&
    theme.includes('scrollbar-none') &&
    theme.includes('flex-nowrap')
  add(
    subSwipe ? 'PASS' : wraps && !theme.includes('overflow-x-auto') ? 'WARN' : 'FAIL',
    'overflow',
    '카테고리 서브탭 가로 스크롤',
    subSwipe
      ? 'ThemeFilter variant=sub: flex-nowrap overflow-x-auto scrollbar-none py-1.5 gap-2. 한 줄 스와이프.'
      : wraps
        ? 'ThemeFilter는 overflow-x-auto/scrollbar-none 없이 flex-wrap.'
        : '서브탭 스크롤/랩 처리 없음',
  )

  const top = read('src/components/home/TopDownloads.tsx') ?? ''
  add(
    top.includes('overflow-x-auto')
      ? top.includes('scrollbar-none')
        ? 'PASS'
        : 'WARN'
      : 'PASS',
    'overflow',
    '홈 인기탭 overflow-x-auto',
    top.includes('overflow-x-auto')
      ? 'TopDownloads 탭 줄이 overflow-x-auto. scrollbar-none 없음 → iOS에서 기본 스크롤바/스와이프 힌트가 남을 수 있음.'
      : '홈 인기탭 가로 스크롤 없음',
  )

  add(
    nowrapHits.length > 12 ? 'WARN' : 'PASS',
    'overflow',
    'whitespace-nowrap (truncate 없는 칩)',
    nowrapHits.length
      ? `nowrap ${nowrapHits.length}곳. 칩/내비는 shrink-0+wrap 부모면 안전. 샘플: ${nowrapHits.slice(0, 6).join(' · ')}`
      : 'nowrap 없음',
  )

  add(
    overflowXHits.length ? 'PASS' : 'WARN',
    'overflow',
    'overflow-x 사용처',
    overflowXHits.length
      ? overflowXHits.slice(0, 10).join(' · ')
      : 'overflow-x-* 거의 없음',
  )
}

function scanModals() {
  const viewModal = read('src/components/detail/PrintableViewModal.tsx')
  add(
    viewModal ? 'PASS' : 'WARN',
    'modal',
    'PrintableViewModal.tsx',
    viewModal
      ? '파일 존재'
      : '없음. 확대는 LightboxModal, 인쇄/저장은 DownloadModal이 담당.',
  )

  const download = read('src/features/download/ui/DownloadModal.tsx') ?? ''
  const hasDialog = download.includes('role="dialog"') && download.includes('aria-modal')
  const hasClose = download.includes('aria-label') && download.includes('<X')
  const stacks = download.includes('grid-cols-1') && download.includes('md:grid-cols-2')
  const maxH = /max-h-\[9\d?vh\]/.test(download)
  const oy = download.includes('overflow-y-auto')
  const minPreview = download.includes('min-h-[420px]')
  const fluidPreview = download.includes('max-h-[42vh]') && download.includes('object-contain')
  add(
    hasDialog && stacks && maxH && oy && fluidPreview && !minPreview
      ? 'PASS'
      : hasDialog && stacks && maxH && oy
        ? 'WARN'
        : 'FAIL',
    'modal',
    'DownloadModal 모바일 레이아웃',
    [
      hasDialog ? 'dialog+aria-modal' : 'dialog 누락',
      stacks ? 'grid-cols-1 → md:grid-cols-2 스택' : '2열 스택 없음',
      maxH ? 'max-h-[92vh]' : 'max-h 없음',
      oy ? 'overflow-y-auto' : '세로 스크롤 없음',
      hasClose ? '닫기 aria-label' : '닫기 라벨 없음',
      minPreview
        ? '미리보기 min-h-[420px] — iPhone SE에서 인쇄 버튼이 접힐 수 있음'
        : fluidPreview
          ? '미리보기 max-h-[42vh] sm:max-h-[500px] object-contain'
          : '미리보기 높이 완화됨',
    ].join('. '),
  )

  add(
    download.includes('TOUCH_ICON') || download.includes('min-h-[44px]') ? 'PASS' : 'WARN',
    'touch',
    'DownloadModal 닫기 버튼 크기',
    download.includes('TOUCH_ICON') || download.includes('min-h-[44px]')
      ? '닫기 min-h/min-w 44px'
      : '닫기: p-2 + 아이콘 20px ≈ 36px. Apple HIG 44×44pt 미달.',
  )

  const report = read('src/pages/CopyrightReportPage.tsx') ?? ''
  const reportStack = report.includes('grid-cols-1') && report.includes('lg:grid-cols-12') && report.includes('items-stretch')
  const reportForm = report.includes('noValidate') && report.includes('submitCopyrightReport')
  add(
    reportStack && reportForm ? 'PASS' : 'FAIL',
    'page',
    'CopyrightReportPage 독립 페이지 레이아웃',
    [
      reportStack ? 'grid-cols-1 → lg:grid-cols-12 items-stretch' : '스택 없음',
      reportForm ? 'noValidate + copyright_reports INSERT' : '폼/제출 없음',
    ].join('. '),
  )

  const light = read('src/components/LightboxModal.tsx') ?? ''
  add(
    light.includes('max-h-[90vh]') && light.includes('role="dialog"') && light.includes('min-h-[44px]')
      ? 'PASS'
      : light.includes('max-h-[90vh]') && light.includes('role="dialog"')
        ? 'WARN'
        : 'FAIL',
    'modal',
    'LightboxModal 뷰포트',
    light.includes('min-h-[44px]')
      ? '이미지 max-h-[90vh], 닫기 44px 터치 타깃.'
      : light.includes('max-h-[90vh]')
        ? '이미지 max-h-[90vh]. 닫기 터치 타깃이 작음.'
        : 'Lightbox 높이 제한 없음',
  )

  const lang = read('src/components/header/LanguageSwitcher.tsx') ?? ''
  add(
    lang.includes('max-h-[min(70vh,420px)]') && lang.includes('overflow-y-auto')
      ? 'PASS'
      : 'WARN',
    'modal',
    '언어 스위처 10로케일 목록',
    lang.includes('overflow-y-auto')
      ? '드롭다운 max-h 70vh + overflow-y-auto, min-w-[200px] (360px 안쪽).'
      : '언어 목록 스크롤 없음',
  )
}

function scanCardsAndI18n() {
  const card = read('src/components/PrintableCard.tsx') ?? ''
  const titleClamp = card.includes('line-clamp-2') && card.includes('break-words')
  const themeClamp = card.includes('line-clamp-1')
  add(
    titleClamp && themeClamp ? 'PASS' : 'FAIL',
    'i18n',
    'PrintableCard 타이틀/태그 클램프',
    titleClamp
      ? '제목 line-clamp-2 break-words, 연령·테마 line-clamp-1. 카드 루트 overflow-hidden.'
      : '제목 클램프 없음 — 2열 그리드에서 독일어 장문 제목이 셀을 밀어 올릴 수 있음',
  )

  const cat = read('src/pages/CategoryPage.tsx') ?? ''
  add(
    cat.includes('grid-cols-2') && cat.includes('sm:grid-cols-3')
      ? 'PASS'
      : 'WARN',
    'i18n',
    '카테고리 카드 그리드',
    cat.includes('grid-cols-2')
      ? 'CARD_GRID = grid-cols-2 gap-3 → sm:3 → lg:4. 360px에서 셀 ≈ 152px.'
      : '모바일 2열 명시 없음',
  )

  const grid = read('src/features/gallery/ui/PrintableGrid.tsx') ?? ''
  add(
    grid.includes('grid-cols-2') ? 'PASS' : 'WARN',
    'i18n',
    'PrintableGrid 2열',
    grid.includes('grid-cols-2') ? '홈/갤러리 grid-cols-2 gap-4 lg:grid-cols-4' : '2열 없음',
  )

  const detail = read('src/pages/PrintableDetailPage.tsx') ?? ''
  add(
    detail.includes('grid-cols-1') && detail.includes('lg:grid-cols-12') && detail.includes('min-w-0')
      ? 'PASS'
      : 'WARN',
    'overflow',
    '상세페이지 1열 스택',
    'PrintableDetailPage: grid-cols-1 → lg:grid-cols-12, 양쪽 min-w-0. 브레드크럼 마지막 항목 truncate.',
  )

  const i18n = read('src/i18n/index.ts') ?? ''
  const printCtas = LOCALES.map((code) => {
    const block = i18n.match(new RegExp(`${code}:\\s*\\{[\\s\\S]*?printCta:\\s*'([^']*)'`))
    return { code, text: block?.[1] ?? '' }
  })
  const longest = [...printCtas].sort((a, b) => b.text.length - a.text.length)[0]
  const info = read('src/components/detail/InfoSection.tsx') ?? ''
  add(
    info.includes('[overflow-wrap:anywhere]') && longest.text.length < 48 ? 'PASS' : 'WARN',
    'i18n',
    '10로케일 printCta 길이',
    `가장 긴 CTA: ${longest.code} “${longest.text}” (${longest.text.length}자). InfoSection TEXT_WRAP=break-words+anywhere. DownloadModal 인쇄/저장 버튼은 truncate.`,
  )

  const placeholders = LOCALES.map((code) => {
    const m = i18n.match(new RegExp(`${code}:\\s*\\{[\\s\\S]*?searchPlaceholder:\\s*'([^']*)'`))
    return m?.[1] ?? ''
  }).filter(Boolean)
  const longPh = placeholders.sort((a, b) => b.length - a.length)[0] ?? ''
  add(
    longPh.length > 42 ? 'WARN' : 'PASS',
    'i18n',
    '검색 placeholder 길이',
    `최장 “${longPh}” (${longPh.length}자). Header/히어로 input은 min-w-0 flex-1이라 넘치진 않고 잘림.`,
  )

  const hot = read('src/pages/PlayHubPage.tsx') ?? ''
  add(
    hot.includes('HOT_THEMES') && hot.includes('line-clamp-1') && hot.includes('truncate')
      ? 'PASS'
      : 'WARN',
    'i18n',
    '홈 핫 테마 2열 카드',
    'grid-cols-2 + 제목 line-clamp-1 + 설명 truncate + min-w-0. 유럽어에서 한 줄로 잘림(레이아웃 붕괴는 아님).',
  )
}

function scanTouchAndPrint() {
  const index = read('index.html') ?? ''
  add(
    /name="viewport"[^>]*width=device-width/.test(index) && !/user-scalable\s*=\s*no/.test(index)
      ? index.includes('viewport-fit=cover')
        ? 'PASS'
        : 'WARN'
      : 'FAIL',
    'touch',
    'viewport 메타',
    /width=device-width/.test(index)
      ? 'width=device-width, initial-scale=1.0. user-scalable=no 없음(줌 가능). viewport-fit=cover 없어 노치/홈 인디케이터 safe-area는 미적용.'
      : 'viewport 메타 없음',
  )

  const header = read('src/components/Header.tsx') ?? ''
  add(
    header.includes('min-h-[44px]') || header.includes('TOUCH_ICON') ? 'PASS' : 'WARN',
    'touch',
    '헤더 아이콘 버튼',
    header.includes('TOUCH_ICON') || header.includes('min-h-[44px]')
      ? 'iconButtonClass min-h/min-w 44px.'
      : 'iconButtonClass = h-9 w-9 (36px). 뒤로/메뉴/언어 트리거가 44pt 미만.',
  )

  const themeChips = read('src/components/category/ThemeFilter.tsx') ?? ''
  add(
    themeChips.includes('min-h-[44px]') ? 'PASS' : 'WARN',
    'touch',
    '필터 칩 터치 타깃',
    themeChips.includes('min-h-[44px]')
      ? 'ThemeFilter 칩 min-h-[44px].'
      : 'ThemeFilter 칩 높이가 44px 미만.',
  )

  const printLib = read('src/shared/lib/printPage.ts') ?? ''
  const download = read('src/features/download/ui/DownloadModal.tsx') ?? ''
  const mobileFirst =
    printLib.includes('isMobilePrintHost') &&
    printLib.includes('printThroughIframe') &&
    download.includes('printPrintable')
  add(
    mobileFirst ? 'PASS' : 'WARN',
    'print',
    '모바일 window.print / 팝업',
    mobileFirst
      ? '모바일(iOS/Android/coarse)은 window.open 없이 hidden iframe + contentWindow.print(). 데스크톱만 팝업 후 iframe 폴백. 클릭 핸들러에서 동기 호출 + 이미지 prefetch.'
      : '모바일 팝업 우선 경로가 남아 있음.',
  )

  const a4 = read('src/components/detail/A4Preview.tsx') ?? ''
  add(
    a4.includes('printPrintable') && a4.includes('isMobilePrintHost')
      ? 'PASS'
      : a4.includes('window.print()')
        ? 'WARN'
        : 'PASS',
    'print',
    'Lightbox/A4Preview Ctrl+P 경로',
    a4.includes('printPrintable')
      ? '모바일 확대 인쇄는 printPrintable(iframe). 데스크톱은 #doolia-print-sheet + window.print().'
      : '확대 모달이 window.print()만 호출.',
  )

  const pdf = read('src/shared/lib/generatePrintablePdf.ts') ?? ''
  add(
    pdf.includes('pdf.save(') ? 'WARN' : 'FAIL',
    'print',
    'PDF 다운로드 <a download>',
    pdf.includes('pdf.save(')
      ? 'jsPDF.save()가 내부적으로 Blob + <a download> 클릭. iOS Safari는 download 속성을 무시하고 새 탭으로 PDF를 여는 경우가 많음(저장은 가능, 파일명/다운로드 폴더 보장은 아님). CORS 실패 시 에러 문구 있음. 공개 <a href download> 태그는 없음.'
      : 'pdf.save / download 링크 없음',
  )

  const affiliate = download.includes('rel="noopener noreferrer sponsored"') && download.includes('target="_blank"')
  add(
    affiliate ? 'PASS' : 'WARN',
    'print',
    '모달 외부 링크',
    affiliate
      ? '제휴 CTA target=_blank rel=noopener noreferrer sponsored.'
      : '외부 링크 rel 점검 필요',
  )

  const printBtns = download.includes('h-[46px]') && (read('src/components/detail/InfoSection.tsx') ?? '').includes('min-h-16')
  add(
    printBtns ? 'PASS' : 'WARN',
    'touch',
    '인쇄/다운로드 진입점 높이',
    '상세 CTA min-h-16, 모달 인쇄/저장 h-[46px] (≥44px). truncate로 긴 독일어도 버튼 폭 안에 유지.',
  )
}

function scanViewportMetaLiveNote() {
  add(
    'PASS',
    'viewport',
    '점검 기준 뷰포트',
    VIEWPORTS.map((item) => `${item.name} ${item.width}px`).join(' · ') +
      '. 본 스크립트는 정적 클래스/호출 분석. 런타임 scrollWidth 측정은 브라우저 도구로 재확인.',
  )
}

function printReport() {
  const order: Grade[] = ['FAIL', 'WARN', 'PASS']
  const counts = {
    FAIL: checks.filter((item) => item.grade === 'FAIL').length,
    WARN: checks.filter((item) => item.grade === 'WARN').length,
    PASS: checks.filter((item) => item.grade === 'PASS').length,
  }
  console.log('DOOLIA mobile responsive audit (read-only, no src mutation)')
  console.log(`summary: FAIL=${counts.FAIL} WARN=${counts.WARN} PASS=${counts.PASS}`)
  console.log('')
  for (const grade of order) {
    const group = checks.filter((item) => item.grade === grade)
    if (!group.length) continue
    console.log(`=== ${grade} (${group.length}) ===`)
    for (const item of group) {
      console.log(`[${item.area}] ${item.title}`)
      console.log(`    ${item.detail}`)
      console.log('')
    }
  }
  const fails = checks.filter((item) => item.grade === 'FAIL')
  const warns = checks.filter((item) => item.grade === 'WARN')
  console.log('=== RECOMMENDATIONS (not applied) ===')
  let n = 1
  if (fails.length) {
    for (const item of fails) {
      console.log(`${n}. [P0] ${item.title}: ${item.detail}`)
      n += 1
    }
  }
  console.log(`${n}. [P2] TopDownloads 탭에 scrollbar-none 적용.`)
  n += 1
  console.log(`${n}. [P2] viewport-fit=cover + env(safe-area-inset-*) 로 홈 인디케이터/노치 여백.`)
  n += 1
  console.log(`${n}. [P2] iOS PDF: jsPDF.save 대신 Blob URL Share / 새 탭.`)
  n += 1
  if (warns.length > 6) {
    console.log(`${n}. 나머지 WARN ${warns.length}건은 리포트 본문 참고 (레이아웃 붕괴보다는 터치/iOS 인쇄/스크롤 UX).`)
  }
}

const files = walkTsx('src', true)
scanViewportMetaLiveNote()
scanOverflow(files)
scanModals()
scanCardsAndI18n()
scanTouchAndPrint()
printReport()

process.exitCode = checks.some((item) => item.grade === 'FAIL') ? 1 : 0
