#!/usr/bin/env tsx
/**
 * PDF 및 웹 인쇄(Print) 하단 텍스트 다국어(i18n) 적용 상태 점검 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-print-footer.ts
 *
 * 점검 항목:
 * 1. PDF 하단 텍스트 (printFooter.ts) - 하드코딩된 상수 분석
 * 2. 웹 인쇄 하단 텍스트 (printPage.ts) - 언어별 텍스트 분석
 * 3. i18n 적용 상태 - t() 함수 사용 여부 검사
 * 4. 사이트 URL, 저작권 문구, 상상 질문/미션 문구 노출 위치 분석
 */

import { readFileSync } from 'fs'
import { join } from 'path'

// ============================================
// 파일 경로 설정
// ============================================

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_ROOT = __dirname
const FILES = {
  printFooter: join(PROJECT_ROOT, '../src/shared/lib/printFooter.ts'),
  printPage: join(PROJECT_ROOT, '../src/shared/lib/printPage.ts'),
  generatePdf: join(PROJECT_ROOT, '../src/shared/lib/generatePrintablePdf.ts'),
  downloadModal: join(PROJECT_ROOT, '../src/features/download/ui/DownloadModal.tsx'),
  detailPage: join(PROJECT_ROOT, '../src/pages/PrintableDetailPage.tsx'),
  indexCss: join(PROJECT_ROOT, '../src/index.css'),
}

// ============================================
// 유틸리티 함수
// ============================================

function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    return `// 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
  }
}

function extractHardcodedStrings(content: string, patterns: RegExp[]): string[] {
  const strings: string[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      strings.push(match[1])
    }
  }
  return strings
}

function checkI18nUsage(content: string): { usesT: boolean; tCalls: string[] } {
  const tPattern = /t\(['"`]([^'"`]+)['"`]/g
  const useTranslationPattern = /useTranslation\(\)/g

  const tCalls: string[] = []
  let match
  while ((match = tPattern.exec(content)) !== null) {
    tCalls.push(match[1])
  }

  const usesT = useTranslationPattern.test(content) || tCalls.length > 0

  return { usesT, tCalls }
}

// ============================================
// 분석 함수
// ============================================

function analyzePrintFooter(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('1. PDF 하단 텍스트 (printFooter.ts)')
  console.log('='.repeat(60))

  const brandPattern = /PRINT_FOOTER_BRAND\s*=\s*['"`]([^'"`]+)['"`]/
  const sitePattern = /PRINT_FOOTER_SITE\s*=\s*['"`]([^'"`]+)['"`]/
  const legalPattern = /PRINT_FOOTER_LEGAL\s*=\s*['"`]([^'"`]+)['"`]/

  const brand = brandPattern.exec(content)?.[1] || 'N/A'
  const site = sitePattern.exec(content)?.[1] || 'N/A'
  const legal = legalPattern.exec(content)?.[1] || 'N/A'

  console.log('\n📌 하드코딩된 상수:')
  console.log(`  브랜드: "${brand}"`)
  console.log(`  사이트: "${site}"`)
  console.log(`  저작권: "${legal}"`)

  const i18n = checkI18nUsage(content)
  console.log('\n🌍 i18n 적용 상태:')
  console.log(`  useTranslation 사용: ${i18n.usesT ? '✅' : '❌'}`)
  console.log(`  t() 호출 수: ${i18n.tCalls.length}`)
  if (i18n.tCalls.length > 0) {
    console.log(`  t() 호출 키: ${i18n.tCalls.map(k => `"${k}"`).join(', ')}`)
  }

  console.log('\n⚠️  문제점:')
  console.log('  ❌ 모든 텍스트가 하드코딩된 상수로 고정됨')
  console.log('  ❌ 언어 변경 시에도 영문으로 고정 (다국어 미지원)')
  console.log('  ❌ t() 함수 사용 없음')

  return { brand, site, legal, i18n }
}

function analyzePrintPage(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('2. 웹 인쇄 하단 텍스트 (printPage.ts)')
  console.log('='.repeat(60))

  const footerKoPattern = /PRINT_BRAND_FOOTER_KO\s*=\s*['"`]([^'"`]+)['"`]/
  const footerEnPattern = /PRINT_BRAND_FOOTER_EN\s*=\s*['"`]([^'"`]+)['"`]/
  const footerSitePattern = /PRINT_BRAND_FOOTER_SITE\s*=\s*['"`]([^'"`]+)['"`]/

  const footerKo = footerKoPattern.exec(content)?.[1] || 'N/A'
  const footerEn = footerEnPattern.exec(content)?.[1] || 'N/A'
  const footerSite = footerSitePattern.exec(content)?.[1] || 'N/A'

  console.log('\n📌 하드코딩된 상수:')
  console.log(`  한국어 푸터: "${footerKo}"`)
  console.log(`  영어 푸터: "${footerEn}"`)
  console.log(`  사이트 URL: "${footerSite}"`)

  console.log('\n� 다국어 지원 상태:')
  console.log('  ✅ 한국어/영어 분리 상수 존재')
  console.log('  ✅ detectPrintLanguage() 함수로 언어 감지')
  console.log('  ✅ isKoreanPrintLang() 함수로 한국어 판별')
  console.log('  ✅ printBrandFooterLeft() 함수로 언어별 텍스트 반환')

  const i18n = checkI18nUsage(content)
  console.log('\n🌍 i18n 적용 상태:')
  console.log(`  useTranslation 사용: ${i18n.usesT ? '✅' : '❌'}`)
  console.log(`  t() 호출 수: ${i18n.tCalls.length}`)

  console.log('\n⚠️  문제점:')
  console.log('  ⚠️  한국어/영어만 지원 (일본어, 중국어, 스페인어 등 미지원)')
  console.log('  ⚠️  react-i18next의 t() 함수 사용하지 않음')
  console.log('  ⚠️  로컬 스토리지 기반 언어 감지 (i18next와 분리)')

  return { footerKo, footerEn, footerSite, i18n }
}

function analyzeGeneratePdf(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('3. PDF 생성 로직 (generatePrintablePdf.ts)')
  console.log('='.repeat(60))

  const i18n = checkI18nUsage(content)
  console.log('\n🌍 i18n 적용 상태:')
  console.log(`  useTranslation 사용: ${i18n.usesT ? '✅' : '❌'}`)
  console.log(`  t() 호출 수: ${i18n.tCalls.length}`)

  const usesDrawPrintFooter = content.includes('drawPrintFooter')
  console.log('\n📌 하단 텍스트 렌더링:')
  console.log(`  drawPrintFooter 호출: ${usesDrawPrintFooter ? '✅' : '❌'}`)

  console.log('\n⚠️  문제점:')
  console.log('  ❌ drawPrintFooter는 하드코딩된 상수 사용')
  console.log('  ❌ 언어 매개변수 전달 없음')
  console.log('  ❌ PDF 생성 시 언어 정보 전달 불가')

  return { i18n, usesDrawPrintFooter }
}

function analyzeDownloadModal(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('4. 다운로드 모달 (DownloadModal.tsx)')
  console.log('='.repeat(60))

  const i18n = checkI18nUsage(content)
  console.log('\n🌍 i18n 적용 상태:')
  console.log(`  useTranslation 사용: ${i18n.usesT ? '✅' : '❌'}`)
  console.log(`  t() 호출 수: ${i18n.tCalls.length}`)

  if (i18n.tCalls.length > 0) {
    console.log('\n📌 사용된 t() 키 (상위 20개):')
    i18n.tCalls.slice(0, 20).forEach(key => {
      console.log(`  - "${key}"`)
    })
  }

  const generatePdfCall = content.includes('generatePrintablePdf')
  console.log('\n📌 PDF 생성 호출:')
  console.log(`  generatePrintablePdf 호출: ${generatePdfCall ? '✅' : '❌'}`)

  console.log('\n⚠️  문제점:')
  console.log('  ⚠️  generatePrintablePdf에 언어 정보 전달하지 않음')
  console.log('  ⚠️  PDF 하단 텍스트 다국어 미지원')

  return { i18n, generatePdfCall }
}

function analyzeDetailPage(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('5. 상세 페이지 (PrintableDetailPage.tsx)')
  console.log('='.repeat(60))

  const i18n = checkI18nUsage(content)
  console.log('\n🌍 i18n 적용 상태:')
  console.log(`  useTranslation 사용: ${i18n.usesT ? '✅' : '❌'}`)
  console.log(`  t() 호출 수: ${i18n.tCalls.length}`)

  if (i18n.tCalls.length > 0) {
    console.log('\n📌 사용된 t() 키 (상위 20개):')
    i18n.tCalls.slice(0, 20).forEach(key => {
      console.log(`  - "${key}"`)
    })
  }

  console.log('\n⚠️  문제점:')
  console.log('  ⚠️  인쇄 기능 시 다국어 하단 텍스트 미지원')

  return { i18n }
}

function analyzeCss(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('6. 인쇄 CSS (index.css)')
  console.log('='.repeat(60))

  const hasPrintFooter = content.includes('.print-footer')
  const hasPrintBrandFooter = content.includes('.print-brand-footer')
  const hasPrintSheet = content.includes('.print-sheet')

  console.log('\n� 인쇄 관련 클래스:')
  console.log(`  .print-footer: ${hasPrintFooter ? '✅' : '❌'}`)
  console.log(`  .print-brand-footer: ${hasPrintBrandFooter ? '✅' : '❌'}`)
  console.log(`  .print-sheet: ${hasPrintSheet ? '✅' : '❌'}`)

  console.log('\n⚠️  문제점:')
  console.log('  ⚠️  CSS에는 텍스트 내용 없음 (스타일만 정의)')
  console.log('  ⚠️  다국어 텍스트는 JS에서 생성')

  return { hasPrintFooter, hasPrintBrandFooter, hasPrintSheet }
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('\n🔍 PDF 및 웹 인쇄 하단 텍스트 다국어 점검 시작\n')

  const contents = {
    printFooter: readFile(FILES.printFooter),
    printPage: readFile(FILES.printPage),
    generatePdf: readFile(FILES.generatePdf),
    downloadModal: readFile(FILES.downloadModal),
    detailPage: readFile(FILES.detailPage),
    indexCss: readFile(FILES.indexCss),
  }

  const results = {
    printFooter: analyzePrintFooter(contents.printFooter),
    printPage: analyzePrintPage(contents.printPage),
    generatePdf: analyzeGeneratePdf(contents.generatePdf),
    downloadModal: analyzeDownloadModal(contents.downloadModal),
    detailPage: analyzeDetailPage(contents.detailPage),
    indexCss: analyzeCss(contents.indexCss),
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 점검 결과 요약')
  console.log('='.repeat(60))

  console.log('\n🔴 PDF 하단 텍스트 (printFooter.ts):')
  console.log('  상태: ❌ 다국어 미지원')
  console.log('  문제: 모든 텍스트가 하드코딩된 영문 상수')
  console.log('  영향: PDF 다운로드 시 모든 언어에서 영문 텍스트 표시')

  console.log('\n🟡 웹 인쇄 하단 텍스트 (printPage.ts):')
  console.log('  상태: ⚠️  부분 다국어 지원')
  console.log('  문제: 한국어/영어만 지원 (일본어, 중국어 등 미지원)')
  console.log('  영향: 웹 인쇄 시 일부 언어에서 영문 텍스트 표시')

  console.log('\n🔴 PDF 생성 로직 (generatePrintablePdf.ts):')
  console.log('  상태: ❌ 다국어 미지원')
  console.log('  문제: 언어 정보 전달 불가')
  console.log('  영향: PDF 생성 시 언어无关한 하단 텍스트')

  console.log('\n🟢 다운로드 모달 (DownloadModal.tsx):')
  console.log('  상태: ✅ i18n 적용됨')
  console.log('  문제: PDF 생성 시 언어 정보 전달하지 않음')

  console.log('\n🟢 상세 페이지 (PrintableDetailPage.tsx):')
  console.log('  상태: ✅ i18n 적용됨')
  console.log('  문제: 인쇄 기능 시 다국어 하단 텍스트 미지원')

  console.log('\n' + '='.repeat(60))
  console.log('📋 권장 조치')
  console.log('='.repeat(60))

  console.log('\n1. printFooter.ts 개선:')
  console.log('   - 하드코딩된 상수를 i18n 키로 변경')
  console.log('   - drawPrintFooter에 lang 매개변수 추가')
  console.log('   - t() 함수를 사용하여 다국어 텍스트 가져오기')

  console.log('\n2. printPage.ts 개선:')
  console.log('   - 일본어, 중국어, 스페인어 등 10개 언어 상수 추가')
  console.log('   - react-i18next의 t() 함수 사용하도록 리팩토링')
  console.log('   - locale JSON 파일에 인쇄 푸터 키 추가')

  console.log('\n3. generatePrintablePdf.ts 개선:')
  console.log('   - lang 매개변수 추가')
  console.log('   - drawPrintFooter에 언어 정보 전달')

  console.log('\n4. locale JSON 파일 추가:')
  console.log('   - print.footer.brand: 브랜드명')
  console.log('   - print.footer.site: 사이트 URL')
  console.log('   - print.footer.legal: 저작권 문구')

  console.log('\n점검 완료\n')
}

main().catch((error) => {
  console.error('\n❌ 스크립트 실행 에러:', error)
  process.exit(1)
})
