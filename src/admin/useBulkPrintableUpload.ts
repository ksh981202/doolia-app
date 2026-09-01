import { useCallback, useMemo, useState } from 'react'
import { matchBulkPrintables, unmatchedImageFiles, type BulkMatchRow } from '@/admin/matchBulkPrintables'
import { parsePrintableSheet, type ParsedPrintableRow } from '@/admin/parsePrintableSheet'
import { savePrintable, uploadAdminFile, draftFromParsedRow } from '@/services/adminPrintableService'

export type BulkUploadProgress = {
  current: number
  total: number
  label: string
}

export function useBulkPrintableUpload() {
  const [tsvName, setTsvName] = useState('')
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedPrintableRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<BulkUploadProgress | null>(null)
  const [message, setMessage] = useState('')

  const matches = useMemo(() => matchBulkPrintables(rows, files), [files, rows])
  const unmatched = useMemo(() => unmatchedImageFiles(matches, files), [files, matches])
  const matchedCount = matches.filter((item) => item.status === 'matched').length
  const missingCount = matches.filter((item) => item.status === 'missing').length

  const loadTsvFile = useCallback(async (file: File) => {
    const text = await file.text()
    const parsed = parsePrintableSheet(text)
    setTsvName(file.name)
    setRows(parsed.rows)
    setParseErrors(parsed.errors)
    setMessage(parsed.rows.length ? `${file.name}에서 ${parsed.rows.length}행을 읽었습니다.` : '')
  }, [])

  const addImageFiles = useCallback((incoming: File[]) => {
    setFiles((current) => {
      const next = new Map(current.map((file) => [`${file.name}:${file.size}:${file.lastModified}`, file]))
      for (const file of incoming) {
        next.set(`${file.name}:${file.size}:${file.lastModified}`, file)
      }
      return [...next.values()]
    })
  }, [])

  const reset = useCallback(() => {
    setTsvName('')
    setParseErrors([])
    setRows([])
    setFiles([])
    setProgress(null)
    setMessage('')
  }, [])

  const uploadMatched = useCallback(async () => {
    const ready = matches.filter((item) => item.status === 'matched')
    if (!ready.length) {
      setMessage('매칭된 도안이 없습니다. TSV와 이미지 파일명을 확인하세요.')
      return { saved: 0, errors: ['매칭된 도안이 없습니다.'] }
    }

    setUploading(true)
    setProgress({ current: 0, total: ready.length, label: '업로드 시작' })
    const errors: string[] = []
    let saved = 0

    try {
      for (const [index, item] of ready.entries()) {
        const title = item.row.title_ko || item.row.slug || `${index + 1}행`
        setProgress({ current: index, total: ready.length, label: title })
        try {
          const image_bw_url = item.bwFile ? await uploadAdminFile('printables', item.bwFile) : ''
          const image_color_url =
            item.mode === 'pair' && item.colorFile
              ? await uploadAdminFile('printables', item.colorFile)
              : image_bw_url
          const source = {
            ...item.row,
            slug: item.baseSlug || item.row.slug.replace(/_[bc]$/i, ''),
            type: item.mode === 'pair' ? 'bw' : item.row.type || 'single',
          }
          await savePrintable(
            draftFromParsedRow(source, {
              bw: image_bw_url,
              color: image_color_url,
            }),
          )
          saved += 1
        } catch (error) {
          errors.push(`${title}: ${error instanceof Error ? error.message : '저장 실패'}`)
        }
        setProgress({ current: index + 1, total: ready.length, label: title })
      }
      setMessage(`${saved}건 등록 완료.${errors.length ? ` 실패 ${errors.length}건.` : ''}`)
      return { saved, errors }
    } finally {
      setUploading(false)
    }
  }, [matches])

  return {
    tsvName,
    parseErrors,
    rows,
    files,
    matches,
    unmatched,
    matchedCount,
    missingCount,
    uploading,
    progress,
    message,
    loadTsvFile,
    addImageFiles,
    reset,
    uploadMatched,
  }
}

export type BulkMatchPreview = BulkMatchRow
