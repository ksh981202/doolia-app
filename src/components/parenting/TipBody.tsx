import { useMemo } from 'react'
import { cn } from '@/shared/lib/cn'
import { renderTipHtml } from '@/shared/lib/tipBody'

type TipBodyProps = {
  source: string
  className?: string
}

export function TipBody({ source, className }: TipBodyProps) {
  const html = useMemo(() => renderTipHtml(source), [source])

  return (
    <div
      className={cn(
        'tip-prose prose prose-emerald prose-lg max-w-none text-slate-700',
        'prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink',
        'prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg',
        'prose-p:leading-relaxed prose-li:leading-relaxed',
        'prose-a:font-bold prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-2xl prose-img:shadow-sm',
        'prose-blockquote:border-emerald-300 prose-blockquote:bg-emerald-50/60 prose-blockquote:not-italic',
        'prose-table:overflow-hidden prose-th:bg-emerald-50 prose-th:text-ink',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
