import { Link } from 'react-router-dom'

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={() => {
        onNavigate?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="group flex shrink-0 items-center py-1"
    >
      <img
        src="/doolia-logo.png"
        alt="DOOLIA"
        className="h-8.5 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9.5 md:h-10"
        onError={(e) => {
          console.error('Logo load failed:', e)
        }}
      />
    </Link>
  )
}
