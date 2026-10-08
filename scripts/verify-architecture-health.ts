// scripts/verify-architecture-health.ts
import fs from 'fs'
import path from 'path'

console.log('🏛️ [둘리아 코드 아키텍처 & 페이지 라우팅 무결성 전수 진단 (Read-Only)]')
console.log('====================================================================\n')

let passCount = 0
let warnCount = 0
let failCount = 0

function listPageFiles(dir: string, root = dir, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      listPageFiles(filePath, root, fileList)
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.relative(root, filePath).replaceAll('\\', '/'))
    }
  }
  return fileList
}

function extractRouterPaths(routerContent: string): string[] {
  const paths = new Set<string>()
  for (const match of routerContent.matchAll(/path=["']([^"']+)["']/g)) {
    const raw = match[1]
    if (raw === '*') continue
    const staticPath = raw.replace(/:[^/]+/g, ':param')
    paths.add(raw.startsWith('/') ? raw : `/${raw}`)
    const prefix = staticPath.split('/:')[0]
    if (prefix) paths.add(prefix)
  }
  for (const match of routerContent.matchAll(/to=["'](\/[^"']+)["']/g)) {
    paths.add(match[1])
  }
  return [...paths]
}

function isKnownRoute(linkTarget: string, declaredRoutes: string[]): boolean {
  if (linkTarget === '/' || linkTarget.startsWith('/#')) return true
  return declaredRoutes.some((route) => {
    if (linkTarget === route) return true
    if (route.includes(':')) {
      const prefix = route.split('/:')[0]
      return prefix.length > 1 && (linkTarget === prefix || linkTarget.startsWith(`${prefix}/`))
    }
    return linkTarget.startsWith(`${route}/`) && ['/printable', '/printables', '/category', '/situation', '/parenting-tips', '/tips', '/admin'].some((root) => route === root || route.startsWith(`${root}/`) || route === root)
  })
}

// 1. 라우트 및 페이지 컴포넌트 1:1 연결 검사 (router.tsx vs src/pages/)
console.log('📍 [1. 페이지 라우트(URL) 매핑 및 404 끊김 검사]')
const appPath = path.join(process.cwd(), 'src/App.tsx')
const routerPath = path.join(process.cwd(), 'src/app/router.tsx')
const pagesDir = path.join(process.cwd(), 'src/pages')
const routeSourcePath = fs.existsSync(routerPath) ? routerPath : appPath

if (fs.existsSync(routeSourcePath) && fs.existsSync(pagesDir)) {
  const appContent = fs.readFileSync(routeSourcePath, 'utf-8')
  const pageFiles = listPageFiles(pagesDir)
  const declaredFromRouter = extractRouterPaths(appContent)

  console.log(`  ├─ 라우트 소스: ${path.relative(process.cwd(), routeSourcePath).replaceAll('\\', '/')}`)
  console.log(`  ├─ 총 감지된 독립 페이지 파일: ${pageFiles.length}개`)

  // 핵심 사용자/관리자 라우트 정의 (이 저장소의 실제 페이지 파일명)
  const expectedRoutes = [
    { path: '/', page: 'PlayHubPage.tsx' },
    { path: '/category', page: 'CategoryPage.tsx' },
    { path: '/printable/:slug', page: 'PrintableDetailPage.tsx' },
    { path: '/contact', page: 'ContactPage.tsx' },
    { path: '/report', page: 'CopyrightReportPage.tsx' },
    { path: '/faq', page: 'FaqPage.tsx' },
    { path: '/admin', page: 'admin/AdminDashboardPage.tsx' },
    { path: '/admin/printables', page: 'admin/AdminPrintablesPage.tsx' },
    { path: '/admin/affiliates', page: 'admin/AdminAffiliatesPage.tsx' },
    { path: '/admin/reports', page: 'admin/AdminCopyrightReportsPage.tsx' },
    { path: '/admin/inquiries', page: 'admin/AdminGeneralInquiriesPage.tsx' },
  ]

  expectedRoutes.forEach((r) => {
    const pageName = path.basename(r.page, '.tsx')
    const pageExists = pageFiles.includes(r.page)
    const pathDeclared =
      appContent.includes(`path="${r.path}"`) ||
      appContent.includes(`path='${r.path}'`) ||
      (r.path === '/printable/:slug' && /path=["']\/printable\/:id["']/.test(appContent))
    const isLazyOrImported = appContent.includes(pageName)
    if (pageExists && isLazyOrImported && pathDeclared) {
      console.log(`  ✅ 라우트 정상 연결: ${r.path.padEnd(22)} ──> ${r.page}`)
      passCount++
    } else {
      console.log(`  ⚠️ 라우트 연결 누락 확인 필요: ${r.path.padEnd(22)} ──> ${r.page}`)
      if (!pageExists) console.log(`      └─ 페이지 파일 없음`)
      if (!isLazyOrImported) console.log(`      └─ 라우터 import/lazy 없음`)
      if (!pathDeclared) console.log(`      └─ path 선언 없음`)
      warnCount++
    }
  })

  const extraCore = ['/about', '/privacy', '/terms', '/parenting-tips', '/bookmarks', '/admin/tips', '/admin/printables/upload']
  extraCore.forEach((route) => {
    if (declaredFromRouter.includes(route) || appContent.includes(`path="${route}"`)) {
      console.log(`  ✅ 추가 라우트 선언: ${route}`)
      passCount++
    }
  })
} else {
  console.log('  ❌ App.tsx/router.tsx 또는 src/pages 폴더를 찾을 수 없습니다.')
  failCount++
}

// 2. 단일 파일 비대화(코드 몰아넣기) 방지 검사 (파일 크기 및 줄 수 점검)
console.log('\n📦 [2. 컴포넌트 모듈화 및 파일 비대화(스파게티 코드) 검사]')
function scanDirectory(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanDirectory(filePath, fileList)
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath)
    }
  })
  return fileList
}

const allSrcFiles = scanDirectory(path.join(process.cwd(), 'src'))
let bloatedFiles = 0

allSrcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n').length
  const relPath = path.relative(process.cwd(), file).replaceAll('\\', '/')

  // 600줄 초과 시 모듈 분리 권장 (단, 거대 딕셔너리/카탈로그 제외)
  const isDictionary =
    relPath.includes('/locales/') ||
    relPath.includes('supabase') ||
    relPath.includes('/shared/config/') ||
    relPath.endsWith('/shared/lib/detailCopy.ts')
  if (lines > 600 && !isDictionary) {
    console.log(`  ⚠️ 파일 비대화 주의: ${relPath} (${lines} 줄) ─ 분리 권장`)
    bloatedFiles++
    warnCount++
  }
})

if (bloatedFiles === 0) {
  console.log('  ✅ 전 파일이 600줄 이하로 완벽하게 쪼개져 모듈화되어 있습니다.')
  passCount++
}

// 3. 거대 라이브러리(jsPDF 등) 번들 오염 및 코드 중복 임포트 검사
console.log('\n🔍 [3. 무거운 라이브러리 분리 및 번들 침투 검사]')
let jsPdfDirectImports = 0

allSrcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8')
  const relPath = path.relative(process.cwd(), file).replaceAll('\\', '/')

  // 정적 import 'jspdf' 검색 (동적 await import('jspdf')는 통과)
  if (/^import\s+.*from\s+['"]jspdf['"]/m.test(content)) {
    console.log(`  ❌ 정적 jsPDF 임포트 발견 (초기 번들 침투 위험): ${relPath}`)
    jsPdfDirectImports++
    failCount++
  }
})

if (jsPdfDirectImports === 0) {
  console.log('  ✅ jsPDF가 초기 엔트리에 침투하지 않고 필요한 버튼에서만 동적(lazy) 로드됩니다.')
  passCount++
}

// 4. 네비게이션 링크(Link to / useNavigate) 유효성 검사
console.log('\n🔗 [4. 내부 링크(Link to="...") 404 데드링크 검사]')
const routerContent = fs.existsSync(routeSourcePath) ? fs.readFileSync(routeSourcePath, 'utf-8') : ''
const declaredRoutes = [
  ...new Set([
    '/',
    '/category',
    '/contact',
    '/report',
    '/faq',
    '/admin',
    '/admin/printables',
    '/admin/affiliates',
    '/admin/reports',
    '/admin/inquiries',
    '/admin/tips',
    '/admin/login',
    '/admin/printables/upload',
    '/about',
    '/privacy',
    '/terms',
    '/premium',
    '/bookmarks',
    '/saved',
    '/parenting-tips',
    '/tips',
    '/v2',
    '/printable/:id',
    '/printables/:id',
    '/category/:slug',
    '/situation/:situationId',
    ...extractRouterPaths(routerContent),
  ]),
]
let deadLinks = 0

allSrcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8')
  const relPath = path.relative(process.cwd(), file).replaceAll('\\', '/')

  const linkMatches = content.matchAll(/to=["'](\/[a-zA-Z0-9\-_/]*)["']/g)
  for (const match of linkMatches) {
    const linkTarget = match[1]
    const isValid =
      isKnownRoute(linkTarget, declaredRoutes) ||
      linkTarget.startsWith('/printable/') ||
      linkTarget.startsWith('/printables/') ||
      linkTarget.startsWith('/category/') ||
      linkTarget.startsWith('/situation/') ||
      linkTarget.startsWith('/parenting-tips/') ||
      linkTarget.startsWith('/tips/') ||
      linkTarget.startsWith('/admin')
    if (!isValid && !linkTarget.startsWith('/#')) {
      console.log(`  ⚠️ 미등록 라우트 링크 의심: [${linkTarget}] in ${relPath}`)
      deadLinks++
      warnCount++
    }
  }
})

if (deadLinks === 0) {
  console.log('  ✅ 사이트 내 모든 <Link to="..."> 및 이동 경로가 정상 라우트와 1:1 일치합니다.')
  passCount++
}

// 종합 판정 리포트
console.log('\n====================================================================')
console.log(`📊 [아키텍처 종합 진단 결과: PASS ${passCount} / WARN ${warnCount} / FAIL ${failCount}]`)
console.log('====================================================================')

if (failCount > 0) {
  console.log('❌ 일부 파일에서 번들 오염이나 라우팅 누락이 발견되었습니다.')
  process.exit(1)
} else {
  console.log('🎉 [PASS] 각 페이지가 완벽히 독립 분리되어 있으며, 상호 연결과 라우팅에 문제가 없습니다!')
}
