import { Link } from 'react-router-dom'

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={() => {
        onNavigate?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="group flex shrink-0 items-center py-1 focus:outline-hidden"
    >
      <img
        src="/doolia-logo.png"
        alt="DOOLIA"
        className="h-7 w-auto object-contain sm:h-9"
        onError={(e) => {
          console.error('Logo load failed:', e)
        }}
      />
    </Link>
  )
}
