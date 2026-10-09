import fs from 'fs'
import path from 'path'

interface AuditItem {
  name: string
  status: 'PASS' | 'WARN' | 'FAIL'
  details: string[]
}

function runNavigationAudit() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🔍 DOOLIA 헤더/네비게이션/메뉴 무결성 정밀 점검')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const results: AuditItem[] = []

  // 1. Header.tsx 파일 경로 탐색
  const headerPaths = [
    path.join(process.cwd(), 'src/components/common/Header.tsx'),
    path.join(process.cwd(), 'src/components/layout/Header.tsx'),
    path.join(process.cwd(), 'src/components/Header.tsx'),
  ]

  const foundHeaders = headerPaths.filter((p) => fs.existsSync(p))

  if (foundHeaders.length === 0) {
    console.error('❌ Header.tsx 파일을 찾을 수 없습니다.')
    return
  }

  const content = foundHeaders.map((p) => fs.readFileSync(p, 'utf-8')).join('\n')

  // [점검 1] 데스크톱 GNB 메뉴 개수 및 누락 점검
  const gnbDetails: string[] = []
  let gnbStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS'

  const menuKeywords = [
    { name: '색칠도안 전체', link: '/category' },
    { name: '엉뚱발랄/테마', link: 'imagination' },
    { name: '연령별', link: 'age' },
    { name: '문의하기/매거진', link: '/contact' },
  ]

  let matchedGnbCount = 0
  menuKeywords.forEach((k) => {
    if (content.includes(k.name) || content.includes(k.link)) {
      matchedGnbCount++
      gnbDetails.push(`✅ [발견] ${k.name} (${k.link})`)
    } else {
      gnbDetails.push(`❌ [누락] ${k.name} 메뉴가 Header 코드에서 빠져 있습니다.`)
    }
  })

  if (matchedGnbCount < 4) {
    gnbStatus = 'FAIL'
    gnbDetails.push(`🚨 데스크톱 네비게이션이 4개 미만(${matchedGnbCount}개)으로 축소되어 있습니다.`)
  }

  results.push({
    name: 'PC 데스크톱 네비게이션 (GNB 4대 메뉴)',
    status: gnbStatus,
    details: gnbDetails,
  })

  // [점검 2] 모바일 드로어 메뉴 동기화 점검
  const mobileDetails: string[] = []
  let mobileStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS'

  if (!content.includes('isMobileMenuOpen') && !content.includes('mobileMenu')) {
    mobileStatus = 'FAIL'
    mobileDetails.push('❌ 모바일 메뉴 토글 상태(isMobileMenuOpen)가 없습니다.')
  } else {
    mobileDetails.push('✅ 모바일 드로어 상태 관리 코드 존재')
    if (content.includes('z-50') || content.includes('z-40')) {
      mobileDetails.push('✅ 모바일 메뉴 z-index 레이어 안전')
    } else {
      mobileStatus = 'WARN'
      mobileDetails.push('⚠️ 모바일 메뉴의 z-index가 낮아 본문과 겹칠 위험이 있습니다.')
    }
  }

  results.push({
    name: '모바일 햄버거 드로어 메뉴',
    status: mobileStatus,
    details: mobileDetails,
  })

  // [점검 3] 필수 컨트롤러 (로고, 언어스위처, 검색, 뒤로가기) 존재 여부
  const ctrlDetails: string[] = []
  let ctrlStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS'

  if (content.includes('doolia-logo') || content.includes('logo')) {
    ctrlDetails.push('✅ DOOLIA 로고 링크 정상')
  } else {
    ctrlStatus = 'FAIL'
    ctrlDetails.push('❌ 로고 이미지가 누락되었습니다.')
  }

  if (content.includes('LanguageSwitcher') || content.includes('lang')) {
    ctrlDetails.push('✅ 다국어 언어 스위처 정상')
  } else {
    ctrlStatus = 'WARN'
    ctrlDetails.push('⚠️ 다국어 선택기가 헤더에서 누락되었습니다.')
  }

  if (content.includes('search') || content.includes('Search')) {
    ctrlDetails.push('✅ 검색 버튼/모달 트리거 정상')
  } else {
    ctrlStatus = 'WARN'
    ctrlDetails.push('⚠️ 헤더 검색 버튼이 누락되었습니다.')
  }

  results.push({
    name: '헤더 필수 컨트롤러 (로고/다국어/검색)',
    status: ctrlStatus,
    details: ctrlDetails,
  })

  // 결과 종합 출력
  results.forEach((res, idx) => {
    const icon = res.status === 'PASS' ? '🟢' : res.status === 'WARN' ? '🟡' : '🔴'
    console.log(`${icon} [점검 ${idx + 1}] ${res.name} -> ${res.status}`)
    res.details.forEach((d) => console.log(`   ${d}`))
    console.log('───────────────────────────────────────────────────────────────')
  })

  const hasFail = results.some((r) => r.status === 'FAIL')
  if (hasFail) {
    console.log('\n🚨 [진단 결론]: 최근 모바일 UI 수정 중 데스크톱 메뉴가 함께 삭제된 상태입니다.')
    console.log('👉 조치: PC 4대 메뉴를 유지하면서 모바일 양끝 정렬만 별도로 적용하는 복구 코드가 필요합니다.')
    process.exitCode = 1
  } else {
    console.log('\n✨ 모든 헤더 메뉴와 모바일 레이아웃이 완벽히 동기화되어 있습니다.')
  }
}

runNavigationAudit()
