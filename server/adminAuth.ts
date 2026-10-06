import { createHmac, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const ADMIN_COOKIE = 'doolia-admin'
export const ADMIN_SESSION_ROUTE = '/api/admin/session'

function envString(env: NodeJS.Dict<string>, key: string) {
  return env[key]?.trim() || ''
}

export function expectedAdminPinFromEnv(env: NodeJS.Dict<string>) {
  return envString(env, 'ADMIN_PIN') || envString(env, 'VITE_ADMIN_PIN') || 'doolia'
}

function signingSecret(env: NodeJS.Dict<string>) {
  return envString(env, 'ADMIN_API_SECRET') || `doolia-admin-hmac:${expectedAdminPinFromEnv(env)}`
}

export function adminSessionToken(env: NodeJS.Dict<string>) {
  return createHmac('sha256', signingSecret(env)).update('doolia-admin-session-v1').digest('hex')
}

function hashesEqual(left: string, right: string) {
  const a = createHmac('sha256', 'doolia-compare').update(left).digest()
  const b = createHmac('sha256', 'doolia-compare').update(right).digest()
  return timingSafeEqual(a, b)
}

function parseCookie(header: string | undefined, name: string) {
  if (!header) return ''
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const key = part.slice(0, index).trim()
    if (key !== name) continue
    try {
      return decodeURIComponent(part.slice(index + 1).trim())
    } catch {
      return part.slice(index + 1).trim()
    }
  }
  return ''
}

export function readAdminToken(req: IncomingMessage) {
  const authorization = String(req.headers.authorization || '')
  if (authorization.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim()
  const headerToken = String(req.headers['x-doolia-admin-token'] || '').trim()
  if (headerToken) return headerToken
  return parseCookie(req.headers.cookie, ADMIN_COOKIE)
}

export function isAdminAuthorized(req: IncomingMessage, env: NodeJS.Dict<string>) {
  const token = readAdminToken(req)
  return Boolean(token) && hashesEqual(token, adminSessionToken(env))
}

function cookieHeader(token: string, maxAgeSeconds: number) {
  const parts = [
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

export function sendAdminJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders?: Record<string, string>,
) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value)
  }
  res.end(JSON.stringify(payload))
}

export function rejectUnauthorized(res: ServerResponse) {
  sendAdminJson(res, 401, { error: 'Unauthorized' })
}

export function requireAdminAuth(req: IncomingMessage, res: ServerResponse, env: NodeJS.Dict<string>) {
  if (req.method === 'OPTIONS') return true
  if (isAdminAuthorized(req, env)) return true
  rejectUnauthorized(res)
  return false
}

async function readJsonBody(req: IncomingMessage, maxBytes = 8192) {
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

export async function handleAdminSessionRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: NodeJS.Dict<string>,
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === 'GET') {
    if (!isAdminAuthorized(req, env)) {
      rejectUnauthorized(res)
      return
    }
    sendAdminJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'DELETE') {
    sendAdminJson(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader('', 0) })
    return
  }

  if (req.method !== 'POST') {
    sendAdminJson(res, 405, { error: '허용되지 않은 요청입니다.' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const pin = String(body.pin ?? '').trim()
    if (!pin || pin.length > 120) {
      sendAdminJson(res, 401, { error: 'Unauthorized' })
      return
    }
    if (!hashesEqual(pin, expectedAdminPinFromEnv(env))) {
      sendAdminJson(res, 401, { error: 'Unauthorized' })
      return
    }
    sendAdminJson(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader(adminSessionToken(env), 60 * 60 * 12) })
  } catch {
    sendAdminJson(res, 400, { error: '잘못된 요청입니다.' })
  }
}
