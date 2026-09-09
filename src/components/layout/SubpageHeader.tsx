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
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="breadcrumb">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <span>&gt;</span> : null}
              {isLast ? (
                <span className="font-bold text-slate-700">{crumb.label}</span>
              ) : crumb.to ? (
                <Link to={crumb.to} className="transition-colors hover:text-emerald-600">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </Fragment>
          )
        })}
      </nav>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
        {emoji ? <span>{emoji}</span> : null}
        <span>{title}</span>
      </h1>
    </div>
  )
}
