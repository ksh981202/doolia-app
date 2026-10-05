import { create } from 'zustand'

export type CopyrightReportContext = {
  printableId: string
  printableSlug: string
  printableTitle: string
  pageUrl: string
}

type CopyrightReportState = {
  isOpen: boolean
  context: CopyrightReportContext | null
  openReport: (context?: Partial<CopyrightReportContext>) => void
  closeReport: () => void
}

function currentPageUrl() {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

export const useCopyrightReportStore = create<CopyrightReportState>((set) => ({
  isOpen: false,
  context: null,
  openReport: (context) =>
    set({
      isOpen: true,
      context: {
        printableId: context?.printableId?.trim() || '',
        printableSlug: context?.printableSlug?.trim() || '',
        printableTitle: context?.printableTitle?.trim() || '',
        pageUrl: context?.pageUrl?.trim() || currentPageUrl(),
      },
    }),
  closeReport: () => set({ isOpen: false, context: null }),
}))
