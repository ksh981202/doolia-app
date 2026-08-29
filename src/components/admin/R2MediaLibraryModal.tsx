import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  fetchR2MediaLibrary,
  uploadR2MediaFile,
  type R2MediaItem,
} from '@/services/r2MediaService'
import { cn } from '@/shared/lib/cn'

type R2MediaLibraryModalProps = {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function R2MediaLibraryModal({ open, onClose, onSelect }: R2MediaLibraryModalProps) {
  const [items, setItems] = useState<R2MediaItem[]>([])
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchR2MediaLibrary()
      .then((library) => {
        if (cancelled) return
        setItems(library.items)
        setConnected(library.connected)
        setMessage(library.message ?? '')
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : '미디어 라이브러리를 열 수 없습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const upload = async (file: File | undefined) => {
    if (!file) {
      setError('JPG, PNG, WEBP 파일을 선택해 주세요.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const item = await uploadR2MediaFile(file)
      setItems((current) => [item, ...current.filter((entry) => entry.url !== item.url)])
      setMessage(item.local ? '로컬 미리보기로 추가했습니다. R2가 연결되면 버킷에 저장됩니다.' : 'R2에 업로드되어 목록 맨 앞에 추가되었습니다.')
      if (fileRef.current) fileRef.current.value = ''
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="r2-media-title"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-emerald-100 px-4 py-4 sm:px-5">
          <div>
            <h2 id="r2-media-title" className="font-display text-lg font-semibold text-ink">
              R2 미디어 라이브러리
            </h2>
            <p className="mt-1 text-xs font-bold">
              <span className={connected ? 'text-emerald-700' : 'text-amber-700'}>
                {connected ? 'Cloudflare R2 연결됨' : '로컬 미리보기 모드'}
              </span>
              {message ? <span className="mt-1 block font-medium text-muted">{message}</span> : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-emerald-50 bg-emerald-50/50 px-4 py-3 sm:px-5">
          <p className="text-xs font-bold text-ink">새 고화질 AI 이미지 업로드 (JPG, PNG, WEBP)</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-emerald-800"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => void upload(fileRef.current?.files?.[0])}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {uploading ? '업로드 중... ⏳' : 'R2에 업로드'}
            </button>
          </div>
          {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-2xl bg-emerald-50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-10 text-center text-sm font-bold text-muted">
              아직 표시할 이미지가 없습니다. 위에서 AI 이미지를 올리면 여기에 나타납니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className={cn(
                    'group overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md',
                  )}
                >
                  <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" />
                  <span className="block truncate px-2 py-1.5 text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">
                    {item.local ? '로컬 · ' : ''}
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
