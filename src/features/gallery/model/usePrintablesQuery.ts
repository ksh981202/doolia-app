import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPrintableById, fetchPrintables } from '@/services/printableService'
import type { Printable } from '@/types/printable'

export function usePrintablesQuery() {
  return useQuery({
    queryKey: ['printables'],
    queryFn: () => fetchPrintables('all'),
  })
}

export function usePrintableQuery(id: string | undefined) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['printable', id],
    queryFn: () => fetchPrintableById(id as string),
    enabled: Boolean(id),
    placeholderData: () => {
      if (!id) return undefined
      const cached = queryClient.getQueryData<Printable>(['printable', id])
      if (cached) return cached
      const list = queryClient.getQueryData<Printable[]>(['printables'])
      return list?.find((item) => item.id === id || item.slug === id)
    },
  })
}
