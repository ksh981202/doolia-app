import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export type SubpageCrumb = {
  label: string
  to?: string
}

type SubpageHeaderProps = {
  crumbs: SubpageCrumb[]
  title: string
  emoji?: string
}

export function SubpageHeader({ crumbs, title, emoji }: SubpageHeaderProps) {
  return (
    <div className="mb-6 space-y-1.5">
      <nav
        className="flex flex-wrap items-center gap-1.5 overflow-hidden py-1.5 text-xs font-medium text-slate-500"
        aria-label="breadcrumb"
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <span className="shrink-0 text-slate-400">&gt;</span> : null}
              {isLast ? (
                <span className="min-w-0 max-w-[130px] truncate font-bold text-slate-800 sm:max-w-xs md:max-w-md">
                  {crumb.label}
                </span>
              ) : crumb.to ? (
                <Link
                  to={crumb.to}
                  className="min-w-0 max-w-[40vw] truncate transition-colors hover:text-emerald-600 sm:max-w-none"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="min-w-0 truncate">{crumb.label}</span>
              )}
            </Fragment>
          )
        })}
      </nav>
      <h1 className="flex min-w-0 flex-wrap items-center gap-2 text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl lg:text-3xl">
        {emoji ? <span className="shrink-0">{emoji}</span> : null}
        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{title}</span>
      </h1>
    </div>
  )
}
