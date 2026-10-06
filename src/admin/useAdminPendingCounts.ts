import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ADMIN_PENDING_CHANGED,
  ADMIN_PENDING_COUNTS_KEY,
  ADMIN_REPORTS_COUNT_KEY,
  type AdminPendingCounts,
} from '@/admin/pendingEvents'
import { countPendingCopyrightReports } from '@/services/copyrightReportService'
import { countPendingGeneralInquiries } from '@/services/generalInquiryService'

async function fetchPendingCounts(previous?: AdminPendingCounts): Promise<AdminPendingCounts> {
  const [reportsResult, inquiriesResult] = await Promise.allSettled([
    countPendingCopyrightReports(),
    countPendingGeneralInquiries(),
  ])
  return {
    reports: reportsResult.status === 'fulfilled' ? reportsResult.value : (previous?.reports ?? 0),
    inquiries: inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : (previous?.inquiries ?? 0),
  }
}

export function useAdminPendingCounts() {
  const { pathname } = useLocation()
  const queryClient = useQueryClient()

  const pending = useQuery({
    queryKey: ADMIN_PENDING_COUNTS_KEY,
    queryFn: () => fetchPendingCounts(queryClient.getQueryData(ADMIN_PENDING_COUNTS_KEY)),
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })

  const reportsCount = useQuery({
    queryKey: ADMIN_REPORTS_COUNT_KEY,
    queryFn: countPendingCopyrightReports,
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })

  useEffect(() => {
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<Partial<AdminPendingCounts>>).detail
      if (detail && typeof detail.reports === 'number') {
        queryClient.setQueryData(ADMIN_REPORTS_COUNT_KEY, detail.reports)
        queryClient.setQueryData(ADMIN_PENDING_COUNTS_KEY, (current: AdminPendingCounts | undefined) => ({
          reports: detail.reports as number,
          inquiries: typeof detail.inquiries === 'number' ? detail.inquiries : (current?.inquiries ?? 0),
        }))
      }
      if (detail && typeof detail.inquiries === 'number') {
        queryClient.setQueryData(ADMIN_PENDING_COUNTS_KEY, (current: AdminPendingCounts | undefined) => ({
          reports: typeof detail.reports === 'number' ? detail.reports : (current?.reports ?? 0),
          inquiries: detail.inquiries as number,
        }))
      }
      void queryClient.invalidateQueries({ queryKey: ADMIN_PENDING_COUNTS_KEY })
      void queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_COUNT_KEY })
    }
    window.addEventListener(ADMIN_PENDING_CHANGED, refresh)
    return () => window.removeEventListener(ADMIN_PENDING_CHANGED, refresh)
  }, [queryClient, pathname])

  const pendingReportsCount = reportsCount.data ?? pending.data?.reports ?? 0
  const pendingInquiriesCount = pending.data?.inquiries ?? 0

  return { pendingReportsCount, pendingInquiriesCount }
}
