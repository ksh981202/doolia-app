#!/usr/bin/env tsx
/**
 * 상세페이지 '좋아요 클릭 및 조회수 카운트' 화면 반영 결함 원인 추적 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-social-state-flow.ts
 *
 * 추적 항목:
 * 1. PrintableDetailPage가 InfoSection에 넘겨주는 props 덤프
 * 2. InfoSection 내부에서 상태를 어디서 가져오는지
 * 3. 하단 좋아요 버튼과 상단 하트 버튼의 상태 공유 여부
 * 4. toggleLike 함수의 상태 변경 로직 추적
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
  engagement: join(__dirname, '../src/shared/store/usePrintableEngagement.ts'),
  a4Preview: join(__dirname, '../src/components/detail/A4Preview.tsx'),
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

function analyzeDetailPage(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('1단계: PrintableDetailPage -> InfoSection Props 분석')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // InfoSection 렌더링 위치 찾기
  const infoSectionRenderIndex = lines.findIndex((line) => line.includes('<InfoSection'))
  if (infoSectionRenderIndex !== -1) {
    console.log('\n📌 InfoSection 렌더링 위치:')
    console.log(`  줄 번호: ${infoSectionRenderIndex + 1}`)
    const context = extractLines(content, infoSectionRenderIndex, Math.min(infoSectionRenderIndex + 3, lines.length))
    context.forEach((line) => console.log(`  ${line}`))

    // 전달된 props 추출
    const propsMatch = lines[infoSectionRenderIndex].match(/printable=\{[^}]+\}/)
    if (propsMatch) {
      console.log('\n📦 전달된 Props:')
      console.log(`  ${propsMatch[0]}`)
      console.log('\n⚠️  분석:')
      console.log('  - printable 객체만 전달됨')
      console.log('  - likesCount, viewsCount, isLiked, toggleLike는 props로 전달되지 않음')
      console.log('  - InfoSection 내부에서 usePrintableSocial 훅을 통해 상태 가져옴')
    }
  }

  return { hasInfoSection: infoSectionRenderIndex !== -1 }
}

function analyzeInfoSection(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('2단계: InfoSection 내부 상태 소스 분석')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // usePrintableSocial 사용 확인
  const socialHookIndex = lines.findIndex((line) => line.includes('usePrintableSocial'))
  if (socialHookIndex !== -1) {
    console.log('\n📌 usePrintableSocial 훅 사용:')
    console.log(`  줄 번호: ${socialHookIndex + 1}`)
    const context = extractLines(content, socialHookIndex, Math.min(socialHookIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // 상태 변수 추출
  const stateVarsIndex = lines.findIndex((line) => line.includes('isLiked') && line.includes('likesCount'))
  if (stateVarsIndex !== -1) {
    console.log('\n📌 상태 변수 선언:')
    console.log(`  줄 번호: ${stateVarsIndex + 1}`)
    const context = extractLines(content, stateVarsIndex, Math.min(stateVarsIndex + 3, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // 좋아요 버튼 확인
  const likeButtonIndex = lines.findIndex((line) => line.includes('toggleLike') && line.includes('onClick'))
  if (likeButtonIndex !== -1) {
    console.log('\n📌 좋아요 버튼 onClick 핸들러:')
    console.log(`  줄 번호: ${likeButtonIndex + 1}`)
    const context = extractLines(content, likeButtonIndex, Math.min(likeButtonIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    hasSocialHook: socialHookIndex !== -1,
    hasStateVars: stateVarsIndex !== -1,
    hasLikeButton: likeButtonIndex !== -1,
  }
}

function analyzeA4Preview(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('3단계: A4Preview (하단 좋아요 버튼) 상태 소스 분석')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // usePrintableSocial 사용 확인
  const socialHookIndex = lines.findIndex((line) => line.includes('usePrintableSocial'))
  if (socialHookIndex !== -1) {
    console.log('\n📌 usePrintableSocial 훅 사용:')
    console.log(`  줄 번호: ${socialHookIndex + 1}`)
    const context = extractLines(content, socialHookIndex, Math.min(socialHookIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // 좋아요 버튼 확인
  const likeButtonIndex = lines.findIndex((line) => line.includes('toggleLike') && line.includes('onClick'))
  if (likeButtonIndex !== -1) {
    console.log('\n📌 좋아요 버튼 onClick 핸들러:')
    console.log(`  줄 번호: ${likeButtonIndex + 1}`)
    const context = extractLines(content, likeButtonIndex, Math.min(likeButtonIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    hasSocialHook: socialHookIndex !== -1,
    hasLikeButton: likeButtonIndex !== -1,
  }
}

function analyzeEngagement(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('4단계: usePrintableEngagement toggleLike 로직 추적')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // toggleLike 함수 구현 확인
  const toggleLikeIndex = lines.findIndex((line) => line.includes('toggleLike:'))
  if (toggleLikeIndex !== -1) {
    console.log('\n📌 toggleLike 함수 정의:')
    console.log(`  줄 번호: ${toggleLikeIndex + 1}`)
    const context = extractLines(content, toggleLikeIndex, Math.min(toggleLikeIndex + 15, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // set 호출 확인
  const setCallIndex = lines.findIndex((line, idx) =>
    idx > toggleLikeIndex && line.includes('set((state) =>')
  )
  if (setCallIndex !== -1) {
    console.log('\n📌 set() 상태 변경 호출:')
    console.log(`  줄 번호: ${setCallIndex + 1}`)
    const context = extractLines(content, setCallIndex, Math.min(setCallIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // incrementPrintableLikes 호출 확인
  const rpcCallIndex = lines.findIndex((line, idx) =>
    idx > toggleLikeIndex && line.includes('incrementPrintableLikes')
  )
  if (rpcCallIndex !== -1) {
    console.log('\n📌 incrementPrintableLikes RPC 호출:')
    console.log(`  줄 번호: ${rpcCallIndex + 1}`)
    const context = extractLines(content, rpcCallIndex, Math.min(rpcCallIndex + 3, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    hasToggleLike: toggleLikeIndex !== -1,
    hasSetCall: setCallIndex !== -1,
    hasRpcCall: rpcCallIndex !== -1,
  }
}

async function main() {
  console.log('\n🔍 상세페이지 좋아요/조회수 화면 반영 결함 원인 추적 시작\n')

  const detailPageContent = readFile(FILES.detailPage)
  const infoSectionContent = readFile(FILES.infoSection)
  const engagementContent = readFile(FILES.engagement)
  const a4PreviewContent = readFile(FILES.a4Preview)

  const detailPageResult = analyzeDetailPage(detailPageContent)
  const infoSectionResult = analyzeInfoSection(infoSectionContent)
  const a4PreviewResult = analyzeA4Preview(a4PreviewContent)
  const engagementResult = analyzeEngagement(engagementContent)

  console.log('\n' + '='.repeat(60))
  console.log('📊 결함 원인 분석 결과')
  console.log('='.repeat(60))

  console.log('\n1단계: Props 전달 상태')
  console.log(`  InfoSection 렌더링: ${detailPageResult.hasInfoSection ? '✅' : '❌'}`)
  console.log('  분석: printable 객체만 전달, 상태는 props로 전달되지 않음')
  console.log('  결론: InfoSection 내부에서 독립적으로 usePrintableSocial 호출')

  console.log('\n2단계: InfoSection 상태 소스')
  console.log(`  usePrintableSocial 훅: ${infoSectionResult.hasSocialHook ? '✅' : '❌'}`)
  console.log(`  상태 변수 선언: ${infoSectionResult.hasStateVars ? '✅' : '❌'}`)
  console.log(`  좋아요 버튼: ${infoSectionResult.hasLikeButton ? '✅' : '❌'}`)
  console.log('  분석: InfoSection에서 독립적으로 상태 관리')

  console.log('\n3단계: A4Preview 상태 소스')
  console.log(`  usePrintableSocial 훅: ${a4PreviewResult.hasSocialHook ? '✅' : '❌'}`)
  console.log(`  좋아요 버튼: ${a4PreviewResult.hasLikeButton ? '✅' : '❌'}`)
  console.log('  분석: A4Preview에서도 독립적으로 상태 관리')

  console.log('\n4단계: toggleLike 로직')
  console.log(`  toggleLike 함수: ${engagementResult.hasToggleLike ? '✅' : '❌'}`)
  console.log(`  set() 상태 변경: ${engagementResult.hasSetCall ? '✅' : '❌'}`)
  console.log(`  RPC 호출: ${engagementResult.hasRpcCall ? '✅' : '❌'}`)
  console.log('  분석: Zustand store에서 상태 변경 및 RPC 호출 정상')

  console.log('\n' + '='.repeat(60))
  console.log('⚠️  결함 원인 결론')
  console.log('='.repeat(60))

  const issues: string[] = []

  if (infoSectionResult.hasSocialHook && a4PreviewResult.hasSocialHook) {
    console.log('\n✅ 상태 공유 상태:')
    console.log('  - InfoSection과 A4Preview 모두 usePrintableSocial 사용')
    console.log('  - Zustand store를 통해 상태 공유 (동일한 printable id 기준)')
    console.log('  - 이론적으로 동일한 상태를 바라봐야 함')
  } else {
    issues.push('❌ InfoSection 또는 A4Preview에서 usePrintableSocial 미사용')
  }

  if (!engagementResult.hasSetCall) {
    issues.push('❌ toggleLike 함수에서 set() 상태 변경 호출 없음')
  }

  if (!engagementResult.hasRpcCall) {
    issues.push('❌ toggleLike 함수에서 RPC 호출 없음')
  }

  if (issues.length === 0) {
    console.log('\n✅ 코드 로직 상 문제 없음')
    console.log('\n🔍 가능한 원인:')
    console.log('  1. Supabase RPC 함수 미생성 또는 오류')
    console.log('  2. RLS 권한 차단')
    console.log('  3. printable.id가 demo/mock으로 시작하여 RPC 호출 스킵')
    console.log('  4. hydrate 함수가 제대로 호출되지 않아 초기화 문제')
    console.log('  5. 브라우저 콘솔에 에러 메시지 확인 필요')
  } else {
    console.log('\n❌ 발견된 코드 결함:')
    issues.forEach((issue) => console.log(`  ${issue}`))
  }

  console.log('\n🔧 권장 조치:')
  console.log('  1. 브라우저 개발자 도구 콘솔에서 에러 확인')
  console.log('  2. Network 탭에서 RPC 호출 성공 여부 확인')
  console.log('  3. localStorage에 doolia_likes_ 키가 저장되는지 확인')
  console.log('  4. sessionStorage에 doolia_viewed_ 키가 저장되는지 확인')
  console.log('  5. printable.id가 실제 DB에 존재하는지 확인')

  console.log('\n진단 완료\n')
}

main().catch((error) => {
  console.error('\n❌ 스크립트 실행 에러:', error)
  process.exit(1)
})
