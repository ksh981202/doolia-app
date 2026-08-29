import { useEffect } from 'react'

type LightboxModalProps = {
  open: boolean
  src: string
  title: string
  onClose: () => void
  onPrint?: () => void
}

export function LightboxModal({ open, src, title, onClose, onPrint }: LightboxModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="도안 크게 보기"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 cursor-pointer text-2xl font-bold text-white hover:text-emerald-400"
        aria-label="닫기"
      >
        ✕
      </button>
      <img
        src={src}
        alt={`${title} 확대 보기`}
        className="max-h-[90vh] rounded-lg bg-white p-2 object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
      {onPrint ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onPrint()
          }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-500"
        >
          🖨️ A4 PDF 인쇄하기
        </button>
      ) : null}
    </div>
  )
}
