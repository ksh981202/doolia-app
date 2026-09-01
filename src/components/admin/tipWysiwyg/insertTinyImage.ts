import type { Editor } from 'tinymce'
import {
  BODY_IMAGE_STYLE,
  bodyImageBlock,
  closestOutermostCallout,
  wrapImagesInRoot,
} from '@/shared/lib/tipImagePlaceholder'
import {
  findEnclosingPlaceholder,
  findPlaceholderBySlot,
  readPlaceholderSlotFromElement,
} from './placeholderDom'

function imageAttributes(url: string, slot?: number) {
  return {
    src: url,
    alt: 'DOOLIA AI 이미지',
    style: BODY_IMAGE_STYLE,
    ...(slot ? { 'data-slot': String(slot) } : {}),
  }
}

function createImageBlock(editor: Editor, url: string, slot?: number) {
  const wrap = editor.dom.create('div', { class: 'doolia-body-image' })
  const image = editor.dom.create('img', imageAttributes(url, slot))
  wrap.appendChild(image)
  return wrap
}

function applyForcedImageLayout(img: HTMLImageElement) {
  img.style.setProperty('display', 'block', 'important')
  img.style.setProperty('float', 'none', 'important')
  img.style.setProperty('position', 'static', 'important')
  img.style.setProperty('max-width', '100%', 'important')
  img.style.setProperty('height', 'auto', 'important')
  img.style.setProperty('margin', '24px auto', 'important')
  img.style.setProperty('clear', 'both', 'important')
  img.style.setProperty('z-index', 'auto', 'important')
}

let isolatingImages = false

export function isolateImagesFromText(editor: Editor) {
  if (isolatingImages) return
  const body = editor.getBody()
  if (!body) return
  isolatingImages = true
  try {
    wrapImagesInRoot(body)
    for (const node of Array.from(body.querySelectorAll('img'))) {
      if (node.nodeName === 'IMG') applyForcedImageLayout(node as HTMLImageElement)
    }
  } finally {
    isolatingImages = false
  }
}

function applyImageToElement(editor: Editor, target: HTMLElement, url: string, slot?: number) {
  const resolvedSlot = slot ?? (readPlaceholderSlotFromElement(target) || undefined)
  if (target.tagName === 'IMG') {
    editor.dom.setAttribs(target, imageAttributes(url, resolvedSlot))
    isolateImagesFromText(editor)
    editor.selection.select(target)
    editor.selection.collapse(false)
    editor.nodeChanged()
    editor.dispatch('change')
    return true
  }
  const block = createImageBlock(editor, url, resolvedSlot)
  editor.dom.replace(block, target)
  const image = block.querySelector('img')
  if (image) editor.selection.select(image)
  editor.selection.collapse(false)
  editor.nodeChanged()
  editor.dispatch('change')
  return true
}

export function selectPlaceholderSlot(editor: Editor, slot: number) {
  const target = findPlaceholderBySlot(editor.getBody(), slot)
  if (!target) return false
  editor.focus()
  editor.selection.select(target)
  editor.nodeChanged()
  target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  return true
}

export function insertImageAtCaret(editor: Editor, url: string, slot?: number) {
  editor.focus()
  const body = editor.getBody()
  const selected = editor.selection.getNode()
  const around = findEnclosingPlaceholder(selected)
  const bySlot = slot != null ? findPlaceholderBySlot(body, slot) : null
  const target = around ?? bySlot
  if (target) {
    const ok = applyImageToElement(editor, target, url, slot)
    isolateImagesFromText(editor)
    return ok
  }
  const callout = closestOutermostCallout(selected, body)
  if (callout?.parentNode) {
    const block = createImageBlock(editor, url, slot)
    callout.parentNode.insertBefore(block, callout.nextSibling)
    isolateImagesFromText(editor)
    const image = block.querySelector('img')
    if (image) editor.selection.select(image)
    editor.selection.collapse(false)
    editor.nodeChanged()
    editor.dispatch('change')
    return true
  }
  editor.insertContent(bodyImageBlock(url, slot))
  isolateImagesFromText(editor)
  editor.dispatch('change')
  return true
}
