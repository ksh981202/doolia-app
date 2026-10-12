import type { Printable } from '@/types/printable'

const CGI_PREFIX = '/cdn-cgi/image/'
const DEFAULT_DISPLAY_WIDTH = 1000
const DISPLAY_QUALITY = 80
const DEFAULT_IMAGE_CDN_ORIGIN = 'https://cdn.doolia.app'

function isR2ObjectHost(hostname: string) {
  return hostname.endsWith('.r2.dev') || hostname.endsWith('.r2.cloudflarestorage.com')
}

function imageCdnOrigin() {
  const configured =
    import.meta.env.VITE_IMAGE_CDN_ORIGIN?.trim() ||
    import.meta.env.VITE_CDN_URL?.trim() ||
    DEFAULT_IMAGE_CDN_ORIGIN
  try {
    const url = new URL(configured)
    if (url.protocol === 'https:') return url.origin
  } catch {
    return DEFAULT_IMAGE_CDN_ORIGIN
  }
  return DEFAULT_IMAGE_CDN_ORIGIN
}

function isConfiguredR2PublicHost(hostname: string) {
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL?.trim()
  if (base) {
    try {
      const configuredHost = new URL(base).hostname
      if (isR2ObjectHost(configuredHost)) return hostname === configuredHost
    } catch {
      /* ignore invalid env */
    }
  }
  return hostname === 'pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev'
}

function resizeOrigin() {
  const configured = import.meta.env.VITE_IMAGE_RESIZE_ORIGIN?.trim()
  if (!configured) return ''
  return configured.replace(/\/$/, '')
}

function configuredCdnHosts() {
  const hosts = new Set([
    'cdn.doolia.app',
    'cdn.doolia.com',
    'www.cdn.doolia.com',
    'files.doolia.com',
  ])
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL
  if (base) {
    try {
      const host = new URL(base).hostname
      if (!isR2ObjectHost(host)) hosts.add(host)
    } catch {
      /* ignore invalid env */
    }
  }
  try {
    hosts.add(new URL(imageCdnOrigin()).hostname)
  } catch {
    /* imageCdnOrigin returns a valid default origin */
  }
  const origin = resizeOrigin()
  if (origin) {
    try {
      hosts.add(new URL(origin).hostname)
    } catch {
      /* ignore invalid env */
    }
  }
  return hosts
}

function isResizableHost(hostname: string) {
  if (isR2ObjectHost(hostname)) return false
  return configuredCdnHosts().has(hostname)
}

function resizeOptions(width: number) {
  return `width=${Math.max(1, Math.round(width))},format=auto,quality=${DISPLAY_QUALITY}`
}

/** Screen preview URL (≈1000px). Keep the original for PDF / print. */
export function getDisplayImageUrl(url: string, width = DEFAULT_DISPLAY_WIDTH): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed || /^(data:|blob:)/i.test(trimmed)) return trimmed

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return trimmed
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return trimmed

  if (isR2ObjectHost(parsed.hostname) && isConfiguredR2PublicHost(parsed.hostname)) {
    const cdn = new URL(imageCdnOrigin())
    parsed.protocol = cdn.protocol
    parsed.hostname = cdn.hostname
    parsed.port = cdn.port
  }

  const options = resizeOptions(width)
  const zone = resizeOrigin()
  if (zone && (isResizableHost(parsed.hostname) || isR2ObjectHost(parsed.hostname))) {
    return `${zone}${CGI_PREFIX}${options}/${parsed.toString()}`
  }

  if (parsed.hostname === new URL(imageCdnOrigin()).hostname) return parsed.toString()

  if (!isResizableHost(parsed.hostname)) return trimmed

  if (parsed.pathname.startsWith(CGI_PREFIX)) {
    const rest = parsed.pathname.slice(CGI_PREFIX.length).replace(/^[^/]+\//, '')
    parsed.pathname = `${CGI_PREFIX}${options}/${rest}`
    return parsed.toString()
  }

  parsed.pathname = `${CGI_PREFIX}${options}${parsed.pathname}`
  return parsed.toString()
}

export type PrintableViewMode = 'bw' | 'color'

export function printableLineArtUrl(printable: Printable) {
  return printable.image_bw_url || printable.line_art_url || printable.image_color_url || printable.color_image_url || ''
}

export function printableColorUrl(printable: Printable) {
  return printable.image_color_url || printable.color_image_url || printable.image_bw_url || printable.line_art_url || ''
}

export function printableViewUrl(printable: Printable, mode: PrintableViewMode) {
  return mode === 'color' ? printableColorUrl(printable) : printableLineArtUrl(printable)
}

export function difficultyLabel(difficulty?: Printable['difficulty']) {
  if (difficulty === 'easy') return '초급'
  if (difficulty === 'hard') return '고급'
  if (difficulty === 'normal') return '중급'
  return ''
}
