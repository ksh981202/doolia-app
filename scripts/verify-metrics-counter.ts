#!/usr/bin/env tsx
/**
 * 상세페이지 '좋아요' 및 '조회수' 카운팅 로직 진단 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-metrics-counter.ts
 *
 * 진단 항목:
 * 1. 조회수(Views): 페이지 로드 시 increment_views 호출 여부, SessionStorage 중복 방지 확인
 * 2. 좋아요(Likes): 버튼 클릭 핸들러 DB 업데이트 여부 확인
 * 3. Supabase DB 연결: RPC 함수 존재 여부 확인
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
  service: join(__dirname, '../src/services/printableService.ts'),
  env: join(__dirname, '../.env'),
}

function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    return `// 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
  }
}

function analyzeDetailPage(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('상세페이지 분석 (PrintableDetailPage.tsx)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // recordView 호출 확인
  const recordViewCallIndex = lines.findIndex((line) => line.includes('recordView'))
  if (recordViewCallIndex !== -1) {
    console.log('\n✅ 조회수 기록 호출 발견:')
    console.log(`  줄 번호: ${recordViewCallIndex + 1}`)
    const context = extractLines(content, recordViewCallIndex, Math.min(recordViewCallIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  } else {
    console.log('\n❌ 조회수 기록 호출 없음')
  }

  // useEffect에서 recordView 호출 확인
  const useEffectIndex = lines.findIndex((line, idx) =>
    line.includes('useEffect') && lines.slice(idx, idx + 10).some((l) => l.includes('recordView'))
  )
  if (useEffectIndex !== -1) {
    console.log('\n✅ useEffect에서 recordView 호출 확인:')
    console.log(`  줄 번호: ${useEffectIndex + 1}`)
    const context = extractLines(content, useEffectIndex, Math.min(useEffectIndex + 10, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return { hasRecordView: recordViewCallIndex !== -1, hasUseEffect: useEffectIndex !== -1 }
}

function analyzeEngagement(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('Engagement Store 분석 (usePrintableEngagement.ts)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // SessionStorage 중복 방지 확인
  const sessionViewIndex = lines.findIndex((line) => line.includes('hasSessionView'))
  if (sessionViewIndex !== -1) {
    console.log('\n✅ SessionStorage 중복 방지 로직 발견:')
    console.log(`  줄 번호: ${sessionViewIndex + 1}`)
    const context = extractLines(content, sessionViewIndex, Math.min(sessionViewIndex + 15, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // incrementPrintableViews 호출 확인
  const viewsRpcIndex = lines.findIndex((line) => line.includes('incrementPrintableViews'))
  if (viewsRpcIndex !== -1) {
    console.log('\n✅ incrementPrintableViews RPC 호출 발견:')
    console.log(`  줄 번호: ${viewsRpcIndex + 1}`)
    const context = extractLines(content, viewsRpcIndex, Math.min(viewsRpcIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // toggleLike 함수 확인
  const toggleLikeIndex = lines.findIndex((line) => line.includes('toggleLike:'))
  if (toggleLikeIndex !== -1) {
    console.log('\n✅ toggleLike 함수 발견:')
    console.log(`  줄 번호: ${toggleLikeIndex + 1}`)
    const context = extractLines(content, toggleLikeIndex, Math.min(toggleLikeIndex + 12, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // incrementPrintableLikes 호출 확인
  const likesRpcIndex = lines.findIndex((line) => line.includes('incrementPrintableLikes'))
  if (likesRpcIndex !== -1) {
    console.log('\n✅ incrementPrintableLikes RPC 호출 발견:')
    console.log(`  줄 번호: ${likesRpcIndex + 1}`)
    const context = extractLines(content, likesRpcIndex, Math.min(likesRpcIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    hasSessionStorage: sessionViewIndex !== -1,
    hasViewsRpc: viewsRpcIndex !== -1,
    hasToggleLike: toggleLikeIndex !== -1,
    hasLikesRpc: likesRpcIndex !== -1,
  }
}

function analyzeService(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('Service Layer 분석 (printableService.ts)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // RPC 함수 확인
  const rpcFunctions = [
    'increment_printable_views',
    'increment_printable_likes',
    'increment_printable_downloads',
    'increment_likes',
  ]

  console.log('\n📋 RPC 함수 호출 확인:')
  rpcFunctions.forEach((rpc) => {
    const index = lines.findIndex((line) => line.includes(rpc))
    if (index !== -1) {
      console.log(`  ✅ ${rpc}: 줄 ${index + 1}`)
    } else {
      console.log(`  ❌ ${rpc}: 미발견`)
    }
  })

  // demo/mock 체크 로직 확인
  const demoCheckIndex = lines.findIndex((line) => line.includes('demo-') || line.includes('mock-'))
  if (demoCheckIndex !== -1) {
    console.log('\n✅ Demo/Mock 데이터 체크 로직 발견:')
    console.log(`  줄 번호: ${demoCheckIndex + 1}`)
    const context = extractLines(content, demoCheckIndex, Math.min(demoCheckIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    rpcViews: lines.some((line) => line.includes('increment_printable_views')),
    rpcLikes: lines.some((line) => line.includes('increment_printable_likes')),
    rpcDownloads: lines.some((line) => line.includes('increment_printable_downloads')),
    hasDemoCheck: demoCheckIndex !== -1,
  }
}

function analyzeInfoSection(content: string) {
  console.log('\n' + '='.repeat(60))
  console.log('InfoSection 컴포넌트 분석 (InfoSection.tsx)')
  console.log('='.repeat(60))

  const lines = content.split('\n')

  // toggleLike 호출 확인
  const toggleLikeCallIndex = lines.findIndex((line) => line.includes('toggleLike'))
  if (toggleLikeCallIndex !== -1) {
    console.log('\n✅ toggleLike 호출 발견:')
    console.log(`  줄 번호: ${toggleLikeCallIndex + 1}`)
    const context = extractLines(content, toggleLikeCallIndex, Math.min(toggleLikeCallIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  // usePrintableSocial 사용 확인
  const socialHookIndex = lines.findIndex((line) => line.includes('usePrintableSocial'))
  if (socialHookIndex !== -1) {
    console.log('\n✅ usePrintableSocial 훅 사용 확인:')
    console.log(`  줄 번호: ${socialHookIndex + 1}`)
    const context = extractLines(content, socialHookIndex, Math.min(socialHookIndex + 5, lines.length))
    context.forEach((line) => console.log(`  ${line}`))
  }

  return {
    hasToggleLikeCall: toggleLikeCallIndex !== -1,
    hasSocialHook: socialHookIndex !== -1,
  }
}

function extractLines(content: string, startLine: number, endLine: number): string[] {
  const lines = content.split('\n')
  return lines.slice(startLine - 1, endLine).map((line, idx) => `${startLine + idx}: ${line}`)
}

async function main() {
  console.log('\n🔍 상세페이지 메트릭 카운팅 로직 진단 시작\n')

  const detailPageContent = readFile(FILES.detailPage)
  const infoSectionContent = readFile(FILES.infoSection)
  const engagementContent = readFile(FILES.engagement)
  const serviceContent = readFile(FILES.service)

  const detailPageResult = analyzeDetailPage(detailPageContent)
  const engagementResult = analyzeEngagement(engagementContent)
  const serviceResult = analyzeService(serviceContent)
  const infoSectionResult = analyzeInfoSection(infoSectionContent)

  console.log('\n' + '='.repeat(60))
  console.log('📊 진단 결과 요약')
  console.log('='.repeat(60))

  console.log('\n🔍 조회수(Views) 로직:')
  console.log(`  페이지 로드 시 recordView 호출: ${detailPageResult.hasRecordView ? '✅' : '❌'}`)
  console.log(`  useEffect에서 호출: ${detailPageResult.hasUseEffect ? '✅' : '❌'}`)
  console.log(`  SessionStorage 중복 방지: ${engagementResult.hasSessionStorage ? '✅' : '❌'}`)
  console.log(`  increment_printable_views RPC: ${serviceResult.rpcViews ? '✅' : '❌'}`)

  console.log('\n❤️  좋아요(Likes) 로직:')
  console.log(`  toggleLike 함수 구현: ${engagementResult.hasToggleLike ? '✅' : '❌'}`)
  console.log(`  InfoSection에서 호출: ${infoSectionResult.hasToggleLikeCall ? '✅' : '❌'}`)
  console.log(`  usePrintableSocial 훅: ${infoSectionResult.hasSocialHook ? '✅' : '❌'}`)
  console.log(`  increment_printable_likes RPC: ${serviceResult.rpcLikes ? '✅' : '❌'}`)

  console.log('\n🗄️  Supabase 연결:')
  console.log(`  Demo/Mock 체크 로직: ${serviceResult.hasDemoCheck ? '✅' : '❌'}`)
  console.log(`  increment_printable_downloads RPC: ${serviceResult.rpcDownloads ? '✅' : '❌'}`)

  console.log('\n' + '='.repeat(60))
  console.log('⚠️  잠재적 문제점')
  console.log('='.repeat(60))

  const issues: string[] = []

  if (!detailPageResult.hasRecordView) {
    issues.push('❌ 페이지 로드 시 조회수 기록 호출 없음')
  }
  if (!engagementResult.hasSessionStorage) {
    issues.push('❌ SessionStorage 중복 방지 로직 없음 (새로고침 시 조회수 중복 카운트)')
  }
  if (!serviceResult.rpcViews) {
    issues.push('❌ increment_printable_views RPC 함수 미호출 (DB 업데이트 안됨)')
  }
  if (!engagementResult.hasToggleLike) {
    issues.push('❌ toggleLike 함수 미구현')
  }
  if (!serviceResult.rpcLikes) {
    issues.push('❌ increment_printable_likes RPC 함수 미호출 (DB 업데이트 안됨)')
  }
  if (!serviceResult.hasDemoCheck) {
    issues.push('❌ Demo/Mock 데이터 체크 로직 없음 (데모 데이터에서도 RPC 호출 가능)')
  }

  if (issues.length === 0) {
    console.log('\n✅ 모든 로직이 정상적으로 구현되어 있습니다.')
    console.log('\n📋 필요한 Supabase RPC 함수:')
    console.log('  - increment_printable_views(p_id: text)')
    console.log('  - increment_printable_likes(p_id: text, p_delta: integer)')
    console.log('  - increment_printable_downloads(p_id: text)')
    console.log('  - increment_likes(printable_id: text, p_delta: integer) (fallback)')
  } else {
    console.log('\n발견된 문제:')
    issues.forEach((issue) => console.log(`  ${issue}`))
  }

  console.log('\n🔧 권장 조치:')
  console.log('  1. Supabase DB에 RPC 함수들이 생성되어 있는지 확인')
  console.log('  2. RLS(Row Level Security)가 익명 사용자의 쓰기를 허용하는지 확인')
  console.log('  3. .env 파일에 SUPABASE_URL과 SUPABASE_ANON_KEY가 올바르게 설정되어 있는지 확인')
  console.log('  4. printables 테이블에 views, likes, downloads 컬럼이 존재하는지 확인')

  console.log('\n진단 완료\n')
}

main().catch((error) => {
  console.error('\n❌ 스크립트 실행 에러:', error)
  process.exit(1)
})
