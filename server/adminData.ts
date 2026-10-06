import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireAdminAuth, sendAdminJson } from './adminAuth.ts'

export const ADMIN_DATA_ROUTE = '/api/admin/data'

const TABLES = ['printables', 'parenting_tips', 'copyright_reports'] as const
type AdminTable = (typeof TABLES)[number]
type AdminAction = 'list' | 'select' | 'upsert' | 'update' | 'delete'

const TABLE_ACTIONS: Record<AdminTable, readonly AdminAction[]> = {
  printables: ['list', 'select', 'upsert', 'update', 'delete'],
  parenting_tips: ['list', 'select', 'upsert', 'update', 'delete'],
  copyright_reports: ['list', 'select', 'update'],
}

function envString(env: NodeJS.Dict<string>, key: string) {
  return env[key]?.trim() || ''
}

function isTable(value: unknown): value is AdminTable {
  return TABLES.includes(value as AdminTable)
}

function isAction(value: unknown): value is AdminAction {
  return value === 'list' || value === 'select' || value === 'upsert' || value === 'update' || value === 'delete'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function safeIdent(value: unknown) {
  const name = String(value ?? '')
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return ''
  return name
}

function asStringMap(value: unknown) {
  if (!isPlainObject(value)) return {}
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(value)) {
    const column = safeIdent(key)
    if (!column) continue
    out[column] = String(item ?? '')
  }
  return out
}

async function readJsonBody(req: IncomingMessage, maxBytes = 1024 * 1024) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buf.length
    if (size > maxBytes) throw new Error('요청이 너무 큽니다.')
    chunks.push(buf)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return {}
  return JSON.parse(raw) as Record<string, unknown>
}

function adminSupabase(env: NodeJS.Dict<string>): SupabaseClient {
  const url = envString(env, 'SUPABASE_URL') || envString(env, 'VITE_SUPABASE_URL')
  const key = envString(env, 'SUPABASE_SERVICE_ROLE_KEY') || envString(env, 'SUPABASE_SERVICE_KEY')
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 가 서버에 없습니다.')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function applyEq(query: LooseQuery, eq: Record<string, string>) {
  return Object.entries(eq).reduce((current, [column, value]) => current.eq(column, value), query)
}

type LooseQuery = {
  eq: (column: string, value: string) => LooseQuery
  in: (column: string, values: string[]) => LooseQuery
  order: (column: string, options: { ascending: boolean }) => LooseQuery
  range: (from: number, to: number) => LooseQuery
  then: (
    onfulfilled?: (value: { data: unknown[] | null; error: { message: string } | null }) => unknown,
  ) => Promise<{ data: unknown[] | null; error: { message: string } | null }>
}

export async function handleAdminDataRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: NodeJS.Dict<string>,
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (!requireAdminAuth(req, res, env)) return

  if (req.method !== 'POST') {
    sendAdminJson(res, 405, { error: '허용되지 않은 요청입니다.' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = await readJsonBody(req)
  } catch {
    sendAdminJson(res, 400, { error: '잘못된 요청입니다.' })
    return
  }

  const table = body.table
  const action = body.action
  if (!isTable(table) || !isAction(action) || !TABLE_ACTIONS[table].includes(action)) {
    sendAdminJson(res, 400, { error: '허용되지 않은 관리자 DB 작업입니다.' })
    return
  }

  let client: SupabaseClient
  try {
    client = adminSupabase(env)
  } catch (error) {
    sendAdminJson(res, 503, { error: error instanceof Error ? error.message : '관리자 DB가 설정되지 않았습니다.' })
    return
  }

  try {
    if (action === 'list' || action === 'select') {
      const columns = Array.isArray(body.columns)
        ? body.columns.map((item) => safeIdent(item)).filter(Boolean).join(', ')
        : '*'
      let query = client.from(table).select(columns || '*') as unknown as LooseQuery
      query = applyEq(query, asStringMap(body.eq))
      const inFilter = isPlainObject(body.in) ? body.in : null
      const inColumn = inFilter ? safeIdent(inFilter.column) : ''
      const inValues = inFilter && Array.isArray(inFilter.values) ? inFilter.values.map((item) => String(item ?? '')) : []
      if (inColumn && inValues.length) query = query.in(inColumn, inValues)
      if (action === 'list') query = query.order('created_at', { ascending: false }).range(0, 999)
      const { data, error } = await query
      if (error) throw error
      sendAdminJson(res, 200, { ok: true, rows: data ?? [] })
      return
    }

    if (action === 'upsert') {
      if (table === 'copyright_reports' || !isPlainObject(body.row)) {
        sendAdminJson(res, 400, { error: '허용되지 않은 관리자 DB 작업입니다.' })
        return
      }
      const { error } = await client.from(table).upsert(body.row)
      if (error) throw error
      sendAdminJson(res, 200, { ok: true })
      return
    }

    if (action === 'update') {
      const eq = asStringMap(body.eq)
      if (!isPlainObject(body.patch) || !Object.keys(eq).length) {
        sendAdminJson(res, 400, { error: '수정 대상이 없습니다.' })
        return
      }
      const { data, error } = await applyEq(
        client.from(table).update(body.patch).select('id') as unknown as LooseQuery,
        eq,
      )
      if (error) throw error
      sendAdminJson(res, 200, { ok: true, rows: data ?? [] })
      return
    }

    const eq = asStringMap(body.eq)
    const inFilter = isPlainObject(body.in) ? body.in : null
    const inColumn = inFilter ? safeIdent(inFilter.column) : ''
    const inValues = inFilter && Array.isArray(inFilter.values) ? inFilter.values.map((item) => String(item ?? '')) : []
    if (!Object.keys(eq).length && !(inColumn && inValues.length)) {
      sendAdminJson(res, 400, { error: '삭제 대상이 없습니다.' })
      return
    }
    let query = client.from(table).delete().select('id') as unknown as LooseQuery
    query = applyEq(query, eq)
    if (inColumn && inValues.length) query = query.in(inColumn, inValues)
    const { data, error } = await query
    if (error) throw error
    sendAdminJson(res, 200, { ok: true, rows: data ?? [] })
  } catch (error) {
    sendAdminJson(res, 400, {
      error: error instanceof Error ? error.message : '관리자 DB 요청에 실패했습니다.',
    })
  }
}
