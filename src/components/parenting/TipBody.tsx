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
        'tip-body tip-prose prose max-w-none',
        'prose-headings:font-semibold',
        'prose-h2:mt-0 prose-h2:mb-0 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-h4:text-lg',
        'prose-p:my-0',
        'prose-a:font-bold prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline',
        'prose-img:my-0 prose-img:block prose-img:rounded-2xl prose-img:shadow-sm',
        'prose-blockquote:border-emerald-300 prose-blockquote:bg-emerald-50/60 prose-blockquote:not-italic',
        'prose-table:overflow-hidden prose-th:bg-emerald-50',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
