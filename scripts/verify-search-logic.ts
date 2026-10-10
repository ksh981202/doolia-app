// scripts/verify-search-logic.ts
import fs from 'fs';
import path from 'path';

function inspectSearchArchitecture() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 DOOLIA 검색 엔진 & 카테고리 결과 페이지 로직 정밀 점검');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. 검색 모달 / 검색창 컴포넌트 분석
  const searchModalPaths = [
    path.join(process.cwd(), 'src/features/search/ui/SearchModal.tsx'),
    path.join(process.cwd(), 'src/components/common/SearchModal.tsx'),
    path.join(process.cwd(), 'src/components/SearchModal.tsx'),
    path.join(process.cwd(), 'src/components/home/HeroSection.tsx'),
  ];

  let modalFile = '';
  for (const p of searchModalPaths) {
    if (fs.existsSync(p)) {
      modalFile = p;
      const code = fs.readFileSync(p, 'utf-8');
      console.log(`📄 [검색 입력 컴포넌트 발견]: ${path.basename(p)}`);
      
      // 검색 시 이동하는 URL 분석
      const navMatches = code.match(/navigate\((['"`].*?['"`])\)/g) || [];
      navMatches.forEach(m => console.log(`   👉 검색 실행 시 이동 경로: ${m}`));
    }
  }

  void modalFile;

  // 2. 카테고리 페이지의 검색어 처리 로직 분석 (CategoryPage.tsx)
  const categoryPath = path.join(process.cwd(), 'src/pages/CategoryPage.tsx');
  if (!fs.existsSync(categoryPath)) {
    console.error('❌ CategoryPage.tsx 파일을 찾을 수 없습니다.');
    return;
  }

  const categoryCode = fs.readFileSync(categoryPath, 'utf-8');
  console.log(`\n📄 [카테고리 결과 페이지 분석]: CategoryPage.tsx`);

  // (1) URL 파라미터 읽기 방식 확인 (useSearchParams vs useParams vs state)
  const hasSearchParams = categoryCode.includes('useSearchParams') || categoryCode.includes('searchParams');
  const hasLocationState = categoryCode.includes('location.state') || categoryCode.includes('useLocation');
  console.log(`   - useSearchParams (URL 쿼리스트링 파싱): ${hasSearchParams ? '✅ 사용 중' : '❌ 미사용'}`);
  console.log(`   - location.state (메모리 상태 전달): ${hasLocationState ? 'ℹ️ 사용 중' : '❌ 미사용'}`);

  // (2) 검색 필터링 대상 컬럼 분석 (제목 vs 테마 vs 태그)
  console.log('\n📌 [다국어 검색 필터링 범위 분석]');
  if (categoryCode.includes('title_ko') || categoryCode.includes('title')) {
    console.log('   ✅ 도안 제목(Title) 검색 매칭 로직 존재');
  }
  if (categoryCode.includes('theme') || categoryCode.includes('category')) {
    console.log('   ✅ 도안 테마/카테고리 매칭 로직 존재');
  }
  if (categoryCode.includes('tags') || categoryCode.includes('keywords')) {
    console.log('   ✅ 태그/키워드 매칭 로직 존재');
  }

  // (3) 상단 검색 결과 안내 UI 존재 여부
  console.log('\n📌 [현재 상단 타이틀 렌더링 상태]');
  if (categoryCode.includes('검색 결과') || categoryCode.includes('results_for') || categoryCode.includes('searchQuery')) {
    console.log('   ✅ 검색어 결과 표시 배너/안내문 코드가 이미 일부 존재함');
  } else {
    console.log('   🚨 [확인된 문제] 검색어가 들어와도 상단 타이틀이 무조건 "Coloriages/색칠도안"으로 고정되어 있음');
  }

  // (4) 검색 로그(search_keyword_logs) 백그라운드 DB 저장 여부
  const hasLogging = categoryCode.includes('logSearchKeyword') || categoryCode.includes('log_search_query');
  console.log(`\n📌 [관리자 인기/미보유 검색어 수집 연동]: ${hasLogging ? '✅ 자동 로깅 작동 중' : '⚠️ 로깅 누락'}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🏁 점검 완료: 위 분석 결과를 토대로 안전한 연결 코드를 작성합니다.');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

inspectSearchArchitecture();
