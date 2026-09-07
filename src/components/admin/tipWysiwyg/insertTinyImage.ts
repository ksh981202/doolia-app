import type { Editor } from 'tinymce'
import { BODY_IMAGE_STYLE, bodyImageBlock, wrapImagesInRoot } from '@/shared/lib/tipImagePlaceholder'

export type CaretBookmark = ReturnType<Editor['selection']['getBookmark']>

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
let skipIsolate = false

export function isolateImagesFromText(editor: Editor) {
  if (skipIsolate || isolatingImages) return
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

export function captureCaretBookmark(editor: Editor): CaretBookmark {
  editor.focus()
  return editor.selection.getBookmark(2, true)
}

export function insertImageAtCaret(editor: Editor, url: string, bookmark?: CaretBookmark | null) {
  editor.focus()
  if (bookmark) {
    try {
      editor.selection.moveToBookmark(bookmark)
    } catch {
      /* async picker/modal already cleared the native selection */
    }
  }

  skipIsolate = true
  try {
    editor.insertContent(bodyImageBlock(url))
    const inserted = editor.selection.getNode()
    const wrap = inserted.closest('.doolia-body-image')
    const image = wrap?.querySelector('img') ?? (inserted.tagName === 'IMG' ? inserted : null)
    if (image instanceof HTMLImageElement) {
      applyForcedImageLayout(image)
      image.setAttribute('style', BODY_IMAGE_STYLE)
      editor.selection.select(image)
      editor.selection.collapse(false)
    }
    editor.nodeChanged()
    editor.dispatch('change')
  } finally {
    queueMicrotask(() => {
      skipIsolate = false
    })
  }
  return true
}
