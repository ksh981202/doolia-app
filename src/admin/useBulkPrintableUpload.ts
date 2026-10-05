import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { isImageFile } from '@/admin/matchBulkPrintables'
import { parsePrintableSheet, type ParsedPrintableRow } from '@/admin/parsePrintableSheet'
import { draftFromParsedRow, savePrintable, uploadAdminFile } from '@/services/adminPrintableService'

export type BulkUploadProgress = {
  current: number
  total: number
  label: string
}

export type SmartPairStatus = 'ready' | 'need-bw' | 'need-color' | 'need-both'

export type SmartPairRow = {
  index: number
  row: ParsedPrintableRow
  slug: string
  bwFile?: File
  colorFile?: File
  status: SmartPairStatus
}

type SlotFile = File | null

function naturalCompare(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
}

function sortFilesNaturally(files: File[]) {
  return [...files].sort((a, b) => naturalCompare(a.name, b.name))
}

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function mergeSortedFiles(current: SlotFile[], incoming: File[]) {
  const filled = current.filter((file): file is File => Boolean(file))
  const next = new Map(filled.map((file) => [fileIdentity(file), file]))
  for (const file of incoming) {
    if (!isImageFile(file)) continue
    next.set(fileIdentity(file), file)
  }
  return sortFilesNaturally([...next.values()])
}

function padSlots(items: SlotFile[], length: number) {
  const next = [...items]
  while (next.length < length) next.push(null)
  return next
}

function moveItem(items: SlotFile[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items
  const next = padSlots(items, Math.max(fromIndex, toIndex) + 1)
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

function replaceAt(items: SlotFile[], index: number, file: File) {
  if (!isImageFile(file) || index < 0) return items
  const next = padSlots(items, index + 1)
  next[index] = file
  return next
}

function printableSlug(row: ParsedPrintableRow, index: number) {
  const slug = row.slug.replace(/_[bc]$/i, '').trim()
  return slug || `row-${index + 1}`
}

function fileExtension(file: File) {
  const match = file.name.match(/\.([a-z0-9]+)$/i)
  return (match?.[1] || 'jpg').toLowerCase()
}

function renameUploadFile(file: File, slug: string, variant: 'b' | 'c') {
  const ext = fileExtension(file)
  return new File([file], `${slug}_${variant}.${ext}`, {
    type: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    lastModified: file.lastModified,
  })
}

export function useBulkPrintableUpload() {
  const queryClient = useQueryClient()
  const [tsvName, setTsvName] = useState('')
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedPrintableRow[]>([])
  const [bwFiles, setBwFiles] = useState<SlotFile[]>([])
  const [colorFiles, setColorFiles] = useState<SlotFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<BulkUploadProgress | null>(null)
  const [message, setMessage] = useState('')

  const pairs = useMemo<SmartPairRow[]>(
    () =>
      rows.map((row, index) => {
        const bwFile = bwFiles[index] ?? undefined
        const colorFile = colorFiles[index] ?? undefined
        const status: SmartPairStatus =
          bwFile && colorFile ? 'ready' : bwFile ? 'need-color' : colorFile ? 'need-bw' : 'need-both'
        return { index, row, slug: printableSlug(row, index), bwFile, colorFile, status }
      }),
    [bwFiles, colorFiles, rows],
  )

  const readyCount = pairs.filter((item) => item.status === 'ready').length
  const allReady = pairs.length > 0 && readyCount === pairs.length

  const applyParsed = useCallback((text: string, name: string) => {
    const parsed = parsePrintableSheet(text)
    setTsvName(name)
    setRows(parsed.rows)
    setParseErrors(parsed.errors)
    setMessage(parsed.rows.length ? `${name}에서 ${parsed.rows.length}행을 읽었습니다.` : '')
  }, [])

  const loadTsvFile = useCallback(
    async (file: File) => {
      applyParsed(await file.text(), file.name)
    },
    [applyParsed],
  )

  const loadTsvText = useCallback(
    (text: string) => {
      applyParsed(text, '붙여넣은 TSV')
    },
    [applyParsed],
  )

  const addBwFiles = useCallback((incoming: File[]) => {
    setBwFiles((current) => mergeSortedFiles(current, incoming))
  }, [])

  const addColorFiles = useCallback((incoming: File[]) => {
    setColorFiles((current) => mergeSortedFiles(current, incoming))
  }, [])

  const reorderBw = useCallback((fromIndex: number, toIndex: number) => {
    setBwFiles((current) => moveItem(current, fromIndex, toIndex))
  }, [])

  const reorderColor = useCallback((fromIndex: number, toIndex: number) => {
    setColorFiles((current) => moveItem(current, fromIndex, toIndex))
  }, [])

  const replaceBw = useCallback((index: number, file: File) => {
    setBwFiles((current) => replaceAt(current, index, file))
  }, [])

  const replaceColor = useCallback((index: number, file: File) => {
    setColorFiles((current) => replaceAt(current, index, file))
  }, [])

  const reset = useCallback(() => {
    setTsvName('')
    setParseErrors([])
    setRows([])
    setBwFiles([])
    setColorFiles([])
    setProgress(null)
    setMessage('')
  }, [])

  const uploadMatched = useCallback(async () => {
    if (!pairs.length) {
      const empty = 'TSV 행이 없습니다.'
      setMessage(empty)
      return { saved: 0, errors: [empty] }
    }
    if (!allReady) {
      const incomplete = `모든 행에 흑백/컬러 쌍이 필요합니다. 준비 ${readyCount}/${pairs.length}`
      setMessage(incomplete)
      return { saved: 0, errors: [incomplete] }
    }

    setUploading(true)
    setProgress({ current: 0, total: pairs.length, label: '업로드 시작' })
    const errors: string[] = []
    let saved = 0

    try {
      for (const [index, item] of pairs.entries()) {
        const title = item.row.title_ko || item.slug || `${index + 1}행`
        setProgress({ current: index, total: pairs.length, label: title })
        try {
          const renamedBw = renameUploadFile(item.bwFile as File, item.slug, 'b')
          const renamedColor = renameUploadFile(item.colorFile as File, item.slug, 'c')
          const image_bw_url = await uploadAdminFile('printables', renamedBw)
          const image_color_url = await uploadAdminFile('printables', renamedColor)
          await savePrintable(
            draftFromParsedRow(
              {
                ...item.row,
                slug: item.slug,
                type: item.row.type.trim() || 'bw',
              },
              { bw: image_bw_url, color: image_color_url },
            ),
          )
          saved += 1
        } catch (error) {
          const detail = error instanceof Error ? error.message : '저장 실패'
          errors.push(`${title}: ${detail}`)
        }
        setProgress({ current: index + 1, total: pairs.length, label: title })
      }
      if (saved > 0) {
        await queryClient.invalidateQueries({ queryKey: ['printables'] })
      }
      setMessage(`${saved}건 등록 완료.${errors.length ? ` 실패 ${errors.length}건.` : ''}`)
      return { saved, errors }
    } finally {
      setUploading(false)
    }
  }, [allReady, pairs, queryClient, readyCount])

  return {
    tsvName,
    parseErrors,
    rows,
    bwFiles,
    colorFiles,
    pairs,
    readyCount,
    allReady,
    uploading,
    progress,
    message,
    loadTsvFile,
    loadTsvText,
    addBwFiles,
    addColorFiles,
    reorderBw,
    reorderColor,
    replaceBw,
    replaceColor,
    reset,
    clearAll: reset,
    uploadMatched,
  }
}
