import { jsPDF } from 'jspdf'
import type { Printable } from '@/types/printable'

const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_MM = 10
const WATERMARK_BAND_MM = 8
const DPI = 300
const MM_PER_INCH = 25.4
const WATERMARK = 'DOOLIA Printables (doolia.com) | For Personal & Educational Use Only'

function mmToPx(mm: number) {
  return Math.max(1, Math.round((mm / MM_PER_INCH) * DPI))
}

function sourceUrl(printable: Printable) {
  return (
    printable.image_bw_url ||
    printable.line_art_url ||
    printable.image_color_url ||
    printable.color_image_url ||
    ''
  )
}

function safePdfFilename(title: string) {
  const base =
    title
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'doolia-printable'
  return `${base.slice(0, 80)}.pdf`
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

async function loadLineArt(url: string) {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) throw new Error(`이미지 응답 오류 (${response.status})`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    try {
      return await decodeImage(objectUrl, false)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch {
    return decodeImage(url, true)
  }
}

function rasterizeForPrint(image: HTMLImageElement, drawWidthMm: number, drawHeightMm: number) {
  const canvas = document.createElement('canvas')
  canvas.width = mmToPx(drawWidthMm)
  canvas.height = mmToPx(drawHeightMm)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('PDF 캔버스를 만들지 못했습니다.')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  try {
    return canvas.toDataURL('image/png')
  } catch {
    throw new Error('이미지 CORS로 PDF를 만들지 못했습니다. R2 공개 버킷 CORS를 확인하세요.')
  }
}

export async function generatePrintablePdf(printable: Printable) {
  const url = sourceUrl(printable)
  if (!url) throw new Error('다운로드할 선화 이미지가 없습니다.')

  const image = await loadLineArt(url)
  const pixelWidth = image.naturalWidth || image.width
  const pixelHeight = image.naturalHeight || image.height
  if (!pixelWidth || !pixelHeight) throw new Error('이미지 크기를 읽지 못했습니다.')

  const maxWidth = PAGE_WIDTH_MM - MARGIN_MM * 2
  const maxHeight = PAGE_HEIGHT_MM - MARGIN_MM * 2 - WATERMARK_BAND_MM
  const fit = Math.min(maxWidth / pixelWidth, maxHeight / pixelHeight)
  const drawWidth = pixelWidth * fit
  const drawHeight = pixelHeight * fit
  const x = (PAGE_WIDTH_MM - drawWidth) / 2
  const y = MARGIN_MM + (maxHeight - drawHeight) / 2

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const dataUrl = rasterizeForPrint(image, drawWidth, drawHeight)
  pdf.addImage(dataUrl, 'PNG', x, y, drawWidth, drawHeight, undefined, 'FAST')

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(120, 120, 120)
  pdf.text(WATERMARK, PAGE_WIDTH_MM / 2, PAGE_HEIGHT_MM - 4, { align: 'center' })

  pdf.save(safePdfFilename(printable.title_ko || printable.title))
}
