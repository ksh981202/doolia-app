import fs from 'fs';
import path from 'path';

// 검사할 10대 공식 언어 코드
const SUPPORTED_LANGS = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'];
const LOCALES_DIR = path.resolve(process.cwd(), 'src/i18n/locales');
const SRC_DIR = path.resolve(process.cwd(), 'src');

interface AuditResult {
  missingFiles: string[];
  keyMismatches: { lang: string; missingKeys: string[] }[];
  emptyValues: { lang: string; emptyKeys: string[] }[];
  subthemeAnalysis: {
    koSubthemesCount: number;
    translatedSubthemes: { [lang: string]: number };
  };
  hardcodedKoreanWarnings: { file: string; line: number; text: string }[];
}

function getNestedKeys(obj: any, prefix = ''): { [key: string]: string } {
  let keys: { [key: string]: string } = {};
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(keys, getNestedKeys(obj[k], prefix ? `${prefix}.${k}` : k));
    } else {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      keys[fullKey] = String(obj[k] ?? '');
    }
  }
  return keys;
}

// UI 컴포넌트 내 한글 하드코딩 검사 (.tsx, .ts)
function scanKoreanHardcoding(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'locales' && file !== 'admin' && file !== 'home') {
        scanKoreanHardcoding(fullPath, fileList);
      }
    } else if (/\.(tsx|ts)$/.test(file) && !file.endsWith('.d.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function runIntegrityAudit() {
  console.log('🌐 ========================================================');
  console.log('   DOOLIA 10개 언어 전체 다국어(i18n) 무결성 전수 검사   ');
  console.log('========================================================\n');

  const audit: AuditResult = {
    missingFiles: [],
    keyMismatches: [],
    emptyValues: [],
    subthemeAnalysis: {
      koSubthemesCount: 0,
      translatedSubthemes: {}
    },
    hardcodedKoreanWarnings: []
  };

  // 1. 번역 파일 로드 및 기준(ko 또는 en) 설정
  const localeData: { [lang: string]: { [key: string]: string } } = {};
  for (const lang of SUPPORTED_LANGS) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      audit.missingFiles.push(`${lang}.json`);
    } else {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        localeData[lang] = getNestedKeys(parsed);
      } catch (e: any) {
        console.error(`❌ [${lang}.json] JSON 파싱 오류:`, e.message);
      }
    }
  }

  if (audit.missingFiles.length > 0) {
    console.error(`🚨 누락된 언어 파일: ${audit.missingFiles.join(', ')}`);
  }

  // 2. 기본 키(Key) 일치 여부 및 빈 값 검사 (KO와 EN 합집합 기준)
  const masterKeySet = new Set<string>();
  Object.values(localeData).forEach(data => {
    Object.keys(data).forEach(k => masterKeySet.add(k));
  });

  for (const lang of SUPPORTED_LANGS) {
    if (!localeData[lang]) continue;

    const currentKeys = localeData[lang];
    const missing: string[] = [];
    const empty: string[] = [];

    masterKeySet.forEach(key => {
      if (!(key in currentKeys)) {
        missing.push(key);
      } else if (currentKeys[key].trim() === '') {
        empty.push(key);
      }
    });

    if (missing.length > 0) {
      audit.keyMismatches.push({ lang, missingKeys: missing });
    }
    if (empty.length > 0) {
      audit.emptyValues.push({ lang, emptyKeys: empty });
    }
  }

  // 3. 서브테마(subthemes) 전용 분석
  const subthemeKeyPrefix = 'subthemes.';
  const allSubthemeKeys = Array.from(masterKeySet).filter(k => k.startsWith(subthemeKeyPrefix));
  audit.subthemeAnalysis.koSubthemesCount = allSubthemeKeys.length;

  for (const lang of SUPPORTED_LANGS) {
    if (!localeData[lang]) continue;
    const count = Object.keys(localeData[lang]).filter(k => k.startsWith(subthemeKeyPrefix) && localeData[lang][k].trim() !== '').length;
    audit.subthemeAnalysis.translatedSubthemes[lang] = count;
  }

  // 4. TSX 파일 내 한글 하드코딩 텍스트 추출 (주석 제외, JSX/Text 내부)
  const sourceFiles = scanKoreanHardcoding(path.join(SRC_DIR, 'pages')).concat(
    scanKoreanHardcoding(path.join(SRC_DIR, 'components')),
    scanKoreanHardcoding(path.join(SRC_DIR, 'features'))
  );

  const koreanRegex = /[\uac00-\ud7af]/;
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // 주석 및 console.log 제외
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.includes('console.')) {
        return;
      }
      // t('...') 한글 fallback / defaultValue / label fallback 은 허용
      if (
        /\bt\s*\(/.test(trimmed) ||
        /defaultValue\s*:/.test(trimmed) ||
        /\bfallback\s*:/.test(trimmed) ||
        /titleFallback\s*:/.test(trimmed) ||
        /bodyFallback\s*:/.test(trimmed)
      ) {
        return;
      }
      if (koreanRegex.test(trimmed)) {
        // t('...') 내부에 들어간 한글 fallback은 허용하되, 직접 노출되는 JSX 텍스트 탐지
        if (
          trimmed.includes('>') || 
          trimmed.includes('placeholder=') || 
          trimmed.includes('title=') ||
          trimmed.includes('label=') ||
          trimmed.includes(': \'') ||
          trimmed.includes(': "')
        ) {
          audit.hardcodedKoreanWarnings.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            text: trimmed.slice(0, 100)
          });
        }
      }
    });
  }

  // 5. 검사 결과 출력
  console.log(`📋 [1] 전체 번역 키 총수: ${masterKeySet.size}개`);
  console.log(`🦕 [2] 서브테마(공룡/동물 등) 키 총수: ${allSubthemeKeys.length}개`);
  console.log('--------------------------------------------------------');
  console.log('🌐 언어별 서브테마 번역 등록 현황:');
  for (const lang of SUPPORTED_LANGS) {
    const translated = audit.subthemeAnalysis.translatedSubthemes[lang] || 0;
    const isFull = translated === allSubthemeKeys.length && allSubthemeKeys.length > 0;
    const status = isFull ? '✅ 완벽' : `⚠️ 누락 (${translated}/${allSubthemeKeys.length})`;
    console.log(`   - [${lang.toUpperCase()}] : ${status}`);
  }

  console.log('--------------------------------------------------------');
  console.log('🔍 [3] 언어별 누락 키(Missing Keys) 요약:');
  if (audit.keyMismatches.length === 0) {
    console.log('   🎉 모든 10개 언어 파일의 키 구조가 100% 동일합니다!');
  } else {
    audit.keyMismatches.forEach(m => {
      console.log(`   ❌ [${m.lang.toUpperCase()}] 누락 키 ${m.missingKeys.length}개:`);
      m.missingKeys.slice(0, 5).forEach(k => console.log(`      • ${k}`));
      if (m.missingKeys.length > 5) console.log(`      ... 외 ${m.missingKeys.length - 5}개`);
    });
  }

  console.log('--------------------------------------------------------');
  console.log(`⚠️ [4] 소스코드(.tsx) 내 하드코딩 한글 의심 구간 (${audit.hardcodedKoreanWarnings.length}건):`);
  if (audit.hardcodedKoreanWarnings.length === 0) {
    console.log('   ✅ UI 코드에 노출된 한글 하드코딩이 없습니다.');
  } else {
    // 중복 제거 및 대표 10건만 출력
    audit.hardcodedKoreanWarnings.forEach(w => {
      console.log(`   📍 ${w.file}:${w.line} -> ${w.text}`);
    });
  }

  console.log('\n========================================================');
  if (audit.keyMismatches.length === 0 && audit.hardcodedKoreanWarnings.length === 0) {
    console.log('🎉 [결과: PERFECT] 모든 다국어 체계가 완벽하게 일치합니다.');
  } else {
    console.log('💡 [결과: ACTION REQUIRED] 누락된 키 및 컴포넌트 하드코딩 조치가 필요합니다.');
  }
  console.log('========================================================\n');
}

runIntegrityAudit();
