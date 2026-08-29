import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { printablePath } from '@/shared/config/catalog'
import type { Printable } from '@/types/printable'

/** 데이터 로딩을 기다리지 않고 상세 페이지로 즉시 이동한다. */
export function useOpenPrintable() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (printable: Printable) => {
    queryClient.setQueryData(['printable', printable.id], printable)
    queryClient.setQueryData(['printable', printable.slug], printable)
    navigate(printablePath(printable.slug), { state: { printable } })
  }
}
