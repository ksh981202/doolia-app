import { Link } from 'react-router-dom'

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={() => {
        onNavigate?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="flex items-center focus:outline-hidden"
    >
      <img
        src="/doolia-logo.png"
        alt="DOOLIA"
        className="h-8 w-auto object-contain transition-opacity hover:opacity-95 sm:h-9"
      />
    </Link>
  )
}
