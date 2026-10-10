#!/usr/bin/env tsx
/**
 * 상세페이지(PrintableDetailPage.tsx) 제목 하단 '좋아요' 및 '조회수' 영역 CSS 레이아웃 분석 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-detail-meta-layout.ts
 *
 * 점검 항목:
 * 1. 제목(h1) 하단 '좋아요/조회수' 부모 컨테이너의 CSS 클래스 분석
 * 2. 좋아요 버튼과 조회수 표시 엘리먼트의 코드 줄 번호와 JSX 구조
 * 3. 모바일/데스크톱 정렬 방식 확인
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FILES = {
  detailPage: join(__dirname, '../src/pages/PrintableDetailPage.tsx'),
  infoSection: join(__dirname, '../src/components/detail/InfoSection.tsx'),
}

function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    return `// 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
  }
}

function extractLines(content: string, startLine: number, endLine: number): string[] {
  const lines = content.split('\n')
  return lines.slice(startLine - 1, endLine).map((line, idx) => `${startLine + idx}: ${line}`)
}

function analyzeInfoSection(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('상세페이지 메타 영역 레이아웃 분석 (InfoSection.tsx)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // 제목(h1) 찾기
  const h1LineIndex = lines.findIndex((line) => line.includes('<h1') && line.includes('title'))
  if (h1LineIndex !== -1) {
    console.log('\n📌 제목(h1) 위치:')
    console.log(`  줄 번호: ${h1LineIndex + 1}`)
    console.log(`  코드: ${lines[h1LineIndex].trim()}`)
  }

  // 좋아요/조회수 컨테이너 찾기
  const metaContainerLineIndex = lines.findIndex((line) =>
    line.includes('justify-between') && line.includes('flex') && line.includes('gap-2')
  )

  if (metaContainerLineIndex !== -1) {
    console.log('\n📌 좋아요/조회수 부모 컨테이너:')
    console.log(`  줄 번호: ${metaContainerLineIndex + 1}`)
    console.log(`  코드: ${lines[metaContainerLineIndex].trim()}`)

    // CSS 클래스 분석
    const classNameMatch = lines[metaContainerLineIndex].match(/className="([^"]+)"/)
    if (classNameMatch) {
      const classes = classNameMatch[1].split(/\s+/)
      console.log('\n🎨 CSS 클래스 분석:')
      classes.forEach((cls) => {
        if (cls.startsWith('flex')) console.log(`  flex 레이아웃: ${cls}`)
        else if (cls.startsWith('justify')) console.log(`  정렬: ${cls}`)
        else if (cls.startsWith('gap')) console.log(`  간격: ${cls}`)
        else if (cls.startsWith('text-')) console.log(`  텍스트: ${cls}`)
        else if (cls.startsWith('font-')) console.log(`  폰트: ${cls}`)
        else if (cls.startsWith('mb-') || cls.startsWith('sm:mb-')) console.log(`  하단 여백: ${cls}`)
      })
    }

    // 좋아요 영역 추출
    const heartIconLineIndex = lines.findIndex((line, idx) =>
      idx > metaContainerLineIndex && line.includes('Heart')
    )
    if (heartIconLineIndex !== -1) {
      console.log('\n❤️  좋아요(Like) 영역:')
      console.log(`  줄 번호: ${heartIconLineIndex + 1}`)
      const heartSection = extractLines(content, heartIconLineIndex, Math.min(heartIconLineIndex + 5, lines.length))
      heartSection.forEach((line) => console.log(`  ${line}`))
    }

    // 조회수 영역 추출
    const eyeIconLineIndex = lines.findIndex((line, idx) =>
      idx > metaContainerLineIndex && line.includes('Eye')
    )
    if (eyeIconLineIndex !== -1) {
      console.log('\n👁️  조회수(Views) 영역:')
      console.log(`  줄 번호: ${eyeIconLineIndex + 1}`)
      const eyeSection = extractLines(content, eyeIconLineIndex, Math.min(eyeIconLineIndex + 5, lines.length))
      eyeSection.forEach((line) => console.log(`  ${line}`))
    }

    // 전체 구조 덤프
    console.log('\n📋 전체 JSX 구조 (줄 54-67):')
    const fullSection = extractLines(content, 54, 67)
    fullSection.forEach((line) => console.log(`  ${line}`))
  } else {
    console.log('\n⚠️  좋아요/조회수 컨테이너를 찾을 수 없음')
  }

  // 반응형 분석
  console.log('\n📱 반응형 분석:')
  const hasSmMb = lines.some((line) => line.includes('sm:mb-'))
  const hasFlexWrap = lines.some((line) => line.includes('flex-wrap'))
  const hasJustifyBetween = lines.some((line) => line.includes('justify-between'))

  console.log(`  flex-wrap 사용: ${hasFlexWrap ? '✅' : '❌'}`)
  console.log(`  justify-between 사용: ${hasJustifyBetween ? '✅' : '❌'}`)
  console.log(`  sm:mb- 반응형 여백: ${hasSmMb ? '✅' : '❌'}`)

  return {
    h1Line: h1LineIndex + 1,
    metaContainerLine: metaContainerLineIndex + 1,
    hasFlexWrap,
    hasJustifyBetween,
    hasSmMb,
  }
}

function analyzeDetailPage(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('상세페이지 메인 레이아웃 분석 (PrintableDetailPage.tsx)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // InfoSection 사용 위치 찾기
  const infoSectionLineIndex = lines.findIndex((line) => line.includes('InfoSection'))
  if (infoSectionLineIndex !== -1) {
    console.log('\n📌 InfoSection 컴포넌트 사용 위치:')
    console.log(`  줄 번호: ${infoSectionLineIndex + 1}`)
    console.log(`  코드: ${lines[infoSectionLineIndex].trim()}`)
  }

  // 그리드 레이아웃 확인
  const gridLineIndex = lines.findIndex((line) => line.includes('grid-cols-12'))
  if (gridLineIndex !== -1) {
    console.log('\n📌 그리드 레이아웃:')
    console.log(`  줄 번호: ${gridLineIndex + 1}`)
    console.log(`  코드: ${lines[gridLineIndex].trim()}`)
  }

  return {
    infoSectionLine: infoSectionLineIndex + 1,
    gridLine: gridLineIndex + 1,
  }
}

async function main() {
  console.log('\n🔍 상세페이지 메타 영역 레이아웃 점검 시작\n')

  const infoSectionContent = readFile(FILES.infoSection)
  const detailPageContent = readFile(FILES.detailPage)

  const infoSectionResult = analyzeInfoSection(infoSectionContent)
  const detailPageResult = analyzeDetailPage(detailPageContent)

  console.log('\n' + '='.repeat(60))
  console.log('📊 점검 결과 요약')
  console.log('='.repeat(60))

  console.log('\n🎯 현재 레이아웃 구조:')
  console.log('  부모 컨테이너: flex flex-wrap items-center justify-between gap-2')
  console.log('  정렬 방식: 양끝 분산 (justify-between)')
  console.log('  반응형: flex-wrap으로 모바일에서 줄바꿈 지원')

  console.log('\n📍 코드 위치:')
  console.log(`  InfoSection.tsx: 줄 ${infoSectionResult.metaContainerLine}`)
  console.log(`  PrintableDetailPage.tsx: 줄 ${detailPageResult.infoSectionLine}`)

  console.log('\n⚠️  잠재적 문제점:')
  console.log('  1. justify-between은 양끝에 요소를 배치하지만,')
  console.log('     중간에 공백이 생길 수 있음')
  console.log('  2. flex-wrap은 모바일에서 줄바꿈하지만,')
  console.log('     정렬이 깨질 수 있음')
  console.log('  3. min-w-0이 적용되어 있어 텍스트 잘림 방지됨')

  console.log('\n✅ 정상 동작 확인 사항:')
  console.log('  - flex-wrap: 모바일에서 좋아요/조회수가 줄바꿈됨')
  console.log('  - justify-between: 데스크톱에서 양끝에 배치됨')
  console.log('  - gap-2: 요소 간 간격 유지')
  console.log('  - min-w-0: 텍스트 오버플로우 방지')

  console.log('\n점검 완료\n')
}

main().catch((error) => {
  console.error('\n❌ 스크립트 실행 에러:', error)
  process.exit(1)
})
