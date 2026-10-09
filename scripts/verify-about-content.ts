/**
 * Inspect About page source text and i18n coverage.
 * Usage: npx tsx scripts/verify-about-content.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function stripTags(value: string) {
  return value
    .replace(/\{isKo\s*\?[\s\S]*?:\s*[\s\S]*?\}/g, (block) => {
      const ko = block.match(/\?\s*(?:<>\s*)?([\s\S]*?)\s*:/)?.[1] ?? ''
      const en = block.match(/:\s*(?:<>\s*)?([\s\S]*?)\s*\}/)?.[1] ?? ''
      return `[KO] ${stripJsxText(ko)} | [EN] ${stripJsxText(en)}`
    })
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripJsxText(value: string) {
  return value
    .replace(/<>|<\/>/g, ' ')
    .replace(/<br[^>]*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function inspectAboutPageContent() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🔍 DOOLIA 소개(About) 페이지 원본 텍스트 & 섹션 구조 정밀 점검')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const possiblePaths = [
    resolve(process.cwd(), 'src/pages/AboutPage.tsx'),
    resolve(process.cwd(), 'src/pages/about/AboutPage.tsx'),
    resolve(process.cwd(), 'src/components/AboutPage.tsx'),
  ]
  const targetFile = possiblePaths.find((file) => existsSync(file))
  if (!targetFile) {
    console.error('❌ AboutPage.tsx 파일을 찾을 수 없습니다.')
    process.exitCode = 1
    return
  }

  console.log(`📄 대상 파일 확인: ${targetFile}\n`)
  const content = readFileSync(targetFile, 'utf8')

  const headings = content.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || []
  const paragraphs = content.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []
  const spans = content.match(/<span[^>]*>[\s\S]*?<\/span>/gi) || []
  const kickerDivs =
    content.match(/<div className="mb-2 text-xs font-bold uppercase[\s\S]*?<\/div>/gi) || []

  console.log('📌 [1. 주요 헤드라인 & 제목 (Headings)]')
  headings.forEach((h, i) => {
    const clean = stripTags(h)
    if (clean) console.log(`   ${i + 1}) ${clean}`)
  })

  console.log('\n📌 [2. 본문 설명 문단 (Paragraphs)]')
  paragraphs.forEach((p, i) => {
    const clean = stripTags(p)
    if (clean) console.log(`   ${i + 1}) ${clean}`)
  })

  console.log('\n📌 [3. 태그 / 배지 / 캡션 (Spans & Kickers)]')
  const badges = [
    ...spans.map((s) => stripTags(s)),
    ...kickerDivs.map((s) => stripTags(s)),
  ].filter((s) => s && !/^\d+$/.test(s))
  Array.from(new Set(badges))
    .slice(0, 12)
    .forEach((s, i) => console.log(`   ${i + 1}) ${s}`))

  const koBranches = [...content.matchAll(/\?[\s\n]*['`]([^'`]+)['`]/g)].map((m) => m[1])
  const isKoCount = (content.match(/\bisKo\b/g) || []).length
  const tCalls = [...content.matchAll(/\bt\(/g)].length
  const usesHook = content.includes('useTranslation')
  const usesT = content.includes("t('") || content.includes('t(`') || /\bt\([a-zA-Z]/.test(content)

  console.log('\n───────────────────────────────────────────────────────────────')
  console.log('📊 [i18n 다국어 적용 현황 분석]')
  console.log('───────────────────────────────────────────────────────────────')
  if (usesHook && usesT) {
    console.log('✅ useTranslation + t() 키가 사용됩니다.')
  } else if (usesHook) {
    console.log('⚠️ useTranslation 훅은 있으나 t() 키는 없습니다. isKo 분기 하드코딩입니다.')
    console.log(`   isKo 참조 ${isKoCount}회 · 한글 리터럴 분기 ${koBranches.length}개`)
    console.log('   10개 로케일 중 KO/EN만 표시되고 JA/ZH/ES/PT/DE/FR/IT/VI는 영문으로 떨어집니다.')
  } else {
    console.log('🚨 useTranslation 훅이 없으며 모든 텍스트가 하드코딩되어 있습니다.')
  }

  const hardcodedEn = [
    'The Art of',
    'Pure Imagination',
    'Freedom beyond Lines',
    'Dialogue in Colors',
    'Crafted for Little Hands',
    'Contact DOOLIA',
    'CREATIVE PLAY & ART',
    'EMOTIONAL CONNECTION',
    'THOUGHTFUL DESIGN',
  ]
  const missing = hardcodedEn.filter((phrase) => content.includes(phrase))
  console.log(`\n📌 [4. 언어 무관 영문 고정 카피] ${missing.length}개`)
  missing.forEach((phrase, i) => console.log(`   ${i + 1}) ${phrase}`))
  console.log('═══════════════════════════════════════════════════════════════\n')
}

inspectAboutPageContent()
