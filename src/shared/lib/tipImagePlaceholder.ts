export const BODY_IMAGE_STYLE =
  'width: 100%; max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0; display: block;'

export function bodyImageTag(url: string) {
  return `<img src="${url}" alt="" style="${BODY_IMAGE_STYLE}" />`
}

/** Block wrapper (div, not p) so TinyMCE cannot merge the image into a neighboring text paragraph. */
export function bodyImageBlock(url: string) {
  return `<div class="doolia-body-image">${bodyImageTag(url)}</div>`
}

function nodeHasOtherContent(parent: Element, keep: Node) {
  for (const child of Array.from(parent.childNodes)) {
    if (child === keep) continue
    if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim()) return true
    if (child.nodeType === Node.ELEMENT_NODE) return true
  }
  return false
}

const CALLOUT_BACKGROUND =
  /#ecfdf5|#f0fdf4|#d1fae5|#a7f3d0|#dcfce7|#fefce8|#fffbeb|#eff6ff|#ecfeff|rgb\(\s*236\s*,\s*253\s*,\s*245|rgb\(\s*240\s*,\s*253\s*,\s*244|rgb\(\s*209\s*,\s*250\s*,\s*229/i

function styleBlob(el: Element) {
  const htmlEl = el as HTMLElement
  return `${el.getAttribute('style') ?? ''} ${el.getAttribute('class') ?? ''} ${htmlEl.style?.cssText ?? ''}`
}

/** Emerald / pastel story boxes (부모 사연 등). Not generic layout wrappers. */
export function isCalloutBox(el: Element | null): boolean {
  if (!el) return false
  if (el.tagName !== 'DIV' && el.tagName !== 'ASIDE' && el.tagName !== 'SECTION') return false
  if (el.classList.contains('doolia-body-image')) return false
  if (el.id === 'tinymce' || el.getAttribute('data-mce-root')) return false
  const blob = styleBlob(el)
  if (CALLOUT_BACKGROUND.test(blob)) return true
  if (/\btip-parent-summary\b|\bdoolia-callout\b|\bdoolia-story\b/i.test(el.className)) return true
  if (typeof getComputedStyle === 'function' && el instanceof HTMLElement && el.ownerDocument?.defaultView) {
    try {
      const bg = el.ownerDocument.defaultView.getComputedStyle(el).backgroundColor
      if (CALLOUT_BACKGROUND.test(bg)) return true
    } catch {
      /* iframe teardown */
    }
  }
  return false
}

export function closestOutermostCallout(node: Element | null, root?: Element | null) {
  let current = node
  let found: HTMLElement | null = null
  while (current && current !== root) {
    if (isCalloutBox(current) && current instanceof HTMLElement) found = current
    current = current.parentElement
  }
  return found
}

function normalizeCalloutBox(el: HTMLElement) {
  el.style.setProperty('position', 'static', 'important')
  el.style.setProperty('overflow', 'visible', 'important')
  el.style.setProperty('height', 'auto', 'important')
  el.style.setProperty('max-height', 'none', 'important')
}

function pruneEmptyDivs(box: HTMLElement) {
  const nested = Array.from(box.querySelectorAll('div'))
  for (const node of nested.reverse()) {
    if (node.classList.contains('doolia-body-image')) continue
    if (isCalloutBox(node)) continue
    if (!(node.textContent ?? '').trim() && node.querySelectorAll('img').length === 0) {
      node.remove()
      continue
    }
    if (!node.getAttribute('style') && !node.className) {
      const parent = node.parentNode
      if (!parent) continue
      while (node.firstChild) parent.insertBefore(node.firstChild, node)
      node.remove()
    }
  }
}

function wrapAsBodyImage(doc: Document, target: Element) {
  if (target.parentElement?.classList.contains('doolia-body-image')) {
    return target.parentElement
  }
  const wrap = doc.createElement('div')
  wrap.className = 'doolia-body-image'
  target.parentNode?.insertBefore(wrap, target)
  wrap.appendChild(target)
  return wrap
}

const SPACER_HEIGHT = /(?:^|;)\s*height\s*:\s*(\d+(?:\.\d+)?)px/i

function isFixedHeightSpacer(el: Element | null): boolean {
  if (!el || el.tagName !== 'DIV') return false
  if (el.classList.contains('doolia-body-image')) return false
  const style = `${el.getAttribute('style') ?? ''};${(el as HTMLElement).style?.cssText ?? ''}`
  const match = style.match(SPACER_HEIGHT)
  if (!match) return false
  const px = Number(match[1])
  return px > 0 && px <= 80
}

function extractImagesFromSpacerDivs(root: HTMLElement) {
  for (const img of Array.from(root.querySelectorAll('img'))) {
    if (img.nodeName !== 'IMG') continue
    if (img.closest('button, table')) continue
    const target =
      img.parentElement?.tagName === 'A' || img.parentElement?.tagName === 'FIGURE' ? img.parentElement : img
    let block = (img.closest('.doolia-body-image') as HTMLElement | null) ?? wrapAsBodyImage(root.ownerDocument, target)
    let host = block.parentElement
    while (host && host !== root && isFixedHeightSpacer(host)) {
      const spacer = host
      const parent = spacer.parentNode
      if (!parent) break
      parent.insertBefore(block, spacer.nextSibling)
      const leftover = (spacer.textContent ?? '').replace(/\u00a0/g, ' ').trim()
      if (!leftover && spacer.querySelectorAll('img').length === 0) spacer.remove()
      host = block.parentElement
    }
  }
}

function extractImagesFromCalloutBoxes(root: HTMLElement) {
  const byBox = new Map<HTMLElement, HTMLElement[]>()
  for (const img of Array.from(root.querySelectorAll('img'))) {
    if (img.nodeName !== 'IMG') continue
    if (img.closest('button, table')) continue
    const box = closestOutermostCallout(img, root)
    if (!box) continue
    const target =
      img.parentElement?.tagName === 'A' || img.parentElement?.tagName === 'FIGURE' ? img.parentElement : img
    const block = (img.closest('.doolia-body-image') as HTMLElement | null) ?? wrapAsBodyImage(root.ownerDocument, target)
    if (!box.contains(block)) continue
    const list = byBox.get(box) ?? []
    if (!list.includes(block)) list.push(block)
    byBox.set(box, list)
  }
  for (const [box, blocks] of byBox) {
    let anchor: Node = box
    const host = box.parentNode
    if (!host) continue
    for (const block of blocks) {
      host.insertBefore(block, anchor.nextSibling)
      anchor = block
    }
    pruneEmptyDivs(box)
    normalizeCalloutBox(box)
    if (!(box.textContent ?? '').trim() && box.querySelectorAll('img').length === 0) {
      box.remove()
    }
  }
}

/**
 * Wrap every body image in `<div class="doolia-body-image">` and hoist that block
 * out of paragraphs / headings / quotes / story callout boxes.
 */
export function wrapImagesInRoot(root: HTMLElement) {
  const doc = root.ownerDocument
  const images = Array.from(root.querySelectorAll('img'))
  for (const img of images) {
    if (img.nodeName !== 'IMG') continue
    if (img.closest('.doolia-body-image')) continue
    if (img.closest('button')) continue

    let target: Element = img
    const immediate = img.parentElement
    if (
      immediate &&
      immediate !== root &&
      (immediate.tagName === 'A' || immediate.tagName === 'FIGURE') &&
      immediate.querySelectorAll('img').length === 1
    ) {
      target = immediate
    }

    const wrap = wrapAsBodyImage(doc, target)
    hoistImageBlock(wrap, root)
  }
  extractImagesFromSpacerDivs(root)
  extractImagesFromCalloutBoxes(root)
}

const SPLIT_HOST = /^(P|H1|H2|H3|H4|H5|H6|LI|SPAN|STRONG|EM|B|I|LABEL|FONT|BLOCKQUOTE)$/

function hoistImageBlock(wrap: HTMLElement, root: HTMLElement) {
  let host = wrap.parentElement
  while (host && host !== root && SPLIT_HOST.test(host.tagName)) {
    if (host.classList.contains('doolia-body-image')) break
    if (!nodeHasOtherContent(host, wrap)) {
      host.parentNode?.insertBefore(wrap, host)
      host.remove()
      host = wrap.parentElement
      continue
    }
    const parent = host.parentNode
    if (!parent) break
    const after = host.cloneNode(false) as HTMLElement
    let sibling = wrap.nextSibling
    while (sibling) {
      const next = sibling.nextSibling
      after.appendChild(sibling)
      sibling = next
    }
    parent.insertBefore(wrap, host.nextSibling)
    if (after.childNodes.length > 0) parent.insertBefore(after, wrap.nextSibling)
    if (!host.textContent?.trim() && host.childElementCount === 0) host.remove()
    host = wrap.parentElement
  }
}

/** Normalize pasted / loaded HTML so the first image matches later library inserts. */
export function ensureBodyImageBlocks(html: string) {
  const raw = html ?? ''
  if (!raw.includes('<img')) return raw
  const doc = new DOMParser().parseFromString(`<div id="doolia-root">${raw}</div>`, 'text/html')
  const parsedRoot = doc.getElementById('doolia-root')
  if (!parsedRoot) return raw
  wrapImagesInRoot(parsedRoot)
  return parsedRoot.innerHTML
}
