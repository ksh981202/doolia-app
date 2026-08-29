import { create } from 'zustand'

type BookmarkState = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  ids: [],
  has: (id) => get().ids.includes(id),
  toggle: (id) =>
    set((state) => ({
      ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id],
    })),
}))
