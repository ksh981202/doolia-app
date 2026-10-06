export type AdminTable = 'printables' | 'parenting_tips' | 'copyright_reports'

export type AdminDbRequest = {
  action: 'list' | 'select' | 'upsert' | 'update' | 'delete'
  table: AdminTable
  columns?: string[]
  eq?: Record<string, string>
  in?: { column: string; values: string[] }
  row?: Record<string, unknown>
  patch?: Record<string, unknown>
}

const API = '/api/admin/data'

export async function adminDb<T = Record<string, unknown>>(body: AdminDbRequest) {
  const response = await fetch(API, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as { error?: string; rows?: T[]; ok?: boolean }
  if (response.status === 401) throw new Error('관리자 로그인이 필요합니다.')
  if (!response.ok) throw new Error(payload.error || '관리자 DB 요청에 실패했습니다.')
  return payload
}
