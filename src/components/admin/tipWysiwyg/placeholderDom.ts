const SLOT_LABEL = /이미지\s*(\d+)\s*삽입\s*위치/

export function readPlaceholderSlotFromElement(element: Element) {
  const fromAttr = element.getAttribute('data-slot') || element.getAttribute('data-placeholder-slot')
  if (fromAttr) {
    const slot = Number(fromAttr)
    if (Number.isFinite(slot) && slot > 0) return slot
  }
  const match = (element.textContent ?? '').match(SLOT_LABEL)
  return match ? Number(match[1]) : 0
}

export function isPlaceholderBoxElement(element: Element) {
  if (!(element instanceof HTMLElement)) return false
  if (element.tagName === 'IMG' && element.getAttribute('data-slot')) return true
  if (element.getAttribute('data-type') === 'imagePlaceholder') return true
  if (element.getAttribute('data-placeholder-slot')) return true
  const text = element.textContent ?? ''
  if (SLOT_LABEL.test(text)) return true
  const style = element.getAttribute('style') ?? ''
  return /#6ee7b7/i.test(style) && /dashed/i.test(style) && /삽입/.test(text)
}

export function findEnclosingPlaceholder(start: Element | null): HTMLElement | null {
  let current: Element | null = start
  while (current) {
    if (isPlaceholderBoxElement(current) && current instanceof HTMLElement) return current
    current = current.parentElement
  }
  return null
}

export function findPlaceholderBySlot(root: ParentNode, slot: number): HTMLElement | null {
  const filled = root.querySelector(`img[data-slot="${slot}"]`)
  if (filled instanceof HTMLElement) return filled
  const nodes = root.querySelectorAll('div, p, section')
  for (const node of nodes) {
    if (isPlaceholderBoxElement(node) && readPlaceholderSlotFromElement(node) === slot && node instanceof HTMLElement) {
      return node
    }
  }
  return null
}
