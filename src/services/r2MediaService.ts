export type R2MediaItem = {
  key: string
  url: string
  name: string
  lastModified: string
  local?: boolean
}

export type R2MediaLibrary = {
  connected: boolean
  mode: 'r2' | 'local'
  items: R2MediaItem[]
  message?: string
}

const LOCAL_KEY = 'doolia-r2-media-library'
const API = '/api/admin/r2-media'
const PRINTABLE_API = '/api/admin/r2-printables'
const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

function readLocal(): R2MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as R2MediaItem[]) : []
  } catch {
    return []
  }
}

function writeLocal(items: R2MediaItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items.slice(0, 80)))
}

function mergeItems(remote: R2MediaItem[], local: R2MediaItem[]) {
  const seen = new Set<string>()
  const merged: R2MediaItem[] = []
  for (const item of [...local, ...remote]) {
    if (!item.url || seen.has(item.url) || seen.has(item.key)) continue
    seen.add(item.url)
    seen.add(item.key)
    merged.push(item)
  }
  return merged
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}

export async function fetchR2MediaLibrary(): Promise<R2MediaLibrary> {
  const local = readLocal()
  try {
    const response = await fetch(API)
    if (!response.ok) throw new Error('R2 미디어 API 응답 오류')
    const data = (await response.json()) as R2MediaLibrary
    return {
      connected: Boolean(data.connected),
      mode: data.connected ? 'r2' : 'local',
      items: mergeItems(data.items ?? [], local),
      message: data.message,
    }
  } catch {
    return {
      connected: false,
      mode: 'local',
      items: local,
      message: '로컬 미리보기 모드입니다. R2에 연결되면 버킷 이미지가 함께 표시됩니다.',
    }
  }
}

export async function uploadR2MediaFile(file: File): Promise<R2MediaItem> {
  if (!ALLOWED.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    throw new Error('JPG, PNG, WEBP 파일만 올릴 수 있습니다.')
  }

  let allowLocalFallback = true
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'image/png',
        data: await fileToBase64(file),
      }),
    })
    const payload = (await response.json()) as { item?: R2MediaItem; error?: string; connected?: boolean }
    if (response.ok && payload.item?.url) {
      const item = { ...payload.item, local: false }
      writeLocal(mergeItems([item], readLocal()))
      return item
    }
    if (payload.connected) {
      allowLocalFallback = false
      throw new Error(payload.error || 'R2 업로드에 실패했습니다.')
    }
  } catch (error) {
    if (!allowLocalFallback) throw error
  }

  const item: R2MediaItem = {
    key: `local/${Date.now()}-${file.name}`,
    url: URL.createObjectURL(file),
    name: file.name,
    lastModified: new Date().toISOString(),
    local: true,
  }
  writeLocal(mergeItems([item], readLocal()))
  return item
}

export async function uploadR2PrintableFile(file: File): Promise<R2MediaItem> {
  if (!ALLOWED.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    throw new Error('JPG, PNG, WEBP 파일만 올릴 수 있습니다.')
  }

  try {
    const response = await fetch(PRINTABLE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'image/jpeg',
        data: await fileToBase64(file),
      }),
    })
    const payload = (await response.json()) as { item?: R2MediaItem; error?: string; connected?: boolean }
    if (response.ok && payload.item?.url) {
      return { ...payload.item, local: false }
    }
    const error = new Error(payload.error || 'R2 도안 업로드에 실패했습니다.') as Error & { connected?: boolean }
    error.connected = Boolean(payload.connected)
    throw error
  } catch (error) {
    if (error && typeof error === 'object' && 'connected' in error) throw error
    const wrapped = new Error('R2 도안 업로드 API에 연결하지 못했습니다.') as Error & { connected?: boolean }
    wrapped.connected = false
    throw wrapped
  }
}

function r2PrintableKeyFromValue(value: string) {
  const raw = value.trim()
  if (!raw || raw.startsWith('blob:') || raw.startsWith('data:')) return ''

  let path = raw
  try {
    if (/^https?:\/\//i.test(raw)) {
      path = decodeURIComponent(new URL(raw).pathname)
    } else if (raw.startsWith('/')) {
      path = decodeURIComponent(raw)
    }
  } catch {
    return ''
  }

  const relative = path.replace(/^\/+/, '')
  const marker = 'printables/'
  const index = relative.indexOf(marker)
  if (index < 0) return ''
  const key = relative.slice(index)
  const name = key.slice(marker.length)
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) return ''
  return key
}

export async function deleteR2PrintableFiles(keysOrUrls: string[]) {
  const keys = [...new Set(keysOrUrls.map(r2PrintableKeyFromValue).filter(Boolean))]
  if (!keys.length) return { connected: false, deleted: [] as string[] }

  const response = await fetch(PRINTABLE_API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys }),
  })
  const payload = (await response.json()) as { deleted?: string[]; error?: string; connected?: boolean }
  if (!response.ok) {
    throw new Error(payload.error || 'R2 도안 파일 삭제에 실패했습니다.')
  }
  return {
    connected: Boolean(payload.connected),
    deleted: payload.deleted ?? keys,
  }
}
