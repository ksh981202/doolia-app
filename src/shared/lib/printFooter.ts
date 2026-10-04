export const PRINT_FOOTER_BRAND = 'DOOLIA'
export const PRINT_FOOTER_SITE = 'doolia.app'
export const PRINT_FOOTER_LEGAL =
  '© DOOLIA. For Personal & Educational Use Only. Commercial Use & Resale Prohibited.'

export function printFooterMarkup() {
  return `<div class="print-footer">
  <div class="print-footer-brand">
    <span class="print-footer-name">${PRINT_FOOTER_BRAND}</span>
    <span class="print-footer-sep">|</span>
    <span>${PRINT_FOOTER_SITE}</span>
  </div>
  <div class="print-footer-legal">${PRINT_FOOTER_LEGAL}</div>
</div>`
}

export function drawPrintFooter(
  ctx: CanvasRenderingContext2D,
  pageWidth: number,
  pageHeight: number,
  footerHeight: number,
  sideMargin: number,
) {
  const top = pageHeight - footerHeight
  ctx.save()
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = Math.max(1, pageWidth / 900)
  ctx.beginPath()
  ctx.moveTo(sideMargin, top)
  ctx.lineTo(pageWidth - sideMargin, top)
  ctx.stroke()

  const midY = top + footerHeight * 0.52
  const brandSize = Math.max(18, Math.round(pageWidth * 0.016))
  const legalSize = Math.max(14, Math.round(pageWidth * 0.013))

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = `700 ${brandSize}px "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  ctx.fillStyle = '#334155'
  ctx.fillText(PRINT_FOOTER_BRAND, sideMargin, midY)
  const brandWidth = ctx.measureText(PRINT_FOOTER_BRAND).width

  ctx.font = `500 ${legalSize}px "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`  |  ${PRINT_FOOTER_SITE}`, sideMargin + brandWidth, midY)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `500 ${legalSize}px "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  const maxLegal = pageWidth - sideMargin * 2 - brandWidth - pageWidth * 0.18
  let legal = PRINT_FOOTER_LEGAL
  while (ctx.measureText(legal).width > maxLegal && legal.length > 20) {
    legal = `${legal.slice(0, -2)}…`
  }
  ctx.fillText(legal, pageWidth - sideMargin, midY)
  ctx.restore()
}
