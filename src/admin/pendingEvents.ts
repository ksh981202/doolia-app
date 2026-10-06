export const ADMIN_PENDING_CHANGED = 'doolia-admin-pending-changed'
export const ADMIN_PENDING_COUNTS_KEY = ['admin', 'pending-counts'] as const
export const ADMIN_REPORTS_COUNT_KEY = ['admin', 'reports-count'] as const

export type AdminPendingCounts = {
  reports: number
  inquiries: number
}

export function notifyAdminPendingChanged(detail?: Partial<AdminPendingCounts>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ADMIN_PENDING_CHANGED, { detail }))
}
