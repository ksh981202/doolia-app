import { marked } from 'marked'
import type { ParentingTip, ParentingTipBlock } from '@/data/parentingTipsData'

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
}

export function renderTipHtml(source: string): string {
  const html = marked.parse(source ?? '', { async: false }) as string
  return sanitizeTipHtml(html)
}
