function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Isolated print-window CSS. Avoid 100vh + @page 10mm — that overflows onto page 2. */
export const PRINT_DOCUMENT_STYLES = `@page {
  size: A4 portrait;
  margin: 10mm;
}
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden;
}
header, footer, nav, .no-print, button, .modal-backdrop, .print-footer {
  display: none !important;
}
.printable-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  page-break-inside: avoid;
  page-break-after: avoid;
  break-inside: avoid;
  break-after: avoid;
}
.printable-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 0 auto;
  display: block;
  image-rendering: -webkit-optimize-contrast;
}`

export function printDocumentHtml(title: string, imgUrl: string, autoPrint = true) {
  const safeTitle = escapeHtml(title || 'DOOLIA Printable')
  const safeUrl = escapeHtml(imgUrl)
  const onload = autoPrint ? ' onload="window.focus(); window.print();"' : ''
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>${PRINT_DOCUMENT_STYLES}</style>
  </head>
  <body>
    <div class="printable-area">
      <img class="printable-image" src="${safeUrl}" alt="${safeTitle}"${onload} />
    </div>
  </body>
</html>`
}

export function isMobilePrintHost() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOS =
    /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const android = /Android/i.test(ua)
  const coarse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  return iOS || android || coarse
}

export function prefetchPrintImage(url: string) {
  if (!url || typeof Image === 'undefined') return
  const img = new Image()
  img.src = url
}

function safePrintUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return parsed.href
  } catch {
    return ''
  }
}

function printThroughIframe(title: string, imgUrl: string) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('title', title)
  iframe.style.cssText =
    'position:fixed;left:0;top:0;width:1px;height:1px;margin:0;padding:0;border:0;opacity:0;pointer-events:none;'
  document.body.appendChild(iframe)
  const win = iframe.contentWindow
  const doc = iframe.contentDocument ?? win?.document
  if (!doc || !win) {
    iframe.remove()
    window.print()
    return
  }
  doc.open()
  doc.write(printDocumentHtml(title, imgUrl, false))
  doc.close()

  const img = doc.querySelector('img')
  const run = () => {
    win.focus()
    win.print()
  }
  if (img && !img.complete) {
    img.addEventListener('load', run, { once: true })
    img.addEventListener('error', run, { once: true })
  } else {
    run()
  }

  const cleanup = () => iframe.remove()
  win.addEventListener('afterprint', cleanup)
  window.setTimeout(cleanup, 60_000)
}

/** Call from a click handler so iOS keeps the user-gesture for print(). */
export function printPrintable(title: string, imgUrl: string) {
  const url = safePrintUrl(imgUrl)
  if (!url) return false
  prefetchPrintImage(url)
  if (isMobilePrintHost()) {
    printThroughIframe(title, url)
    return true
  }
  const popup = window.open('', '_blank')
  if (popup) {
    popup.document.open()
    popup.document.write(printDocumentHtml(title, url, true))
    popup.document.close()
    return true
  }
  printThroughIframe(title, url)
  return true
}
