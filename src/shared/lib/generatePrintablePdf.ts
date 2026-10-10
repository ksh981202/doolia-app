import type { Printable } from '@/types/printable'
import { drawPrintFooter } from '@/shared/lib/printFooter'
import { printableViewUrl, type PrintableViewMode } from '@/shared/utils/printableAssets'

const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_MM = 10
const FOOTER_BAND_MM = 14
const DPI = 300
const MM_PER_INCH = 25.4

function mmToPx(mm: number) {
  return Math.max(1, Math.round((mm / MM_PER_INCH) * DPI))
}

function safePdfFilename(slug: string, variant: PrintableViewMode) {
  const base =
    slug
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim() || 'doolia-printable'
  return `${base.slice(0, 80)}_${variant}.pdf`
}

function decodeImage(src: string, cors: boolean) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    if (cors) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('도안 이미지를 불러오지 못했습니다.'))
    image.src = src
  })
}

async function loadImageFromFetch(url: string): Promise<HTMLImageElement> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    })
    if (!response.ok) {
      throw new Error(`이미지 응답 오류 (${response.status})`)
    }
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    try {
      return await decodeImage(objectUrl, false)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch (error) {
    throw new Error(`fetch 실패: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function loadImageFromDomCache(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('DOM 캐시도 실패'))
    image.src = url
  })
}

async function loadLineArt(url: string, fallbackImage?: HTMLImageElement) {
  try {
    return await loadImageFromFetch(url)
  } catch (fetchError) {
    console.warn(`[PDF] fetch 실패, fallback 시도: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`)
    
    if (fallbackImage) {
      console.log('[PDF] DOM 캐시 이미지 사용')
      return fallbackImage
    }
    
    // 최후 fallback: 직접 URL 로드
    try {
      return await loadImageFromDomCache(url)
    } catch (domError) {
      throw new Error(`이미지 로딩 실패 (fetch: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}, dom: ${domError instanceof Error ? domError.message : String(domError)})`)
    }
  }
}

function rasterizeA4Page(image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = mmToPx(PAGE_WIDTH_MM)
  canvas.height = mmToPx(PAGE_HEIGHT_MM)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('PDF 캔버스를 만들지 못했습니다.')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const margin = mmToPx(MARGIN_MM)
  const footerHeight = mmToPx(FOOTER_BAND_MM)
  const artWidth = canvas.width - margin * 2
  const artHeight = canvas.height - margin - footerHeight
  const pixelWidth = image.naturalWidth || image.width
  const pixelHeight = image.naturalHeight || image.height
  const fit = Math.min(artWidth / pixelWidth, artHeight / pixelHeight)
  const drawWidth = pixelWidth * fit
  const drawHeight = pixelHeight * fit
  const x = (canvas.width - drawWidth) / 2
  const y = margin + (artHeight - drawHeight) / 2
  ctx.drawImage(image, x, y, drawWidth, drawHeight)
  drawPrintFooter(ctx, canvas.width, canvas.height, footerHeight, margin)

  try {
    return canvas.toDataURL('image/png')
  } catch {
    throw new Error('이미지 CORS로 PDF를 만들지 못했습니다. R2 공개 버킷 CORS를 확인하세요.')
  }
}

export async function generatePrintablePdf(
  printable: Printable,
  options?: { variant?: PrintableViewMode; fallbackImage?: HTMLImageElement },
) {
  const variant = options?.variant ?? 'bw'
  const url = printableViewUrl(printable, variant)
  if (!url) throw new Error('다운로드할 선화 이미지가 없습니다.')

  const image = await loadLineArt(url, options?.fallbackImage)
  const pixelWidth = image.naturalWidth || image.width
  const pixelHeight = image.naturalHeight || image.height
  if (!pixelWidth || !pixelHeight) throw new Error('이미지 크기를 읽지 못했습니다.')

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const dataUrl = rasterizeA4Page(image)
  pdf.addImage(dataUrl, 'PNG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, undefined, 'FAST')

  pdf.save(safePdfFilename(printable.slug || printable.id || printable.title_ko || printable.title, variant))
}
