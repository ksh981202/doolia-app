#!/usr/bin/env tsx
/**
 * i18n 번역 무결성 전수 검증 스크립트
 *
 * 사용법:
 *   npx tsx scripts/verify-all-i18n-integrity.ts
 *
 * 검사 항목:
 * 1. 10개 언어 JSON 파일 간 누락된 키(Missing Keys) 및 빈 값(Empty Values) 전수 대조
 * 2. 서브테마(subthemes.*), 연령별 탭, 메뉴 등 핵심 번역 키의 언어별 등록 현황 비교
 * 3. src/pages, src/components, src/features 내 TSX 파일에서 t() 함수 없이 화면에 직접 노출되는 하드코딩 한글 텍스트 탐지
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales')
const SOURCE_DIRS = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/components'),
  path.join(__dirname, '../src/features'),
]

type TranslationData = Record<string, unknown>
type MissingKeyInfo = { lang: string; key: string; path: string }

// ============================================
// 유틸리티 함수
// ============================================

function loadJsonFile(filePath: string): TranslationData {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error)
    return {}
  }
}

function getAllKeys(obj: TranslationData, prefix = ''): string[] {
  const keys: string[] = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (obj[key] !== null && typeof obj[key] === 'object') {
      keys.push(...getAllKeys(obj[key] as TranslationData, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function isEmptyValue(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

// ============================================
// JSON 파일 로드 및 키 추출
// ============================================

function loadAllTranslations(): Record<string, TranslationData> {
  const translations: Record<string, TranslationData> = {}
  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`)
    translations[lang] = loadJsonFile(filePath)
  }
  return translations
}

// ============================================
// 누락된 키 및 빈 값 검사
// ============================================

function checkMissingKeysAndEmptyValues(translations: Record<string, TranslationData>) {
  console.log('\n========================================')
  console.log('1. 언어별 누락된 키 및 빈 값 검사')
  console.log('========================================\n')

  const allKeysByLang: Record<string, string[]> = {}
  for (const lang of LANGUAGES) {
    allKeysByLang[lang] = getAllKeys(translations[lang])
  }

  // 모든 언어의 키 합집합 (기준: ko)
  const referenceKeys = allKeysByLang['ko']
  const uniqueReferenceKeys = [...new Set(referenceKeys)]

  const missingKeysByLang: Record<string, string[]> = {}
  const emptyValuesByLang: Record<string, string[]> = {}

  for (const lang of LANGUAGES) {
    if (lang === 'ko') continue

    const langKeys = allKeysByLang[lang]
    const missing = uniqueReferenceKeys.filter((key) => !langKeys.includes(key))
    const emptyValues: string[] = []

    // 빈 값 검사
    const getValueAtPath = (obj: TranslationData, keyPath: string): unknown => {
      const parts = keyPath.split('.')
      let current: unknown = obj
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part]
        } else {
          return undefined
        }
      }
      return current
    }

    for (const key of langKeys) {
      const value = getValueAtPath(translations[lang], key)
      if (isEmptyValue(value)) {
        emptyValues.push(key)
      }
    }

    missingKeysByLang[lang] = missing
    emptyValuesByLang[lang] = emptyValues
  }

  // 결과 출력
  let totalMissing = 0
  let totalEmpty = 0

  for (const lang of LANGUAGES) {
    if (lang === 'ko') continue

    const missing = missingKeysByLang[lang]
    const empty = emptyValuesByLang[lang]

    if (missing.length > 0 || empty.length > 0) {
      console.log(`[${lang.toUpperCase()}]`)
      if (missing.length > 0) {
        console.log(`  ❌ 누락된 키: ${missing.length}개`)
        if (missing.length <= 10) {
          missing.forEach((key) => console.log(`     - ${key}`))
        } else {
          missing.slice(0, 10).forEach((key) => console.log(`     - ${key}`))
          console.log(`     ... 외 ${missing.length - 10}개`)
        }
        totalMissing += missing.length
      }
      if (empty.length > 0) {
        console.log(`  ⚠️  빈 값: ${empty.length}개`)
        if (empty.length <= 10) {
          empty.forEach((key) => console.log(`     - ${key}`))
        } else {
          empty.slice(0, 10).forEach((key) => console.log(`     - ${key}`))
          console.log(`     ... 외 ${empty.length - 10}개`)
        }
        totalEmpty += empty.length
      }
      console.log()
    } else {
      console.log(`[${lang.toUpperCase()}] ✅ 모든 키 존재, 빈 값 없음\n`)
    }
  }

  console.log('========================================')
  console.log(`누락된 키 총계: ${totalMissing}개`)
  console.log(`빈 값 총계: ${totalEmpty}개`)
  console.log('========================================\n')

  return { missingKeysByLang, emptyValuesByLang }
}

// ============================================
// 핵심 번역 키 등록 현황 비교
// ============================================

function checkCoreKeys(translations: Record<string, TranslationData>) {
  console.log('========================================')
  console.log('2. 핵심 번역 키 등록 현황 비교')
  console.log('========================================\n')

  const coreKeyPatterns = [
    'subthemes.*',
    'category.age_*',
    'category.theme',
    'category.subtheme',
    'category.sort*',
    'nav.*',
    'categories.*',
  ]

  const getValueAtPath = (obj: TranslationData, keyPath: string): unknown => {
    const parts = keyPath.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }
    return current
  }

  const checkPattern = (pattern: string) => {
    const [prefix, wildcard] = pattern.split('*')
    const matchingKeys = getAllKeys(translations['ko']).filter((key) =>
      key.startsWith(prefix) && (wildcard === '' || key !== prefix)
    )

    if (matchingKeys.length === 0) return

    console.log(`\n패턴: ${pattern} (${matchingKeys.length}개 키)`)

    for (const lang of LANGUAGES) {
      const missing: string[] = []
      const empty: string[] = []

      for (const key of matchingKeys) {
        const value = getValueAtPath(translations[lang], key)
        if (value === undefined) {
          missing.push(key)
        } else if (isEmptyValue(value)) {
          empty.push(key)
        }
      }

      const status = missing.length === 0 && empty.length === 0 ? '✅' : '❌'
      const info = []
      if (missing.length > 0) info.push(`${missing.length} 누락`)
      if (empty.length > 0) info.push(`${empty.length} 빈값`)
      const infoStr = info.length > 0 ? `(${info.join(', ')})` : ''

      console.log(`  ${status} ${lang.toUpperCase()}: ${matchingKeys.length - missing.length - empty.length}/${matchingKeys.length} ${infoStr}`)
    }
  }

  for (const pattern of coreKeyPatterns) {
    checkPattern(pattern)
  }

  console.log('\n')
}

// ============================================
// 하드코딩된 한글 텍스트 탐지
// ============================================

function findTsxFiles(dir: string): string[] {
  const files: string[] = []

  function traverse(currentDir: string) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        traverse(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        files.push(fullPath)
      }
    }
  }

  traverse(dir)
  return files
}

function checkHardcodedKoreanText() {
  console.log('========================================')
  console.log('3. 하드코딩된 한글 텍스트 탐지')
  console.log('========================================\n')

  const allFiles: string[] = []
  for (const dir of SOURCE_DIRS) {
    allFiles.push(...findTsxFiles(dir))
  }

  const findings: { file: string; line: number; text: string }[] = []

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // t() 함수가 있는 라인은 건너뜀
      if (line.includes('t(') || line.includes('useTranslation')) {
        continue
      }

      // 주석 건너뜀
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue
      }

      // import 문 건너뜀
      if (line.trim().startsWith('import')) {
        continue
      }

      // 한글 텍스트 패턴 (따옴표로 감싸진 한글)
      const koreanPattern = /['"`]([가-힣\s\w\(\)\[\]\{\}?,.!\/@#\$%\^&\*\-\+=\\|<>:;]+)['"`]/g
      let match
      while ((match = koreanPattern.exec(line)) !== null) {
        const text = match[1].trim()

        // 너무 짧은 것 건너뜀 (1글자)
        if (text.length < 2) continue

        // 특정 패턴 건너뜀 (URL, 변수명 등)
        if (text.includes('http') || text.includes('://') || text.startsWith('$')) continue

        findings.push({ file: filePath, line: lineNum, text })
      }
    }
  }

  if (findings.length === 0) {
    console.log('✅ 하드코딩된 한글 텍스트 없음\n')
  } else {
    console.log(`⚠️  ${findings.length}개의 하드코딩된 한글 텍스트 발견\n`)

    // 파일별로 그룹화
    const byFile: Record<string, typeof findings> = {}
    for (const finding of findings) {
      const relativePath = path.relative(__dirname, finding.file)
      if (!byFile[relativePath]) byFile[relativePath] = []
      byFile[relativePath].push(finding)
    }

    for (const [file, fileFindings] of Object.entries(byFile)) {
      console.log(`📄 ${file}`)
      const displayFindings = fileFindings.slice(0, 5)
      displayFindings.forEach((f) => {
        console.log(`   Line ${f.line}: "${f.text}"`)
      })
      if (fileFindings.length > 5) {
        console.log(`   ... 외 ${fileFindings.length - 5}개`)
      }
      console.log()
    }
  }

  console.log('========================================\n')
}

// ============================================
// 메인 실행
// ============================================

function main() {
  console.log('\n🔍 i18n 번역 무결성 전수 검증 시작\n')

  // 1. 번역 파일 로드
  const translations = loadAllTranslations()

  // 2. 누락된 키 및 빈 값 검사
  checkMissingKeysAndEmptyValues(translations)

  // 3. 핵심 번역 키 등록 현황 비교
  checkCoreKeys(translations)

  // 4. 하드코딩된 한글 텍스트 탐지
  checkHardcodedKoreanText()

  console.log('✅ 검증 완료\n')
}

main()
