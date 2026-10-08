import fs from 'fs'
import path from 'path'

console.log('🔍 [둘리아 인쇄 시스템 & 하단 브랜드 푸터 전수 진단]')
console.log('====================================================\n')

let printPageFound = false
let indexCssFound = false
let pdfGenFound = false

// 1. printPage.ts (즉시 인쇄 HTML 템플릿) 검사
const printPagePath = path.join(process.cwd(), 'src/shared/lib/printPage.ts')
if (fs.existsSync(printPagePath)) {
  printPageFound = true
  const content = fs.readFileSync(printPagePath, 'utf-8')
  console.log('📄 [1. src/shared/lib/printPage.ts 진단]')

  const hasDooliaText = /doolia/i.test(content)
  const hasFooterTag = /<footer|class=".*footer.*"|<div.*footer/i.test(content)
  const hasPageMargin = /@page\s*{[^}]*margin/i.test(content)
  const has100vh = /100vh/i.test(content)

  console.log(`  ├─ 둘리아(DOOLIA) 브랜드 텍스트 포함 여부: ${hasDooliaText ? '✅ 포함됨' : '❌ 없음 (누락)'}`)
  console.log(`  ├─ 하단 푸터 영역 HTML 태그 존재 여부: ${hasFooterTag ? '✅ 존재함' : '❌ 없음 (이미지만 존재)'}`)
  console.log(`  ├─ @page 여백 설정: ${hasPageMargin ? '✅ 선언됨' : '⚠️ 미선언'}`)
  console.log(`  └─ 100vh 사용 여부(2페이지 유발 원인): ${has100vh ? '⚠️ 100vh 사용 중 (위험)' : '✅ 미사용 (안전)'}`)
} else {
  console.log('❌ src/shared/lib/printPage.ts 파일을 찾을 수 없습니다.')
}

// 2. src/index.css (@media print 전역 스타일) 검사
console.log('\n🎨 [2. src/index.css @media print 스타일 진단]')
const indexCssPath = path.join(process.cwd(), 'src/index.css')
if (fs.existsSync(indexCssPath)) {
  indexCssFound = true
  const content = fs.readFileSync(indexCssPath, 'utf-8')

  const hasMediaPrint = /@media\s+print/i.test(content)
  const hidesFooter = /footer\s*{[^}]*display:\s*none/i.test(content) || /\.no-print/i.test(content)
  const hasPageSetup = /@page\s*{[^}]*size:\s*A4/i.test(content)

  console.log(`  ├─ @media print 미디어 쿼리 존재: ${hasMediaPrint ? '✅ 존재함' : '❌ 없음'}`)
  console.log(`  ├─ @page A4 portrait 설정: ${hasPageSetup ? '✅ 선언됨' : '⚠️ 미선언'}`)
  console.log(
    `  └─ 푸터 display:none 또는 숨김 처리 여부: ${hidesFooter ? '⚠️ 숨김 처리됨 (브라우저 Ctrl+P 시 푸터 미노출)' : '✅ 표시 설정됨'}`,
  )
} else {
  console.log('❌ src/index.css 파일을 찾을 수 없습니다.')
}

// 3. PDF 저장 유틸리티 검사 (jsPDF / PDF 푸터 확인)
console.log('\n📑 [3. PDF 생성 파일 푸터 진단]')
const pdfPaths = [
  path.join(process.cwd(), 'src/shared/lib/generatePrintablePdf.ts'),
  path.join(process.cwd(), 'src/features/download/lib/generatePrintablePdf.ts'),
  path.join(process.cwd(), 'src/features/download/ui/DownloadModal.tsx'),
]

let foundPdfFile = false
for (const p of pdfPaths) {
  if (fs.existsSync(p)) {
    foundPdfFile = true
    pdfGenFound = true
    const content = fs.readFileSync(p, 'utf-8')
    const hasPdfFooter = /doolia|둘리아/i.test(content)
    console.log(`  ├─ 파일 위치: ${path.relative(process.cwd(), p)}`)
    console.log(`  └─ PDF 하단 워터마크/푸터 포함 여부: ${hasPdfFooter ? '✅ 포함됨' : '❌ 없음'}`)
    break
  }
}
if (!foundPdfFile) {
  console.log('  ⚠️ 별도 PDF 생성 유틸 경로 없음 (컴포넌트 내 인라인 처리 확인 필요)')
}

void printPageFound
void indexCssFound
void pdfGenFound

// 종합 판정 리포트
console.log('\n====================================================')
console.log('📊 [인쇄 시스템 현황 종합 진단 결과]')
console.log('====================================================')
console.log('1. [즉시 바로 인쇄]: 팝업/iframe 템플릿 내 브랜드 푸터 HTML 탑재 여부 확인')
console.log('2. [브라우저 Ctrl+P]: @media print에서 웹 UI 푸터와 인쇄용 브랜드 푸터 분리 여부 확인')
console.log('3. [PDF 다운로드]: PDF 캔버스 하단 DOOLIA 문구 유지 여부 확인')
console.log('====================================================\n')
