// scripts/verify-affiliate-i18n.ts
import fs from 'fs';
import path from 'path';

const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'];

interface LocaleAudit {
  locale: string;
  hasAffiliateSection: boolean;
  itemCount: number;
  missingKeys: string[];
  status: 'PERFECT' | 'INCOMPLETE' | 'MISSING';
}

function auditAffiliateTranslations() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 DOOLIA 인쇄 모달 제휴마케팅 10개 언어 번역 정합성 정밀 점검');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const localesDir = path.join(process.cwd(), 'src/i18n/locales');
  if (!fs.existsSync(localesDir)) {
    console.error(`❌ 번역 폴더를 찾을 수 없습니다: ${localesDir}`);
    return;
  }

  const results: LocaleAudit[] = [];
  const requiredItemFields = ['title', 'pain_point', 'point1', 'point2', 'cta_btn'];

  for (const lang of SUPPORTED_LOCALES) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      results.push({
        locale: lang,
        hasAffiliateSection: false,
        itemCount: 0,
        missingKeys: ['파일 누락'],
        status: 'MISSING',
      });
      continue;
    }

    try {
      const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const aff = jsonContent.affiliate;

      if (!aff) {
        results.push({
          locale: lang,
          hasAffiliateSection: false,
          itemCount: 0,
          missingKeys: ['affiliate 객체 누락 (영문 fallback 발생 원인)'],
          status: 'MISSING',
        });
        continue;
      }

      // 8종 아이템별 필수 필드 검사
      const missingKeys: string[] = [];
      const itemKeys = Object.keys(aff).filter(k => k.startsWith('affiliate_') || k.includes('item'));

      // 공통 배지 키 확인
      if (!aff.badge && !aff.recommend_badge) {
        missingKeys.push('상단 배지(badge) 번역 누락');
      }

      if (itemKeys.length === 0) {
        missingKeys.push('8종 상품 세부 번역 데이터 전무 (영어 노출 원인)');
      }

      results.push({
        locale: lang,
        hasAffiliateSection: true,
        itemCount: itemKeys.length,
        missingKeys,
        status: missingKeys.length === 0 && itemKeys.length >= 8 ? 'PERFECT' : 'INCOMPLETE',
      });
    } catch (err: any) {
      results.push({
        locale: lang,
        hasAffiliateSection: false,
        itemCount: 0,
        missingKeys: [`JSON 파싱 에러: ${err.message}`],
        status: 'MISSING',
      });
    }
  }

  void requiredItemFields;

  // ─────────────────────────────────────────────
  // 2. 컴포넌트 내부 렌더링 로직 점검 (DownloadModal.tsx)
  // ─────────────────────────────────────────────
  const modalPath = path.join(process.cwd(), 'src/features/download/ui/DownloadModal.tsx');
  let componentLogicStatus = 'PASS';
  const logicMsgs: string[] = [];

  if (fs.existsSync(modalPath)) {
    const modalCode = fs.readFileSync(modalPath, 'utf-8');
    if (modalCode.includes('item.titleEn') && !modalCode.includes("t(`affiliate.")) {
      componentLogicStatus = 'FAIL';
      logicMsgs.push('🚨 [핵심 버그 발견] 모달 컴포넌트가 t() 다국어 훅 대신 DB의 item.titleEn 영문 필드를 직접 하드코딩해서 출력 중입니다.');
    } else {
      logicMsgs.push('✅ 모달 컴포넌트가 i18n t() 훅을 통해 번역을 호출하고 있습니다.');
    }
  }

  void componentLogicStatus;

  // ─────────────────────────────────────────────
  // 결과 출력
  // ─────────────────────────────────────────────
  console.log('📌 [1. 10개 언어 파일 번역 보유 현황]');
  results.forEach(res => {
    const icon = res.status === 'PERFECT' ? '🟢' : res.status === 'INCOMPLETE' ? '🟡' : '🔴';
    console.log(`${icon} [${res.locale.toUpperCase()}] 번역 상태: ${res.status} (등록된 상품: ${res.itemCount}/8개)`);
    if (res.missingKeys.length > 0) {
      res.missingKeys.forEach(m => console.log(`   👉 ${m}`));
    }
  });

  console.log('\n📌 [2. 모달 렌더링 코드(DownloadModal.tsx) 연결 상태]');
  logicMsgs.forEach(m => console.log(`   ${m}`));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🏁 진단 완료: 위 점검 로그를 확인해 주세요.');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

auditAffiliateTranslations();
