import { useEffect } from 'react'
import { create } from 'zustand'
import { incrementPrintableLikes, incrementPrintableViews } from '@/services/printableService'
import { supabase } from '@/lib/supabase'
import type { Printable } from '@/types/printable'

const LIKE_PREFIX = 'doolia_likes_'

function storageKey(printable?: Printable | null) {
  if (!printable) return 'printable_placeholder'
  return printable.slug || printable.id || 'printable_placeholder'
}

function likeKeys(printable?: Printable | null) {
  if (!printable) return []
  return Array.from(new Set([printable.id, printable.slug].filter(Boolean))) as string[]
}

function readLiked(key: string) {
  try {
    return localStorage.getItem(`${LIKE_PREFIX}${key}`) === 'true'
  } catch {
    return false
  }
}

function writeLiked(keys: string[], liked: boolean) {
  try {
    for (const key of keys) {
      if (liked) localStorage.setItem(`${LIKE_PREFIX}${key}`, 'true')
      else localStorage.removeItem(`${LIKE_PREFIX}${key}`)
    }
  } catch {
    /* ignore quota / private mode */
  }
}

type EngagementState = {
  likes: Record<string, number>
  views: Record<string, number>
  liked: Record<string, boolean>
  hydrate: (printable?: Printable | null) => void
  toggleLike: (printable?: Printable | null) => void
  recordView: (printable?: Printable | null) => void
}

export const usePrintableEngagement = create<EngagementState>((set, get) => ({
  likes: {},
  views: {},
  liked: {},

  hydrate: (printable) => {
    if (!printable) return
    const key = storageKey(printable)
    const already = get().likes[key] !== undefined && get().views[key] !== undefined
    if (already) return

    const isLiked = likeKeys(printable).some(readLiked)
    const baseLikes = Math.max(0, printable.likes ?? 0)
    set((state) => ({
      liked: { ...state.liked, [key]: isLiked },
      likes: { ...state.likes, [key]: isLiked && baseLikes === 0 ? 1 : baseLikes },
      views: { ...state.views, [key]: Math.max(0, printable.views ?? 0) },
    }))
  },

  toggleLike: (printable) => {
    if (!printable) return
    const key = storageKey(printable)
    get().hydrate(printable)
    const nextLiked = !get().liked[key]
    // 낙관적 업데이트: ID 가드 없이 화면에 즉시 반영
    set((state) => ({
      liked: { ...state.liked, [key]: nextLiked },
      likes: { ...state.likes, [key]: Math.max(0, (state.likes[key] ?? 0) + (nextLiked ? 1 : -1)) },
    }))
    // 로컬 스토리지에 상태 저장 (새로고침 후 유지)
    writeLiked(likeKeys(printable), nextLiked)
    // 비동기 RPC 호출 (ID 가드 제거, 화면 상태와 무관하게 백그라운드 실행)
    void incrementPrintableLikes(printable.id, nextLiked ? 1 : -1)
    if (supabase && printable.slug) {
      void (supabase.rpc('increment_like', { target_slug: printable.slug }) as unknown as Promise<any>).catch(() => {})
    }
  },

  recordView: (printable) => {
    if (!printable) return
    const key = storageKey(printable)
    get().hydrate(printable)
    // 낙관적 업데이트: SessionStorage 가드 없이 화면에 즉시 반영
    set((state) => ({
      views: { ...state.views, [key]: (state.views[key] ?? Math.max(0, printable.views ?? 0)) + 1 },
    }))
    // 비동기 RPC 호출 (ID 가드 제거, 화면 상태와 무관하게 백그라운드 실행)
    void incrementPrintableViews(printable.id || printable.slug)
  },
}))

export function usePrintableSocial(printable?: Printable | null) {
  const key = storageKey(printable)
  const hydrate = usePrintableEngagement((state) => state.hydrate)

  useEffect(() => {
    if (printable) {
      hydrate(printable)
    }
  }, [hydrate, printable])

  return {
    isLiked: usePrintableEngagement((state) => state.liked[key] ?? (printable ? likeKeys(printable).some(readLiked) : false)),
    likesCount: usePrintableEngagement((state) => state.likes[key] ?? Math.max(0, printable?.likes ?? 0)),
    viewsCount: usePrintableEngagement((state) => state.views[key] ?? Math.max(0, printable?.views ?? 0)),
    toggleLike: () => printable && usePrintableEngagement.getState().toggleLike(printable),
    recordView: () => printable && usePrintableEngagement.getState().recordView(printable),
  }
}

