import { create } from 'zustand'
import type { Printable } from '@/db/types'

type DownloadState = {
  printable: Printable | null
  isOpen: boolean
  openModal: (printable: Printable) => void
  closeModal: () => void
}

export const useDownloadStore = create<DownloadState>((set) => ({
  printable: null,
  isOpen: false,
  openModal: (printable) => set({ printable, isOpen: true }),
  closeModal: () => set({ isOpen: false, printable: null }),
}))
