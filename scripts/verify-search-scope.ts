// scripts/verify-search-scope.ts
import fs from 'fs';
import path from 'path';

function inspectSearchScope() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 DOOLIA 검색 실행 시 카테고리 스코프(전체 검색 여부) 정밀 점검');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const filesToCheck = [
    { name: 'SearchModal.tsx', path: 'src/features/search/ui/SearchModal.tsx' },
    { name: 'HeroSection.tsx', path: 'src/components/home/HeroSection.tsx' },
    { name: 'Header.tsx', path: 'src/components/common/Header.tsx' },
    { name: 'Header.tsx (app)', path: 'src/components/Header.tsx' },
    { name: 'PlayHubPage.tsx', path: 'src/pages/PlayHubPage.tsx' },
    { name: 'CatalogHeader.tsx', path: 'src/components/layout/CatalogHeader.tsx' },
    { name: 'TopSearchHeader.tsx', path: 'src/components/layout/TopSearchHeader.tsx' },
    { name: 'CategoryPage.tsx', path: 'src/pages/CategoryPage.tsx' },
  ];

  for (const item of filesToCheck) {
    const fullPath = path.join(process.cwd(), item.path);
    if (!fs.existsSync(fullPath)) continue;

    const code = fs.readFileSync(fullPath, 'utf-8');
    console.log(`📄 [파일 점검]: ${item.name}`);

    // navigate 이동 경로 추출
    const navigateMatches = code.match(/navigate\s*\(\s*[`'"].*?[`'"]\s*\)/g) || [];
    if (navigateMatches.length > 0) {
      console.log('   📌 검색/이동 navigate 코드:');
      navigateMatches.forEach(m => console.log(`      👉 ${m}`));
    }

    // URL 파라미터 보존(유지) 로직 여부 체크
    if (code.includes('searchParams.set') || code.includes('setSearchParams') || code.includes('setParams')) {
      console.log('   ⚠️ [확인] setSearchParams를 사용 중입니다. 기존 URL 파라미터(theme=princess 등)를 덮어쓰지 않고 유지하고 있을 가능성이 있습니다.');
    }

    if (code.includes('theme=') && code.includes('q=')) {
      console.log('   🚨 [스코프 갇힘 의심] URL에 theme과 q가 동시에 결합되어 전달되는 로직 발견');
    }

    console.log('───────────────────────────────────────────────────────────────');
  }

  console.log('\n💡 [진단 결론 및 기대 동작]');
  console.log('1. 정상(전체 검색): 검색 제출 시 무조건 `/category/coloring-pages?q=검색어` 로 이동 (기존 theme/age 파라미터 완전 삭제)');
  console.log('2. 오류(카테고리 갇힘): `/category/coloring-pages?theme=princess&q=공룡` 처럼 이전 theme이 유지되어 0건 발생');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

inspectSearchScope();
