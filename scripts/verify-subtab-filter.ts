/**
 * Read-only subtab filter audit. Does not mutate app source or DB.
 * Usage: npx tsx scripts/verify-subtab-filter.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import {
  CATEGORY_THEMES,
  THEME_SUB_CATEGORIES,
  getCategoryThemes,
  getThemeSubCategories,
  matchesSubtabQuery,
  subtabHaystack,
  type SubtabSearchable,
} from '../src/shared/config/categories.ts'

type CatalogItem = SubtabSearchable & {
  slug: string
  title: string
  title_ko: string
  category: string
  hay: string
}

type Finding = {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  area: string
  title: string
  detail: string
}

const KIDS_THEME_IDS = [
  'animals',
  'dinosaur',
  'vehicles',
  'princess',
  'imagination',
  'space-robot',
  'food',
  'sea-nature',
  'daily',
  'jobs',
  'sports',
  'seasons',
] as const

const PARENT_UMBRELLA = new Set([
  '동물',
  '공주',
  '판타지',
  '요정',
  '공룡',
  '우주',
  '로봇',
  '로켓',
  '바다',
  '곤충',
  '과일',
  '디저트',
  '직업',
  '일상',
  '집',
  '봄',
  '여름',
  '가을',
  '겨울',
  '시즌',
  '기념일',
  '상상',
  '환상',
  '탈것',
  '자동차',
  'princess',
  'robot',
  'cat',
])

const findings: Finding[] = []
const falsePositives: Array<{
  theme: string
  sub: string
  subName: string
  slug: string
  title: string
  reason: string
  tokens: string[]
}> = []

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    try {
      for (const raw of readFileSync(resolve(process.cwd(), name), 'utf8').split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const cut = line.indexOf('=')
        if (cut < 1) continue
        const key = line.slice(0, cut).trim()
        let value = line.slice(cut + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        if (!(key in process.env)) process.env[key] = value
      }
    } catch {
      /* optional */
    }
  }
}

function tokensOf(query: string) {
  return query
    .split('|')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function parentHaystack(row: Record<string, unknown>) {
  const tags = Array.isArray(row.tags) ? row.tags.map((item) => String(item ?? '')) : []
  return [
    row.title,
    row.title_ko,
    row.title_en,
    row.title_ja,
    row.title_zh,
    row.title_es,
    row.title_pt,
    row.title_de,
    row.title_fr,
    row.title_it,
    row.title_vi,
    row.slug,
    row.category,
    row.theme_ko,
    row.theme_en,
    row.age_group,
    row.age_group_en,
    ...tags,
  ]
    .map((item) => str(item))
    .join(' ')
    .toLowerCase()
}

function toItem(row: Record<string, unknown>): CatalogItem {
  const titleKo = str(row.title_ko) || str(row.title)
  const tags = Array.isArray(row.tags) ? row.tags.map((item) => String(item ?? '')) : []
  return {
    slug: str(row.slug) || str(row.id),
    title: titleKo,
    title_ko: titleKo,
    title_en: str(row.title_en),
    title_ja: str(row.title_ja),
    title_zh: str(row.title_zh),
    title_es: str(row.title_es),
    title_pt: str(row.title_pt),
    title_de: str(row.title_de),
    title_fr: str(row.title_fr),
    title_it: str(row.title_it),
    title_vi: str(row.title_vi),
    tags,
    theme_ko: str(row.theme_ko),
    theme_en: str(row.theme_en),
    category: str(row.category),
    hay: parentHaystack(row),
  }
}

function matchesParentQuery(item: CatalogItem, query: string) {
  const raw = query.replace(/^#/, '').trim()
  if (!raw) return true
  return tokensOf(raw).some((needle) => item.hay.includes(needle))
}

function matchesAgeFilter(_item: CatalogItem, ageId: string) {
  return !ageId || ageId === 'all'
}

function hitTokens(item: CatalogItem, query: string) {
  return tokensOf(query).filter((token) => token.length >= 2 && matchesSubtabQuery(item, token))
}

function add(finding: Finding) {
  findings.push(finding)
}

function categoryPageFilter(
  items: CatalogItem[],
  themeId: string,
  subId: string,
  ageId = 'all',
  searchQuery = '',
) {
  const themeOptions = getCategoryThemes('coloring-pages')
  const subOptions = getThemeSubCategories(themeId)
  return items
    .filter((item) => item.category === 'coloring-pages' || item.category === 'coloring')
    .filter((item) => matchesParentQuery(item, searchQuery))
    .filter((item) => matchesAgeFilter(item, ageId))
    .filter((item) => {
      const option = themeOptions?.find((entry) => entry.id === themeId)
      if (!option || option.id === 'all') return true
      if (!matchesParentQuery(item, option.query ?? '')) return false
      if (!subOptions || subId === 'all') return true
      const subOption = subOptions.find((entry) => entry.id === subId)
      if (!subOption || subOption.id === 'all') return true
      return matchesSubtabQuery(item, subOption.query ?? '')
    })
}

async function fetchCatalog() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 필요')
  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('printables').select('*').eq('published', true).range(0, 999)
  if (error) throw error
  return (data ?? []).map((row) => toItem(row as Record<string, unknown>))
}

function scanDictionary() {
  const kidsThemes = CATEGORY_THEMES['coloring-pages'] ?? []
  const missing = KIDS_THEME_IDS.filter((id) => !kidsThemes.some((item) => item.id === id))
  if (missing.length) {
    add({
      severity: 'HIGH',
      area: 'dict',
      title: '12대 테마 중 CATEGORY_THEMES 누락',
      detail: missing.join(', '),
    })
  }

  let subCount = 0
  let emptyQuery = 0
  const parentReuse: string[] = []
  const shortTokens: string[] = []

  for (const themeId of KIDS_THEME_IDS) {
    const parent = kidsThemes.find((item) => item.id === themeId)
    const parentTokens = new Set(tokensOf(parent?.query ?? ''))
    const subs = THEME_SUB_CATEGORIES[themeId] ?? []
    if (!subs.length) {
      add({
        severity: 'HIGH',
        area: 'dict',
        title: `${themeId} 서브탭 정의 없음`,
        detail: 'THEME_SUB_CATEGORIES에 해당 테마 키가 없습니다.',
      })
      continue
    }
    for (const sub of subs) {
      if (sub.id === 'all') continue
      subCount += 1
      const query = sub.query ?? ''
      if (!query.trim()) {
        emptyQuery += 1
        add({
          severity: 'CRITICAL',
          area: 'dict',
          title: `${themeId}/${sub.id} query 비어 있음`,
          detail: 'matchesSubtabQuery는 빈 문자열이면 항상 true → 서브탭이 무효.',
        })
        continue
      }
      const umbrella = tokensOf(query).filter(
        (token) => parentTokens.has(token) && PARENT_UMBRELLA.has(token),
      )
      if (umbrella.length) {
        parentReuse.push(`${themeId}/${sub.id}: ${umbrella.join('|')}`)
      }
      for (const token of tokensOf(query)) {
        if (token.length <= 1) shortTokens.push(`${themeId}/${sub.id} "${token}"`)
      }
    }
  }

  add({
    severity: 'INFO',
    area: 'dict',
    title: `키즈 12테마 서브탭 ${subCount}개 정의됨`,
    detail: `emptyQuery=${emptyQuery}, parentTokenReuse=${parentReuse.length}, 1글자 토큰=${shortTokens.length}`,
  })

  if (parentReuse.length) {
    add({
      severity: 'CRITICAL',
      area: 'dict',
      title: '서브탭 query가 부모 테마 토큰을 재사용',
      detail: parentReuse.join(' · '),
    })
  }
  if (shortTokens.length) {
    add({
      severity: 'HIGH',
      area: 'dict',
      title: '1글자 토큰은 부분문자열 오탐을 유발',
      detail: shortTokens.join(' · '),
    })
  }

  const src = readFileSync(resolve('src/pages/CategoryPage.tsx'), 'utf8')
  const wiresSub =
    src.includes("params.get('sub')") &&
    src.includes('resolveThemeSubId') &&
    src.includes('subOption.query') &&
    src.includes('matchesSubtabQuery(item, subOption.query')
  add({
    severity: wiresSub ? 'INFO' : 'CRITICAL',
    area: 'logic',
    title: wiresSub
      ? 'CategoryPage는 ?sub= 를 matchesSubtabQuery로 전달함'
      : 'CategoryPage가 sub 파라미터를 필터에 연결하지 않음',
    detail:
      '부모 테마는 matchesQuery, 서브탭은 제목+태그 haystack + 영문 단어경계 매칭.',
  })

  const andAge = src.includes('matchesAgeFilter(item, age)') && src.includes('subOption.query')
  add({
    severity: andAge ? 'INFO' : 'HIGH',
    area: 'logic',
    title: andAge ? '연령 필터와 서브탭은 AND로 결합됨' : '연령/서브탭 AND 결합 불명',
    detail: 'isSenior(힐링)일 때만 연령 필터를 건너뛴다.',
  })

  const catSrc = readFileSync(resolve('src/shared/config/categories.ts'), 'utf8')
  const haystackTitlesOnly =
    catSrc.includes('export function subtabHaystack') &&
    catSrc.includes('item.title_ko') &&
    !/subtabHaystack[\s\S]{0,800}item\.(category|theme_en|slug)/.test(catSrc)
  add({
    severity: haystackTitlesOnly ? 'INFO' : 'CRITICAL',
    area: 'logic',
    title: haystackTitlesOnly
      ? '서브탭 haystack은 로케일 제목+태그만 사용'
      : '서브탭 haystack에 시스템 ID가 남아 있음',
    detail: 'category / theme_en / slug는 서브탭 매칭에서 제외되어야 한다.',
  })

  add({
    severity: 'INFO',
    area: 'logic',
    title: '서브탭은 matchesSubtabQuery (2글자+, 영문 단어경계)',
    detail:
      '부모 테마/검색 q는 기존 matchesQuery를 유지한다. 서브탭만 부분문자열 오탐을 막는다.',
  })
}

function scanCatalog(items: CatalogItem[]) {
  const coloring = items.filter((item) => item.category === 'coloring-pages' || item.category === 'coloring')
  add({
    severity: 'INFO',
    area: 'data',
    title: `발행 coloring-pages ${coloring.length}건 시뮬레이션`,
    detail: `전체 published ${items.length}건 중 색칠 카테고리만 대상.`,
  })

  const noopSubs: string[] = []
  const leakySubs: string[] = []

  for (const themeId of KIDS_THEME_IDS) {
    const parentItems = categoryPageFilter(coloring, themeId, 'all')
    const subs = (THEME_SUB_CATEGORIES[themeId] ?? []).filter((item) => item.id !== 'all')
    const parent = (CATEGORY_THEMES['coloring-pages'] ?? []).find((item) => item.id === themeId)
    const parentTokens = new Set(tokensOf(parent?.query ?? ''))

    for (const sub of subs) {
      const matched = categoryPageFilter(coloring, themeId, sub.id)
      const ratio = parentItems.length ? matched.length / parentItems.length : 0
      if (parentItems.length >= 3 && ratio >= 0.85) {
        noopSubs.push(`${themeId}/${sub.id} ${matched.length}/${parentItems.length} (${Math.round(ratio * 100)}%)`)
      }

      for (const item of matched) {
        const hits = hitTokens(item, sub.query ?? '')
        const onlyParent =
          hits.length > 0 && hits.every((token) => parentTokens.has(token) && PARENT_UMBRELLA.has(token))
        const siblingHits = subs
          .filter((other) => other.id !== sub.id)
          .map((other) => ({
            id: other.id,
            name: other.name,
            hits: hitTokens(item, other.query ?? '').filter(
              (token) => !parentTokens.has(token) || !PARENT_UMBRELLA.has(token),
            ),
          }))
          .filter((entry) => entry.hits.length)

        const specificHits = hits.filter((token) => !parentTokens.has(token) || !PARENT_UMBRELLA.has(token))
        const leaked =
          onlyParent || (specificHits.length === 0 && siblingHits.length > 0)

        if (leaked) {
          const reason = onlyParent
            ? `부모 토큰만 히트 (${hits.join('|')})`
            : `형제 서브탭 토큰이 더 강함: ${siblingHits.map((entry) => `${entry.name}[${entry.hits.join('|')}]`).join(', ')} / 현재[${hits.join('|')}]`
          leakySubs.push(`${themeId}/${sub.id}`)
          falsePositives.push({
            theme: themeId,
            sub: sub.id,
            subName: sub.name,
            slug: item.slug,
            title: item.title_ko || item.title,
            reason,
            tokens: hits,
          })
        }
      }
    }
  }

  const uniqueLeaky = [...new Set(leakySubs)]
  if (noopSubs.length) {
    add({
      severity: 'CRITICAL',
      area: 'sim',
      title: '서브탭이 부모 테마와 거의 같은 결과를 냄 (무효 필터)',
      detail: noopSubs.join(' · '),
    })
  }
  add({
    severity: uniqueLeaky.length ? 'CRITICAL' : 'INFO',
    area: 'sim',
    title: uniqueLeaky.length
      ? `오탐 서브탭 ${uniqueLeaky.length}개, 오탐 도안 행 ${falsePositives.length}건`
      : '형제 서브탭 오탐 없음',
    detail: uniqueLeaky.slice(0, 40).join(', ') || '없음',
  })
}

function printReport(items: CatalogItem[]) {
  const order: Finding['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
  console.log('DOOLIA subtab filter audit (read-only)')
  console.log(
    `catalog: ${items.length} published, coloring=${items.filter((item) => item.category === 'coloring-pages').length}`,
  )
  console.log('')
  for (const sev of order) {
    const group = findings.filter((item) => item.severity === sev)
    if (!group.length) continue
    console.log(`=== ${sev} (${group.length}) ===`)
    for (const item of group) {
      console.log(`[${item.area}] ${item.title}`)
      console.log(`    ${item.detail}`)
      console.log('')
    }
  }

  const bySub = new Map<string, typeof falsePositives>()
  for (const row of falsePositives) {
    const key = `${row.theme}/${row.sub} ${row.subName}`
    bySub.set(key, [...(bySub.get(key) ?? []), row])
  }
  if (bySub.size) {
    console.log('=== FALSE POSITIVE SAMPLES ===')
    for (const [key, rows] of [...bySub.entries()].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`${key}  (${rows.length}건)`)
      for (const row of rows.slice(0, 8)) {
        console.log(`  - ${row.slug} | ${row.title} | ${row.reason}`)
      }
      if (rows.length > 8) console.log(`  … +${rows.length - 8} more`)
      console.log('')
    }
  }

  const princessAll = categoryPageFilter(items, 'princess', 'all')
  const dress = categoryPageFilter(items, 'princess', 'dress-princess')
  const knight = categoryPageFilter(items, 'princess', 'prince-knight')
  const wand = categoryPageFilter(items, 'princess', 'magic-wand-jewel')
  const kitten = categoryPageFilter(items, 'animals', 'kitten')
  const puppy = categoryPageFilter(items, 'animals', 'puppy')
  const fireTruck = categoryPageFilter(items, 'vehicles', 'fire-truck')
  const firefighter = categoryPageFilter(items, 'jobs', 'firefighter')
  const transform = categoryPageFilter(items, 'space-robot', 'transform-robot')
  console.log('=== PRINCESS SMOKE ===')
  console.log(`parent=${princessAll.length} dress-princess=${dress.length} prince-knight=${knight.length} magic-wand=${wand.length}`)
  console.log(
    `dress titles: ${dress
      .map((item) => item.title_ko || item.title)
      .slice(0, 12)
      .join(' / ')}`,
  )
  console.log(
    `knight titles: ${knight
      .map((item) => item.title_ko || item.title)
      .slice(0, 12)
      .join(' / ')}`,
  )
  console.log('=== ANIMALS / JOBS / ROBOT SMOKE ===')
  console.log(`kitten=${kitten.length} [${kitten.map((item) => item.slug).join(', ')}]`)
  console.log(`puppy=${puppy.length} [${puppy.map((item) => item.slug).join(', ')}]`)
  console.log(`fire-truck=${fireTruck.length} [${fireTruck.map((item) => item.slug).join(', ')}]`)
  console.log(`firefighter=${firefighter.length} [${firefighter.map((item) => item.slug).join(', ')}]`)
  console.log(`transform-robot=${transform.length} [${transform.map((item) => item.slug).join(', ')}]`)
  console.log(`sample haystack: ${subtabHaystack(dress[0] ?? kitten[0] ?? items[0]).slice(0, 160)}`)
}

loadEnv()
const catalog = await fetchCatalog()
scanDictionary()
scanCatalog(catalog)
printReport(catalog)

const critical = findings.filter((item) => item.severity === 'CRITICAL').length
process.exitCode = critical ? 1 : 0
