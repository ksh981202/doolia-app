import { create } from 'zustand'
import type { Printable } from '@/db/types'
import type { PrintableViewMode } from '@/shared/utils/printableAssets'

type DownloadState = {
  printable: Printable | null
  isOpen: boolean
  viewMode: PrintableViewMode
  setViewMode: (viewMode: PrintableViewMode) => void
  openModal: (printable: Printable, viewMode?: PrintableViewMode) => void
  closeModal: () => void
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  printable: null,
  isOpen: false,
  viewMode: 'bw',
  setViewMode: (viewMode) => set({ viewMode }),
  openModal: (printable, viewMode) =>
    set({
      printable,
      isOpen: true,
      viewMode: viewMode ?? get().viewMode ?? 'bw',
    }),
  closeModal: () => set({ isOpen: false, printable: null }),
}))
