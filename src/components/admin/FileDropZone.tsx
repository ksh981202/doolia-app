import { useState, type DragEvent, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { filesFromDataTransfer } from '@/admin/collectDroppedFiles'

type FileDropZoneProps = {
  label: string
  hint: string
  accept: string
  multiple?: boolean
  disabled?: boolean
  children?: ReactNode
  onFiles: (files: File[]) => void
}

export function FileDropZone({
  label,
  hint,
  accept,
  multiple = true,
  disabled = false,
  children,
  onFiles,
}: FileDropZoneProps) {
  const [active, setActive] = useState(false)

  const onDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setActive(false)
    if (disabled) return
    const files = await filesFromDataTransfer(event.dataTransfer)
    if (files.length) onFiles(files)
  }

  return (
    <label
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setActive(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setActive(true)
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => void onDrop(event)}
      className={cn(
        'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-emerald-400 hover:bg-emerald-50/40',
        active ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-200 bg-white',
      )}
    >
      <p className="text-sm font-extrabold text-ink">{label}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted">{hint}</p>
      {children}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const list = Array.from(event.target.files ?? [])
          if (list.length) onFiles(list)
          event.target.value = ''
        }}
      />
    </label>
  )
}
