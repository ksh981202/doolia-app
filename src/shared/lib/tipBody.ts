import { marked } from 'marked'
import type { ParentingTip, ParentingTipBlock } from '@/data/parentingTipsData'
import { ensureBodyImageBlocks } from '@/shared/lib/tipImagePlaceholder'

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function blocksToMarkdown(blocks: ParentingTipBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'h2') return `## ${block.text}`
      if (block.type === 'h3') return `### ${block.text}`
      if (block.type === 'ul') return block.items.map((line) => `- ${line}`).join('\n')
      return block.text
    })
    .join('\n\n')
}

export function tipBodySource(tip: ParentingTip & { bodyMarkdown?: string }): string {
  if (tip.bodyMarkdown?.trim()) return tip.bodyMarkdown
  return blocksToMarkdown(tip.blocks)
}

export function normalizeTakeawayText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join('\n')
  }
  if (typeof value !== 'string') return ''
  return value.replace(/<br\s*\/?>/gi, '\n').replace(/\r\n/g, '\n').trim()
}

export function takeawaysFromValue(value: unknown): string[] {
  return normalizeTakeawayText(value)
    .split('\n')
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

/** Strip executable vectors while keeping tags, tables, images, and inline CSS. */
export function sanitizeTipHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<h1(\b[^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
}

export function renderTipHtml(source: string): string {
  const html = marked.parse(source ?? '', { async: false }) as string
  return ensureBodyImageBlocks(sanitizeTipHtml(html))
}

function hasMarkdownBlocks(source: string) {
  return /^(#{1,6}\s|[-*]\s|\d+\.\s)/m.test(source)
}

/** Convert saved markdown/HTML into HTML the visual editor can show. */
export function sourceToEditorHtml(source: string): string {
  const raw = source ?? ''
  if (!raw.trim()) return ''
  const html = hasMarkdownBlocks(raw) ? renderTipHtml(raw) : sanitizeTipHtml(raw)
  return ensureBodyImageBlocks(html)
}
