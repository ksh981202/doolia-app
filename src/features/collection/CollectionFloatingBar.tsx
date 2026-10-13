import { useState, useEffect } from 'react'
import { ShoppingBag, Printer, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePrintableCollection } from '@/features/collection/usePrintableCollection'
import { CollectionModal } from '@/features/collection/CollectionModal'

interface FloatingBarTexts {
  ariaLabel: string
  countBadge: (count: number) => string
  btnPrint: string
  dismissLabel: string
}

const FLOATING_DICTIONARY: Record<string, FloatingBarTexts> = {
  ko: {
    ariaLabel: '담은 도안 바구니 열기',
    countBadge: (count) => `담은 도안 ${count}장`,
    btnPrint: '인쇄하기',
    dismissLabel: '닫기',
  },
  en: {
    ariaLabel: 'Open coloring basket',
    countBadge: (count) => `${count} Selected`,
    btnPrint: 'Print',
    dismissLabel: 'Close',
  },
  zh: {
    ariaLabel: '打開已收藏著色圖籃子',
    countBadge: (count) => `已選 ${count} 張`,
    btnPrint: '去列印',
    dismissLabel: '關閉',
  },
  ja: {
    ariaLabel: '保存したぬりえバスケットを開く',
    countBadge: (count) => `選択中 ${count}枚`,
    btnPrint: '印刷する',
    dismissLabel: '閉じる',
  },
  es: {
    ariaLabel: 'Abrir cesta de dibujos',
    countBadge: (count) => `${count} seleccionados`,
    btnPrint: 'Imprimir',
    dismissLabel: 'Cerrar',
  },
  de: {
    ariaLabel: 'Ausmalbilder-Korb öffnen',
    countBadge: (count) => `${count} ausgewählt`,
    btnPrint: 'Drucken',
    dismissLabel: 'Schließen',
  },
  fr: {
    ariaLabel: 'Ouvrir le panier de coloriages',
    countBadge: (count) => `${count} sélectionnés`,
    btnPrint: 'Imprimer',
    dismissLabel: 'Fermer',
  },
  pt: {
    ariaLabel: 'Abrir cesta de desenhos',
    countBadge: (count) => `${count} selecionados`,
    btnPrint: 'Imprimir',
    dismissLabel: 'Fechar',
  },
  it: {
    ariaLabel: 'Apri il cestino dei disegni',
    countBadge: (count) => `${count} selezionati`,
    btnPrint: 'Stampa',
    dismissLabel: 'Chiudi',
  },
  vi: {
    ariaLabel: 'Mở giỏ tranh tô màu',
    countBadge: (count) => `Đã chọn ${count} tranh`,
    btnPrint: 'In ngay',
    dismissLabel: 'Đóng',
  },
}

export function CollectionFloatingBar() {
  const { count, clearCollection } = usePrintableCollection()
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const lang = (i18n.language || 'ko').slice(0, 2)
  const dict = FLOATING_DICTIONARY[lang] || FLOATING_DICTIONARY.ko

  // Listen to open collection modal event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('doolia_open_collection_modal', handleOpen)
    return () => {
      window.removeEventListener('doolia_open_collection_modal', handleOpen)
    }
  }, [])

  if (count === 0 && !isOpen) {
    return null
  }

  const handleClick = () => {
    setIsOpen(true)
  }

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    clearCollection()
  }

  return (
    <>
      {count > 0 && (
        <div className="fixed bottom-6 right-6 z-40 print:hidden transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/95 p-1 pl-4 text-white shadow-lg backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-xl">
            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-2.5 py-2 cursor-pointer focus:outline-none"
              aria-label={dict.ariaLabel}
            >
              <span className="relative flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-emerald-400" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white leading-none">
                  {count}
                </span>
              </span>
              <span className="text-sm font-semibold tracking-tight">{dict.countBadge(count)}</span>
              <span className="mx-0.5 h-3.5 w-px bg-slate-700" />
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                <Printer className="h-3.5 w-3.5" />
                {dict.btnPrint}
              </span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer focus:outline-none"
              aria-label={dict.dismissLabel}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <CollectionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}



