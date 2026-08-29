import { create } from 'zustand'
import {
  ALL_CATEGORY,
  NEED_FILTERS,
  type GalleryCategory,
  type NeedFilterId,
  type PopularTab,
} from '@/shared/config/categories'

type GalleryState = {
  category: GalleryCategory
  query: string
  popularTab: PopularTab
  needFilter: NeedFilterId | null
  setCategory: (category: GalleryCategory) => void
  setQuery: (query: string) => void
  setPopularTab: (tab: PopularTab) => void
  applyKeyword: (keyword: string) => void
  applyNeedFilter: (id: NeedFilterId) => void
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  category: ALL_CATEGORY,
  query: '',
  popularTab: 'all',
  needFilter: null,
  setCategory: (category) => set({ category }),
  setQuery: (query) => set({ query }),
  setPopularTab: (popularTab) => set({ popularTab }),
  applyKeyword: (keyword) =>
    set({
      query: keyword.replace(/^#/, ''),
      popularTab: 'all',
      needFilter: null,
    }),
  applyNeedFilter: (id) => {
    const next = get().needFilter === id ? null : id
    set({ needFilter: next })
    if (!next) return
    const filter = NEED_FILTERS.find((item) => item.id === next)
    if (filter) scrollToBrandPillar(filter.pillarId)
  },
}))

export function scrollToPopularGallery() {
  document.getElementById('popular-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToBrandPillar(pillarId: string) {
  const target =
    document.getElementById(`pillar-${pillarId}`) ?? document.getElementById('topic-explorer')
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
