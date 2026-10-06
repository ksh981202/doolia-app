/**
 * Read-only catalog search-engine audit. Does not mutate app source or DB.
 * Usage: npx tsx scripts/verify-search-engine.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { CATEGORY_THEMES } from '../src/shared/config/categories.ts'

type Finding = {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  area: string
  title: string
  detail: string
}

type Row = Record<string, unknown> & { slug: string }

const TITLE_KEYS = [
  'title',
  'title_ko',
  'title_en',
  'title_ja',
  'title_zh',
  'title_es',
  'title_pt',
  'title_de',
  'title_fr',
  'title_it',
  'title_vi',
] as const

const DESC_KEYS = [
  'description_ko',
  'description_en',
  'description_ja',
  'description_zh',
  'description_es',
  'description_pt',
  'description_de',
  'description_fr',
  'description_it',
  'description_vi',
] as const

const findings: Finding[] = []
const samples: Array<{ query: string; hit: number; missTitles: string[]; extra: string[] }> = []

function add(finding: Finding) {
  findings.push(finding)
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function tagsOf(row: Row) {
  return Array.isArray(row.tags) ? row.tags.map((item) => String(item ?? '')) : []
}

function joinFields(row: Row, keys: readonly string[]) {
  return keys
    .map((key) => str(row[key]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Clone of src/types/printable.ts printableSearchText */
function liveHaystack(row: Row) {
  return [
    ...TITLE_KEYS.map((key) => str(row[key])),
    str(row.slug),
    str(row.category),
    str(row.theme_ko),
    str(row.theme_en),
    str(row.age_group),
    str(row.age_group_en),
    ...tagsOf(row),
  ]
    .join(' ')
    .toLowerCase()
}

function titleHaystack(row: Row) {
  return joinFields(row, TITLE_KEYS)
}

function descriptionHaystack(row: Row) {
  return joinFields(row, DESC_KEYS)
}

/** Clone of src/services/printableService.ts matchesQuery */
function matchesQuery(row: Row, query: string, hay = liveHaystack(row)) {
  const raw = query.replace(/^#/, '').trim()
  if (!raw) return true
  return raw
    .split('|')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((needle) => hay.includes(needle))
}

const RANGE_RE = /(\d+)\s*[-~–—]\s*(\d+)\s*세/
const AGE_PAIR_RE = /(?:ages?\s*)?(\d+)\s*[-~–—]\s*(\d+)/i

function parseAgeString(raw: string | undefined): { min: number; max: number } | null {
  const source = raw?.trim()
  if (!source) return null
  const normalized = source
    .toLowerCase()
    .replace(/^만\s*/, '')
    .replace(/\s*세\+?$/, '')
    .replace(/\s+/g, ' ')
    .trim()
  const compact = normalized.replace(/\s+/g, '')
  if (compact === '2-3' || compact === '2~3' || compact === '2–3') return { min: 2, max: 3 }
  if (compact === '4-5' || compact === '4~5' || compact === '4–5') return { min: 4, max: 5 }
  if (compact === '6-7' || compact === '6~7' || compact === '6–7' || compact === '6-7+' || compact === '6~7+') {
    return { min: 6, max: 7 }
  }
  const pair = normalized.match(AGE_PAIR_RE) ?? compact.match(AGE_PAIR_RE) ?? source.match(RANGE_RE)
  if (pair) return { min: Number(pair[1]), max: Number(pair[2]) }
  return null
}

function inferAgeRange(row: Row): { min: number; max: number } | null {
  return parseAgeString(str(row.age_group_en)) ?? parseAgeString(str(row.age_group))
}

function matchesAgeFilter(row: Row, ageId: string) {
  if (!ageId || ageId === 'all') return true
  const bounds = ageId === '2-3' ? { min: 2, max: 3 } : ageId === '4-5' ? { min: 4, max: 5 } : ageId === '6-7' ? { min: 6, max: 7 } : null
  if (!bounds) return true
  const range = inferAgeRange(row)
  if (!range) return true
  return range.min <= bounds.max && range.max >= bounds.min
}

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

function coloring(rows: Row[]) {
  return rows.filter((row) => str(row.category) === 'coloring-pages' || str(row.category) === 'coloring')
}

function categoryPageFilter(rows: Row[], opts: { q?: string; theme?: string; age?: string; browseAll?: boolean }) {
  const scoped = opts.browseAll ? rows : coloring(rows)
  const themeOptions = CATEGORY_THEMES['coloring-pages'] ?? []
  return scoped
    .filter((row) => matchesQuery(row, opts.q ?? ''))
    .filter((row) => matchesAgeFilter(row, opts.age ?? 'all'))
    .filter((row) => {
      const option = themeOptions.find((entry) => entry.id === (opts.theme ?? 'all'))
      if (!option || option.id === 'all') return true
      return matchesQuery(row, option.query ?? '')
    })
}

function hitReason(row: Row, query: string) {
  const needle = query.replace(/^#/, '').trim().toLowerCase()
  const reasons: string[] = []
  if (titleHaystack(row).includes(needle)) reasons.push('title')
  if (descriptionHaystack(row).includes(needle)) reasons.push('description')
  if (str(row.slug).toLowerCase().includes(needle)) reasons.push('slug')
  if (str(row.category).toLowerCase().includes(needle)) reasons.push('category')
  if (str(row.theme_en).toLowerCase().includes(needle) || str(row.theme_ko).toLowerCase().includes(needle)) {
    reasons.push('theme')
  }
  if (str(row.age_group).toLowerCase().includes(needle) || str(row.age_group_en).toLowerCase().includes(needle)) {
    reasons.push('age')
  }
  if (tagsOf(row).some((tag) => tag.toLowerCase().includes(needle))) reasons.push('tags')
  return reasons
}

function label(row: Row) {
  return `${row.slug}|${str(row.title_ko) || str(row.title)}`
}

function scanStatic() {
  const header = readFileSync(resolve('src/components/Header.tsx'), 'utf8')
  const categoryPage = readFileSync(resolve('src/pages/CategoryPage.tsx'), 'utf8')
  const service = readFileSync(resolve('src/services/printableService.ts'), 'utf8')
  const printable = readFileSync(resolve('src/types/printable.ts'), 'utf8')
  const playHub = readFileSync(resolve('src/pages/PlayHubPage.tsx'), 'utf8')
  const topSearch = readFileSync(resolve('src/components/layout/TopSearchHeader.tsx'), 'utf8')
  const catalogHeader = readFileSync(resolve('src/components/layout/CatalogHeader.tsx'), 'utf8')
  const queryHook = readFileSync(resolve('src/features/gallery/model/usePrintablesQuery.ts'), 'utf8')
  const layout = readFileSync(resolve('src/components/layout/AppLayout.tsx'), 'utf8')

  const missingNamed = [
    ['src/components/HeaderSearchInput.tsx', false],
    ['src/pages/AllPrintablesPage.tsx', false],
    ['src/hooks/usePrintables.ts', false],
  ] as const
  add({
    severity: 'INFO',
    area: 'wiring',
    title: '요청된 파일명은 없고 실제 검색 진입점은 다른 파일이다',
    detail:
      'HeaderSearchInput / AllPrintablesPage / usePrintables 없음. 라이브 검색은 Header.tsx(AppLayout MainHeader) + PlayHubPage 홈 검색 → CategoryPage ?q= . 데이터 훅은 usePrintablesQuery → fetchPrintables("all"). TopSearchHeader·CatalogHeader·HeroSearch는 레이아웃에 연결되어 있지 않거나 홈 구버전이다.',
  })
  void missingNamed

  const liveHeader = layout.includes('MainHeader')
  add({
    severity: liveHeader ? 'INFO' : 'HIGH',
    area: 'wiring',
    title: liveHeader ? 'AppLayout은 MainHeader(=Header.tsx)를 사용' : 'AppLayout 헤더 불명',
    detail: '카테고리가 아니면 /category?q= 로 이동(전체 카테고리 browseAll). 카테고리 안에서는 기존 params를 유지한 채 q만 갱신.',
  })

  const homeGoesColoring = playHub.includes('/category/coloring-pages?q=')
  const headerGoesBrowseAll = header.includes('navigate(`/category${nextQuery')
  add({
    severity: homeGoesColoring && headerGoesBrowseAll ? 'MEDIUM' : 'INFO',
    area: 'wiring',
    title: '홈 검색과 상세 헤더 검색의 목적지 범위가 다르다',
    detail: `PlayHubPage/TopSearchHeader → /category/coloring-pages?q= (색칠만). Header.tsx 비스테이션 → /category?q= (browseAll, 전 카테고리). ${homeGoesColoring && headerGoesBrowseAll ? '동일 키워드라도 진입 화면에 따라 결과 집합이 달라진다.' : ''}`,
  })

  const orIncludes = service.includes('.some((needle) => hay.includes(needle))') && service.includes(".split('|')")
  add({
    severity: orIncludes ? 'HIGH' : 'INFO',
    area: 'logic',
    title: 'matchesQuery는 trim + toLowerCase + | OR + includes 부분문자열',
    detail:
      '공백은 토큰 분절이 아니다. "아기 토끼"는 제목에 그 구절이 있어야 히트한다(AND가 아님). 사용자 입력에 | 가 있으면 OR 연산자로 해석된다. 선행 # 은 제거된다.',
  })

  const hayHasTitles = TITLE_KEYS.filter((key) => key !== 'title').every((key) => printable.includes(`item.${key}`))
  const hayHasDesc = printable.includes('item.description_ko') && /printableSearchText[\s\S]{0,500}description_/.test(printable)
  const hayHasSlug = /printableSearchText[\s\S]{0,400}item\.slug/.test(printable)
  const hayHasCategory = /printableSearchText[\s\S]{0,400}item\.category/.test(printable)
  add({
    severity: hayHasTitles ? 'INFO' : 'CRITICAL',
    area: 'haystack',
    title: hayHasTitles ? 'haystack에 10개 로케일 제목이 포함됨' : '로케일 제목 누락',
    detail: 'title + title_ko/en/ja/zh/es/pt/de/fr/it/vi',
  })
  add({
    severity: hayHasDesc ? 'INFO' : 'HIGH',
    area: 'haystack',
    title: hayHasDesc ? '설명문 description_* 이 haystack에 포함됨' : '설명문 description_* 이 검색 대상에서 제외됨',
    detail: 'printableSearchText는 제목·slug·category·theme·age·tags만 join한다. description_ko…vi 는 모델에 있으나 검색에 쓰이지 않는다.',
  })
  add({
    severity: hayHasSlug || hayHasCategory ? 'HIGH' : 'INFO',
    area: 'haystack',
    title: '시스템 ID(slug, category, theme_en)가 검색 haystack에 포함됨',
    detail: 'cat ⊂ coloring-pages, robot ⊂ space-robot, gl ⊂ slug. 서브탭 필터와 달리 통합 검색은 ID를 그대로 본다.',
  })

  const categoryUsesMatchesQuery = categoryPage.includes('matchesQuery(item, query)')
  const andFilters =
    categoryPage.includes('matchesAgeFilter(item, age)') && categoryPage.includes('matchesQuery(item, query)')
  add({
    severity: categoryUsesMatchesQuery && andFilters ? 'INFO' : 'CRITICAL',
    area: 'logic',
    title: 'CategoryPage는 q ∩ age ∩ theme ∩ sub 를 AND로 결합',
    detail: 'q는 matchesQuery, 테마는 부모 matchesQuery, 서브탭만 matchesSubtabQuery. 훅 usePrintablesQuery는 필터하지 않고 전체 카탈로그를 가져온 뒤 클라이언트에서 거른다.',
  })

  const queryHookAll = queryHook.includes("fetchPrintables('all')")
  add({
    severity: 'INFO',
    area: 'wiring',
    title: queryHookAll ? 'usePrintablesQuery는 서버 q 파라미터 없이 전체 fetch' : '데이터 훅 불명',
    detail: '검색어는 URL ?q= → CategoryPage useMemo. 네트워크 검색 쿼리는 없다.',
  })

  const liveTrim = header.includes('value.trim()') && categoryPage.includes("params.get('q')")
  add({
    severity: 'INFO',
    area: 'logic',
    title: liveTrim ? 'Header applyQuery는 trim 후 URL에 넣고 matchesQuery가 다시 trim' : 'trim 경로 불명',
    detail: '카테고리 페이지에서 onChange마다 trim+replace하므로 앞뒤 공백은 즉시 사라진다. 중간 공백은 유지된다. 한글 자모 분해/정규화는 없다.',
  })

  const catalogNoTrimOnChange = catalogHeader.includes('applyQuery(event.target.value)') && !catalogHeader.includes('value.trim()')
  add({
    severity: catalogNoTrimOnChange ? 'LOW' : 'INFO',
    area: 'wiring',
    title: 'CatalogHeader는 onChange에서 trim하지 않음 (현재 AppLayout 미사용)',
    detail: topSearch.includes('nextQuery = value.trim()')
      ? 'TopSearchHeader는 trim한다. 라이브 헤더는 Header.tsx.'
      : 'TopSearchHeader trim 여부 불명.',
  })
}

function scanCrash(rows: Row[]) {
  const probes = ['', '   ', '#', '#공룡', '공룡', 'ㄱㄴㄷ', 'ㅋㅋㅋ', '!@#$%^&*()', '👶🦖', 'a'.repeat(4000), '|', '드레스|기사', 'police car', '아기 토끼', "O'Reilly", '<script>', '\\n\\t']
  const crashed: string[] = []
  for (const query of probes) {
    try {
      for (const row of rows) matchesQuery(row, query)
    } catch (error) {
      crashed.push(`${JSON.stringify(query)}: ${(error as Error).message}`)
    }
  }
  add({
    severity: crashed.length ? 'CRITICAL' : 'INFO',
    area: 'runtime',
    title: crashed.length ? `특수 입력 ${crashed.length}건에서 matchesQuery 예외` : '특수문자·자모·장문 입력에서 matchesQuery 예외 없음',
    detail: crashed.join(' · ') || '빈문자/공백/#접두/파이프/이모지/4000자/HTML 모두 통과. 자모 분리 검색은 크래시 없이 0건이 된다.',
  })
}

function evalQuery(rows: Row[], query: string, scope: Row[] = rows) {
  const hits = scope.filter((row) => matchesQuery(row, query))
  const titleHits = scope.filter((row) => titleHaystack(row).includes(query.replace(/^#/, '').trim().toLowerCase()))
  const descOnly = scope.filter((row) => {
    const needle = query.replace(/^#/, '').trim().toLowerCase()
    if (!needle) return false
    return !titleHaystack(row).includes(needle) && descriptionHaystack(row).includes(needle)
  })
  const extras = hits.filter((row) => {
    const reasons = hitReason(row, query)
    return reasons.length > 0 && !reasons.includes('title') && !reasons.includes('description')
  })
  const missedFromTitle = titleHits.filter((row) => !hits.some((hit) => hit.slug === row.slug))
  samples.push({
    query,
    hit: hits.length,
    missTitles: missedFromTitle.map(label),
    extra: extras.slice(0, 8).map((row) => `${label(row)} [${hitReason(row, query).join('+')}]`),
  })
  return { hits, titleHits, descOnly, extras, missedFromTitle }
}

function scanQueries(rows: Row[]) {
  const colored = coloring(rows)
  const ko = ['티라노', '경찰차', '드레스', '축구', '눈사람', '공룡', '유니콘', '고양이', '소방차', '공주']
  const en = ['dinosaur', 'police', 'princess', 'soccer', 'snowman', 'unicorn', 'kitten', 'robot', 'cat']
  const jaZh = ['恐竜', 'パトカー', '獨角獸', 'ティラノ', 'ドレス', '雪だるま']
  const phrases = ['아기 토끼', '아기토끼', 'police car', 'policecar', 'fire truck', 't-rex', 't rex']

  for (const query of [...ko, ...en, ...jaZh, ...phrases]) {
    const result = evalQuery(rows, query, colored)
    if (result.missedFromTitle.length) {
      add({
        severity: 'HIGH',
        area: 'recall',
        title: `"${query}" 제목 히트를 검색이 놓침`,
        detail: result.missedFromTitle.map(label).join(' · '),
      })
    }
    if (result.descOnly.length) {
      add({
        severity: 'MEDIUM',
        area: 'recall',
        title: `"${query}" 는 설명문에만 있고 검색에서 제외됨`,
        detail: result.descOnly.slice(0, 8).map(label).join(' · '),
      })
    }
    if (result.extras.length) {
      add({
        severity: result.extras.length >= 5 ? 'HIGH' : 'MEDIUM',
        area: 'precision',
        title: `"${query}" 제목·설명 없이 ID/테마/태그로 오탐 ${result.extras.length}건`,
        detail: result.extras.slice(0, 10).map((row) => `${label(row)} [${hitReason(row, query).join('+')}]`).join(' · '),
      })
    }
  }

  const pipe = evalQuery(colored, '드레스|기사')
  add({
    severity: pipe.hits.length > evalQuery(colored, '드레스').hits.length ? 'MEDIUM' : 'INFO',
    area: 'logic',
    title: '사용자 입력 "|" 는 OR 연산자로 동작',
    detail: `드레스=${evalQuery(colored, '드레스').hits.length} · 기사=${evalQuery(colored, '기사').hits.length} · 드레스|기사=${pipe.hits.length}`,
  })

  const babySpace = evalQuery(colored, '아기 토끼')
  const babyTight = evalQuery(colored, '아기토끼')
  const babyAnd = colored.filter((row) => {
    const hay = titleHaystack(row)
    return hay.includes('아기') && hay.includes('토끼')
  })
  add({
    severity: babySpace.hits.length !== babyTight.hits.length || babyAnd.length !== babySpace.hits.length ? 'HIGH' : 'INFO',
    area: 'logic',
    title: '공백 구절은 AND 분절이 아니라 부분문자열 구절 매칭',
    detail: `"아기 토끼"=${babySpace.hits.length} ${babySpace.hits.map(label).join(', ') || '없음'} · "아기토끼"=${babyTight.hits.length} ${babyTight.hits.map(label).join(', ') || '없음'} · 제목에 아기 AND 토끼=${babyAnd.length} ${babyAnd.map(label).join(', ')}`,
  })

  const policeSpace = evalQuery(colored, 'police car')
  const policeTight = evalQuery(colored, 'policecar')
  add({
    severity: 'INFO',
    area: 'i18n',
    title: '영문 구절 police car vs policecar',
    detail: `"police car"=${policeSpace.hits.length} [${policeSpace.hits.map((row) => row.slug).join(', ')}] · policecar=${policeTight.hits.length} · police=${evalQuery(colored, 'police').hits.length}`,
  })
}

function scanCrossLang(rows: Row[]) {
  const colored = coloring(rows)
  const pairs: Array<{ ko: string; en: string; ja?: string; zh?: string }> = [
    { ko: '티라노', en: 'tyrannosaurus', ja: 'ティラノ' },
    { ko: '공룡', en: 'dinosaur', ja: '恐竜' },
    { ko: '경찰차', en: 'police', ja: 'パトカー' },
    { ko: '드레스', en: 'dress' },
    { ko: '공주', en: 'princess' },
    { ko: '축구', en: 'soccer' },
    { ko: '눈사람', en: 'snowman', ja: '雪だるま' },
    { ko: '유니콘', en: 'unicorn', zh: '獨角獸' },
    { ko: '고양이', en: 'kitten' },
  ]

  for (const pair of pairs) {
    const koHits = new Set(evalQuery(colored, pair.ko).hits.map((row) => row.slug))
    const enHits = new Set(evalQuery(colored, pair.en).hits.map((row) => row.slug))
    const koOnly = [...koHits].filter((slug) => !enHits.has(slug))
    const enOnly = [...enHits].filter((slug) => !koHits.has(slug))
    const overlap = [...koHits].filter((slug) => enHits.has(slug))
    const jaHits = pair.ja ? evalQuery(colored, pair.ja).hits.map((row) => row.slug) : []
    const zhHits = pair.zh ? evalQuery(colored, pair.zh).hits.map((row) => row.slug) : []
    const jaMiss = pair.ja ? [...koHits].filter((slug) => !jaHits.includes(slug)) : []
    const zhMiss = pair.zh ? [...koHits].filter((slug) => !zhHits.includes(slug)) : []

    add({
      severity: koHits.size && overlap.length === 0 ? 'HIGH' : koOnly.length || enOnly.length ? 'MEDIUM' : 'INFO',
      area: 'i18n',
      title: `교차언어 ${pair.ko} ↔ ${pair.en}`,
      detail: `ko=${koHits.size} en=${enHits.size} overlap=${overlap.length} koOnly=${koOnly.join(',') || '없음'} enOnly=${enOnly.join(',') || '없음'}${pair.ja ? ` · ja(${pair.ja})=${jaHits.length} ko미포함=${jaMiss.join(',') || '없음'}` : ''}${pair.zh ? ` · zh(${pair.zh})=${zhHits.length} ko미포함=${zhMiss.join(',') || '없음'}` : ''}`,
    })
  }

  const emptyLocales = TITLE_KEYS.filter((key) => key !== 'title').map((key) => {
    const filled = colored.filter((row) => str(row[key])).length
    return `${key}=${filled}/${colored.length}`
  })
  add({
    severity: 'INFO',
    area: 'i18n',
    title: '로케일 제목 채워진 비율',
    detail: emptyLocales.join(' · '),
  })

  const descFilled = DESC_KEYS.map((key) => `${key}=${colored.filter((row) => str(row[key])).length}/${colored.length}`)
  add({
    severity: 'INFO',
    area: 'haystack',
    title: '설명문 채워진 비율 (검색 미사용)',
    detail: descFilled.join(' · '),
  })
}

function scanIdCollisions(rows: Row[]) {
  const colored = coloring(rows)
  const idQueries = ['cat', 'pages', 'gl', 'robot', 'sea', 'coloring', 'hidden', '4-5', '2-3']
  for (const query of idQueries) {
    const result = evalQuery(colored, query)
    const idOnly = result.extras
    if (!idOnly.length && !result.hits.length) continue
    const titleOk = result.hits.length - idOnly.length
    add({
      severity: idOnly.length ? 'HIGH' : 'INFO',
      area: 'precision',
      title: `ID 부분문자열 "${query}": 전체 ${result.hits.length} / 제목외 ${idOnly.length} / 제목 ${titleOk}`,
      detail: idOnly.length
        ? idOnly.slice(0, 8).map((row) => `${label(row)} [${hitReason(row, query).join('+')}]`).join(' · ')
        : result.hits.slice(0, 6).map(label).join(' · ') || '없음',
    })
  }
}

function scanCombined(rows: Row[]) {
  const colored = coloring(rows)
  const cases = [
    { q: '티라노', age: '6-7', theme: 'dinosaur', name: '티라노+6~7세+공룡' },
    { q: '티라노', age: '4-5', theme: 'dinosaur', name: '티라노+4~5세+공룡' },
    { q: '티라노', age: 'all', theme: 'dinosaur', name: '티라노+공룡테마' },
    { q: '공룡', age: '6-7', theme: 'dinosaur', name: '공룡+6~7세+공룡테마' },
    { q: '드레스', age: '4-5', theme: 'princess', name: '드레스+4~5세+공주' },
    { q: '경찰차', age: '2-3', theme: 'vehicles', name: '경찰차+2~3세+탈것' },
    { q: '눈사람', age: 'all', theme: 'seasons', name: '눈사람+계절' },
    { q: '축구', age: 'all', theme: 'sports', name: '축구+스포츠' },
  ]

  for (const item of cases) {
    const byQ = new Set(categoryPageFilter(colored, { q: item.q }).map((row) => row.slug))
    const byAge = new Set(categoryPageFilter(colored, { age: item.age }).map((row) => row.slug))
    const byTheme = new Set(categoryPageFilter(colored, { theme: item.theme }).map((row) => row.slug))
    const expected = colored.filter((row) => byQ.has(row.slug) && byAge.has(row.slug) && byTheme.has(row.slug))
    const combined = categoryPageFilter(colored, { q: item.q, age: item.age, theme: item.theme })
    const combinedSlugs = combined.map((row) => row.slug).sort().join(',')
    const expectedSlugs = expected.map((row) => row.slug).sort().join(',')
    const mismatch = combinedSlugs !== expectedSlugs
    add({
      severity: mismatch ? 'CRITICAL' : combined.length === 0 && expected.length === 0 && byQ.size > 0 ? 'INFO' : 'INFO',
      area: 'combined',
      title: `${item.name}: 결합 ${combined.length}건${mismatch ? ' ≠ 교집합' : ' = q∩age∩theme'}`,
      detail: `q=${byQ.size} age=${byAge.size} theme=${byTheme.size} ∩=${expected.length} combined=${combined.length} [${combined.map(label).join(' / ') || '0건'}]${mismatch ? ' 교집합 불일치 버그' : combined.length === 0 && byQ.size ? ' — 검색 결과는 있으나 연령/테마 AND로 교집합 0 (증발처럼 보이지만 로직은 AND가 맞음)' : ''}`,
    })
  }
}

function scanHaystackCoverage(rows: Row[]) {
  const colored = coloring(rows)
  let descOnlyTokens = 0
  const examples: string[] = []
  for (const row of colored) {
    const titles = titleHaystack(row)
    const desc = descriptionHaystack(row)
    if (!desc) continue
    const tokens = [...new Set(desc.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length >= 2))]
    const unique = tokens.filter((token) => !titles.includes(token) && !liveHaystack(row).includes(token))
    if (unique.length) {
      descOnlyTokens += unique.length
      if (examples.length < 8) examples.push(`${row.slug}: ${unique.slice(0, 4).join(', ')}`)
    }
  }
  add({
    severity: descOnlyTokens ? 'MEDIUM' : 'INFO',
    area: 'haystack',
    title: `설명문에만 있는 토큰(제목·태그 hay 미포함) 약 ${descOnlyTokens}개`,
    detail: examples.join(' · ') || '설명 전용 검색어 없음',
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
  return (data ?? []).map((row) => {
    const item = row as Record<string, unknown>
    return { ...item, slug: str(item.slug) || str(item.id) } as Row
  })
}

function printReport(rows: Row[]) {
  const order: Finding['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
  console.log('DOOLIA search engine audit (read-only, no src mutation)')
  console.log(`catalog: ${rows.length} published, coloring=${coloring(rows).length}`)
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

  console.log('=== QUERY HIT TABLE (coloring-pages) ===')
  const colored = coloring(rows)
  const table = [
    '티라노',
    '경찰차',
    '드레스',
    '축구',
    '눈사람',
    'dinosaur',
    'police',
    'princess',
    'soccer',
    'snowman',
    '恐竜',
    'パトカー',
    '獨角獸',
    '아기 토끼',
    'cat',
    'robot',
  ]
  for (const query of table) {
    const hits = colored.filter((row) => matchesQuery(row, query))
    const extras = hits.filter((row) => !hitReason(row, query).includes('title'))
    console.log(
      `${query.padEnd(12)} hits=${String(hits.length).padStart(3)} titleExtra=${extras.length} ${hits
        .slice(0, 6)
        .map((row) => row.slug)
        .join(',')}`,
    )
  }
}

loadEnv()
const catalog = await fetchCatalog()
scanStatic()
scanCrash(catalog)
scanQueries(catalog)
scanCrossLang(catalog)
scanIdCollisions(catalog)
scanCombined(catalog)
scanHaystackCoverage(catalog)
printReport(catalog)

const critical = findings.filter((item) => item.severity === 'CRITICAL').length
process.exitCode = critical ? 1 : 0
