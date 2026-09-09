import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/categories'
import { CATALOG_GROUPS, categoryPath } from '@/shared/config/catalog'

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold text-[#059669]">{BRAND.shortName}</p>
          <p className="mt-1 text-sm font-bold text-ink">{BRAND.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            아이들을 위한 고화질 무료 프린트 도안 & 학습지. Print, Play & Discover.
          </p>
          <p className="mt-4 text-xs leading-5 text-muted">
            제휴 마케팅 안내: 일부 링크는 제휴 마케팅이 포함될 수 있습니다.
          </p>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-muted">CATEGORIES</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold">
            {CATALOG_GROUPS.map((group) => (
              <Link
                key={group.id}
                to={categoryPath(group.children[0].id)}
                className="text-ink/80 hover:text-[#059669]"
              >
                {group.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-muted">LEGAL</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold">
            <Link to="/about" className="text-ink/80 hover:text-[#059669]">
              둘리아(DOOLIA) 소개
            </Link>
            <Link to="/privacy" className="text-ink/80 hover:text-[#059669]">
              개인정보처리방침
            </Link>
            <Link to="/terms" className="text-ink/80 hover:text-[#059669]">
              이용약관
            </Link>
            <Link to="/contact" className="text-ink/80 hover:text-[#059669]">
              문의하기
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          Copyright © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
