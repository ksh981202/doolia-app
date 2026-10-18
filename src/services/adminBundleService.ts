import type { AdminPrintable } from '@/services/adminPrintableService'

export interface AdminBundle {
  id: string
  title_ko: string
  title_en?: string
  title_ja?: string
  title_zh?: string
  title_es?: string
  title_pt?: string
  title_de?: string
  title_fr?: string
  title_it?: string
  title_vi?: string
  recommend_ko?: string
  recommend_en?: string
  recommend_ja?: string
  recommend_zh?: string
  recommend_es?: string
  recommend_pt?: string
  recommend_de?: string
  recommend_fr?: string
  recommend_it?: string
  recommend_vi?: string
  play_ko?: string
  play_en?: string
  play_ja?: string
  play_zh?: string
  play_es?: string
  play_pt?: string
  play_de?: string
  play_fr?: string
  play_it?: string
  play_vi?: string
  slug: string
  age_group: string
  recommend_reason: string
  how_to_play: string
  cover_image_url: string
  pdf_download_url: string
  affiliate_id: string
  item_slugs: string[]
  item_titles: string[]
  status: 'draft' | 'published'
  created_at: string
}

const STORAGE_KEY = 'doolia_admin_bundles'

export const DEFAULT_BUNDLES: AdminBundle[] = [
  {
    id: 'bundle-cloud-candy',
    title_ko: '몽실몽실 구름섬과 달콤한 과자나라 컬러링북 30선',
    title_en: 'Fluffy Cloud Island & Sweet Candy Land Coloring Book 30',
    slug: 'cloud-island-candy-land',
    age_group: '만 2~5세',
    recommend_reason: '어린이집 환경판 꾸미기와 소근육 발달을 돕는 구름·과자 테마 추천 모음집',
    how_to_play: '포근하고 알록달록한 파스텔 색상으로 솜사탕 구름과 달콤한 과자나라를 색칠해 보세요.',
    cover_image_url: 'https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev/printables/cute-baby-creature-napping-on-cloud-hill-coloring-page_c.webp',
    pdf_download_url: '',
    affiliate_id: 'scissors',
    item_slugs: [
      'cute-baby-creature-napping-on-cloud-hill-coloring-page',
      'airplane-flying-through-clouds-coloring-page',
      'baby-fantasy-creature-eating-starlight-cloud-coloring-page',
      'baby-floating-island-in-blue-sky-coloring-page',
      'baby-moon-rabbit-dipping-feet-in-galaxy-coloring-page',
      'baby-creature-floating-on-flower-petal-coloring-page',
      'baby-fairy-napping-in-acorn-hat-coloring-page',
      'baby-flower-fairy-smiling-inside-tulip-coloring-page',
      'baby-astronaut-waving-in-bubble-helmet-coloring-page',
      'baby-panda-playing-on-bamboo-stalk-coloring-page',
    ],
    item_titles: [
      '솜사탕 언덕에서 낮잠 자는 아기동물',
      '뭉게구름 사이를 시원하게 가르는 파란 비행기',
      '별빛 구름을 맛보는 아기 상상동물',
      '파란 하늘 위 둥둥 떠 있는 하늘섬',
      '은하수에 발을 담근 아기 달토끼',
      '꽃잎 배를 타고 둥실 떠가는 아기 동물',
      '도토리 모자 속에서 새근새근 낮잠 자는 아기 요정',
      '튤립 꽃 속에서 활짝 웃는 꽃요정',
      '우주 헬멧을 쓰고 손 흔드는 아기 우주비행사',
      '대나무 줄기에 매달려 노는 아기 판다',
    ],
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'bundle-jurassic-dino',
    title_ko: '쿵쾅쿵쾅 신나는 쥐라기 공룡 어드벤처 30선',
    title_en: 'Exciting Jurassic Dinosaur Adventure 30',
    slug: 'jurassic-dinosaur-adventure',
    age_group: '만 3~6세',
    recommend_reason: '아이들이 열광하는 최애 공룡들이 한자리에! 소근육 발달과 관찰력을 쑥쑥 키워주는 모음집',
    how_to_play: '선명한 색상으로 티라노사우루스와 원시림 숲을 칠하며 호기심을 키워보세요.',
    cover_image_url: 'https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev/printables/stegosaurus-walking-in-prehistoric-forest-coloring-page_c.webp',
    pdf_download_url: '',
    affiliate_id: 'crayons',
    item_slugs: [
      'stegosaurus-walking-in-prehistoric-forest-coloring-page',
      'baby-dino-hatching-with-eggshell-cap-coloring-page',
      'agile-pterosaur-gliding-over-cliff-nest-coloring-page',
      'baby-dinosaur-waiting-in-nest-coloring-page',
      'baby-dinosaur-with-eggshell-hat-coloring-page',
      'baby-dinosaurs-in-nest-waiting-for-mother-coloring-page',
      'baby-mosasaurus-swimming-in-clear-ocean-coloring-page',
      'baby-mosasaurus-wagging-tail-fin-coloring-page',
      'baby-elephant-spraying-water-fountain-coloring-page',
      'baby-penguin-sliding-across-frozen-ice-coloring-page',
    ],
    item_titles: [
      '숲길을 걷는 스테고사우루스',
      '알 껍질 모자 쓰고 깨어난 꼬마 아기공룡',
      '절벽 위 둥지를 맴도는 날렵한 프테라노돈',
      '둥지에서 엄마를 기다리는 아기 공룡',
      '달걀 모자를 쓴 아기 공룡',
      '둥지 속 형제 아기 공룡들',
      '맑은 바다를 헤엄치는 아기 모사사우루스',
      '꼬리 지느러미를 흔드는 아기 모사사우루스',
      '시원하게 물을 뿜는 아기 코끼리',
      '빙판 위를 쌩쌩 미끄러지는 아기 펭귄',
    ],
    status: 'published',
    created_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'bundle-underwater-kingdom',
    title_ko: '반짝반짝 바닷속 인어공주와 신비한 해양친구들 30선',
    title_en: 'Sparkling Mermaid & Ocean Friends 30',
    slug: 'ocean-mermaid-friends',
    age_group: '만 3~7세',
    recommend_reason: '조개 침대 속 아기 인어부터 돌고래까지, 감성과 몰입도를 높여주는 환상의 해양 테마',
    how_to_play: '푸른 바다 물결과 산호초를 다양한 색감으로 자유롭게 채색해 보세요.',
    cover_image_url: 'https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev/printables/baby-mermaid-sleeping-in-clam-shell-bed-coloring-page_c.webp',
    pdf_download_url: '',
    affiliate_id: 'colored_pencils',
    item_slugs: [
      'baby-mermaid-sleeping-in-clam-shell-bed-coloring-page',
      'baby-mermaid-sleeping-in-clamshell-bed-coloring-page',
      'baby-dolphin-leaping-out-of-ocean-coloring-page',
      'baby-mosasaurus-swimming-in-clear-ocean-coloring-page',
      'baby-penguin-waddling-with-mother-coloring-page',
      'airplane-flying-through-clouds-coloring-page',
      'baby-floating-island-in-blue-sky-coloring-page',
      'baby-creature-floating-on-flower-petal-coloring-page',
      'baby-fairy-napping-in-acorn-hat-coloring-page',
      'baby-flower-fairy-smiling-inside-tulip-coloring-page',
    ],
    item_titles: [
      '조개 침대에서 잠든 사랑스러운 꼬마 인어',
      '진주조개 요람 속 꼬마 인어공주',
      '파도를 가르며 높이 뛰어오르는 아기 돌고래',
      '맑은 바다를 헤엄치는 아기 모사사우루스',
      '엄마와 아장아장 걷는 아기 펭귄',
      '뭉게구름 사이를 시원하게 가르는 비행기',
      '파란 하늘 위 둥둥 떠 있는 하늘섬',
      '꽃잎 배를 타고 둥실 떠가는 아기 동물',
      '도토리 모자 속에서 낮잠 자는 아기 요정',
      '튤립 꽃 속에서 활짝 웃는 꽃요정',
    ],
    status: 'published',
    created_at: '2025-01-03T00:00:00.000Z',
  },
]

export const getBundles = (): AdminBundle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      // 최초 방문 시 1회만 기본값 세팅
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BUNDLES))
      return DEFAULT_BUNDLES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to load bundles from localStorage', e)
    return []
  }
}

export function createDraftBundle(selectedItems: AdminPrintable[]): AdminBundle {
  const bundles = getBundles()
  const firstItem = selectedItems[0]

  const newBundle: AdminBundle = {
    id: Date.now().toString(),
    title_ko: '새 모음집 초안',
    title_en: '',
    slug: `bundle-${Date.now()}`,
    age_group: '만 2~4세',
    recommend_reason: '',
    how_to_play: '',
    cover_image_url: firstItem?.image_color_url || firstItem?.image_bw_url || '',
    pdf_download_url: '',
    affiliate_id: 'scissors',
    item_slugs: selectedItems.map((item) => item.slug || item.id),
    item_titles: selectedItems.map((item) => item.title_ko || item.title_en || item.slug || ''),
    status: 'draft',
    created_at: new Date().toISOString(),
  }

  bundles.unshift(newBundle)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bundles))
  return newBundle
}

export function updateBundle(id: string, updatedData: Partial<AdminBundle>): void {
  const bundles = getBundles()
  const index = bundles.findIndex((b) => b.id === id)
  if (index !== -1) {
    bundles[index] = { ...bundles[index], ...updatedData }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundles))
  }
}

export function deleteBundle(id: string): void {
  const bundles = getBundles().filter((b) => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bundles))
}
