import { supabase } from '@/lib/supabase'

function isAdminPath() {
  if (typeof window === 'undefined') return true
  return window.location.pathname.startsWith('/admin')
}

export function logSearchKeyword(keyword: string, resultCount: number) {
  if (!supabase || isAdminPath()) return

  const normalized = keyword.trim()
  if (normalized.length < 2) return

  void supabase
    .rpc('log_search_query', {
      p_keyword: normalized,
      p_result_count: Math.max(0, resultCount),
    })
    .then(({ error }) => {
      if (error) console.warn('Failed to log search keyword:', error.message)
    })
}
