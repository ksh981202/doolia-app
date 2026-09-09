export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

/** Shared page shell so home, catalog, and chrome stay aligned. */
export const PAGE_SHELL = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
