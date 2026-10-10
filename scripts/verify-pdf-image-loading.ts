#!/usr/bin/env tsx
/**
 * PDF 다운로드 시 '도안 이미지를 불러오지 못했습니다' 오류 진단 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-pdf-image-loading.ts
 *
 * 진단 항목:
 * 1. 대상 도안의 image_bw_url 및 image_color_url 확인
 * 2. R2 이미지 접근성 & CORS 검사
 * 3. PDF 변환 로직 시뮬레이션 (이미지 URL -> Base64 변환)
 * 4. 실패 시 정확한 HTTP 상태 코드 및 에러 메시지 출력
 */

import type { Printable } from '@/types/printable'

// ============================================
// 설정: 테스트할 도안 데이터
// ============================================

// '날렵한 익룡' 도안 샘플 데이터 (실제 데이터로 교체 필요)
const SAMPLE_PRINTABLES: Partial<Printable>[] = [
  {
    id: 'sample-1',
    slug: 'pterosaur-day',
    title: '날렵한 익룡',
    title_ko: '날렵한 익룡',
    title_en: 'Swift Pterosaur',
    image_bw_url: 'https://pub-7d58d5b27b5844e68f12a5d6dcdb8057.r2.dev/doolia/printables/bw/pterosaur-day.webp',
    image_color_url: 'https://pub-7d58d5b27b5844e68f12a5d6dcdb8057.r2.dev/doolia/printables/color/pterosaur-day.webp',
  },
  {
    id: 'sample-2',
    slug: 'sample-dino',
    title: '샘플 공룡',
    title_ko: '샘플 공룡',
    title_en: 'Sample Dinosaur',
    image_bw_url: 'https://pub-7d58d5b27b5844e68f12a5d6dcdb8057.r2.dev/doolia/printables/bw/sample-dino.webp',
    image_color_url: 'https://pub-7d58d5b27b5844e68f12a5d6dcdb8057.r2.dev/doolia/printables/color/sample-dino.webp',
  },
]

// ============================================
// 유틸리티 함수
// ============================================

function formatHeaders(headers: Headers): string {
  const entries: string[] = []
  headers.forEach((value, key) => {
    entries.push(`  ${key}: ${value}`)
  })
  return entries.length > 0 ? entries.join('\n') : '  (no headers)'
}

async function testImageAccess(url: string, description: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`테스트: ${description}`)
  console.log(`URL: ${url}`)
  console.log(`${'='.repeat(60)}`)

  try {
    // 1. HTTP GET 요청 (mode: cors)
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    })

    console.log(`\n✅ HTTP 상태: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}`)
    console.log(`Content-Length: ${response.headers.get('content-length')}`)
    console.log(`CORS 헤더:`)
    console.log(`  Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`)
    console.log(`  Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods')}`)

    if (!response.ok) {
      console.log(`\n❌ HTTP 에러: ${response.status} ${response.statusText}`)
      const body = await response.text().catch(() => '(no body)')
      console.log(`응답 본문: ${body.slice(0, 200)}`)
      return { success: false, error: `HTTP ${response.status}`, status: response.status }
    }

    // 2. Blob 다운로드 테스트
    const blob = await response.blob()
    console.log(`\n✅ Blob 다운로드 성공`)
    console.log(`  크기: ${blob.size} bytes`)
    console.log(`  타입: ${blob.type}`)

    // 3. 이미지 형식 확인
    if (!blob.type.startsWith('image/')) {
      console.log(`\n⚠️  경고: 이미지 MIME 타입이 아님 (${blob.type})`)
      return { success: false, error: `Invalid MIME type: ${blob.type}`, status: response.status }
    }

    // 4. Base64 변환 테스트
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${blob.type};base64,${base64}`
    console.log(`\n✅ Base64 변환 성공`)
    console.log(`  DataURL 길이: ${dataUrl.length} chars`)
    console.log(`  DataURL 접두사: ${dataUrl.slice(0, 50)}...`)

    return { success: true, size: blob.size, type: blob.type, status: response.status }

  } catch (error) {
    const err = error as Error
    console.log(`\n❌ 네트워크 에러: ${err.message}`)

    // CORS 에러인지 확인
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      console.log(`\n🔍 진단: CORS 문제 가능성 높음`)
      console.log(`   - R2 버킷 CORS 설정 확인 필요`)
      console.log(`   - Allowed Origins: * 또는 도메인 포함`)
      console.log(`   - Allowed Methods: GET`)
      console.log(`   - Allowed Headers: *`)
    }

    return { success: false, error: err.message, status: 0 }
  }
}

async function simulatePdfGeneration(printable: Partial<Printable>) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`PDF 생성 시뮬레이션: ${printable.title_ko || printable.title}`)
  console.log(`${'='.repeat(60)}`)

  const { image_bw_url, image_color_url } = printable

  if (!image_bw_url && !image_color_url) {
    console.log(`\n❌ 에러: 이미지 URL 없음`)
    return { success: false, error: 'No image URLs' }
  }

  // 흑백 이미지 테스트
  if (image_bw_url) {
    const bwResult = await testImageAccess(image_bw_url, '흑백 이미지 (BW)')
    if (!bwResult.success) {
      console.log(`\n❌ 흑백 이미지 로딩 실패 - PDF 생성 불가`)
      return { success: false, error: 'BW image load failed', details: bwResult }
    }
  }

  // 컬러 이미지 테스트
  if (image_color_url) {
    const colorResult = await testImageAccess(image_color_url, '컬러 이미지 (Color)')
    if (!colorResult.success) {
      console.log(`\n❌ 컬러 이미지 로딩 실패 - PDF 생성 불가`)
      return { success: false, error: 'Color image load failed', details: colorResult }
    }
  }

  console.log(`\n✅ PDF 생성 시뮬레이션 성공`)
  return { success: true }
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('\n🔍 PDF 이미지 로딩 문제 진단 시작\n')

  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  for (const printable of SAMPLE_PRINTABLES) {
    totalTests++
    const result = await simulatePdfGeneration(printable)

    if (result.success) {
      passedTests++
    } else {
      failedTests++
      console.log(`\n❌ 실패: ${result.error}`)
      if ('details' in result) {
        console.log(`   상세:`, result.details)
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`진단 결과 요약`)
  console.log(`${'='.repeat(60)}`)
  console.log(`총 테스트: ${totalTests}`)
  console.log(`성공: ${passedTests}`)
  console.log(`실패: ${failedTests}`)

  if (failedTests > 0) {
    console.log(`\n⚠️  문제 발견`)
    console.log(`\n권장 조치:`)
    console.log(`1. R2 버킷 CORS 설정 확인`)
    console.log(`   - Cloudflare R2 → Settings → CORS Policy`)
    console.log(`   - Allowed Origins: * 또는 https://doolia.app`)
    console.log(`   - Allowed Methods: GET, HEAD`)
    console.log(`   - Allowed Headers: *`)
    console.log(`2. 이미지 파일 확인`)
    console.log(`   - 파일이 실제로 존재하는지 확인`)
    console.log(`   - 파일이 WebP/PNG 형식인지 확인`)
    console.log(`3. 이미지 URL 접근성 확인`)
    console.log(`   - 브라우저에서 직접 URL 접근 테스트`)
    console.log(`   - 403/404 에러인 경우 권한/경로 확인`)
  } else {
    console.log(`\n✅ 모든 테스트 통과 - 문제 없음`)
  }

  console.log(`\n진단 완료\n`)
}

main().catch((error) => {
  console.error(`\n❌ 스크립트 실행 에러:`, error)
  process.exit(1)
})
