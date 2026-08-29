import { Buffer } from 'node:buffer'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export type R2MediaItem = {
  key: string
  url: string
  name: string
  lastModified: string
}

export type R2MediaListResponse = {
  connected: boolean
  mode: 'r2' | 'local'
  items: R2MediaItem[]
  message?: string
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_BYTES = 12 * 1024 * 1024
const LIBRARY_PREFIX = 'tips/library/'

function envString(env: NodeJS.Dict<string>, key: string) {
  return env[key]?.trim() || ''
}

export function getR2PublicBase(env: NodeJS.Dict<string>) {
  return envString(env, 'R2_PUBLIC_BASE_URL') || envString(env, 'VITE_R2_PUBLIC_BASE_URL')
}

export function isR2Configured(env: NodeJS.Dict<string>) {
  return Boolean(
    envString(env, 'R2_ACCOUNT_ID') &&
      envString(env, 'R2_ACCESS_KEY_ID') &&
      envString(env, 'R2_SECRET_ACCESS_KEY') &&
      envString(env, 'R2_BUCKET_NAME') &&
      getR2PublicBase(env),
  )
}

function createR2Client(env: NodeJS.Dict<string>) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${envString(env, 'R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: envString(env, 'R2_ACCESS_KEY_ID'),
      secretAccessKey: envString(env, 'R2_SECRET_ACCESS_KEY'),
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}

export function publicObjectUrl(base: string, key: string) {
  const encoded = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${base.replace(/\/+$/, '')}/${encoded}`
}

function toItem(base: string, key: string, lastModified?: Date): R2MediaItem {
  const name = key.split('/').pop() || key
  return {
    key,
    url: publicObjectUrl(base, key),
    name,
    lastModified: (lastModified ?? new Date()).toISOString(),
  }
}

async function listImageObjects(env: NodeJS.Dict<string>): Promise<R2MediaItem[]> {
  const client = createR2Client(env)
  const bucket = envString(env, 'R2_BUCKET_NAME')
  const base = getR2PublicBase(env)
  const collected: Array<{ key: string; lastModified: Date }> = []
  let token: string | undefined

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
        MaxKeys: 1000,
      }),
    )
    for (const object of page.Contents ?? []) {
      const key = object.Key
      if (!key || key.endsWith('/') || !IMAGE_EXT.test(key)) continue
      collected.push({ key, lastModified: object.LastModified ?? new Date(0) })
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token && collected.length < 400)

  collected.sort((a, b) => {
    const aLib = a.key.startsWith(LIBRARY_PREFIX) ? 1 : 0
    const bLib = b.key.startsWith(LIBRARY_PREFIX) ? 1 : 0
    if (aLib !== bLib) return bLib - aLib
    return b.lastModified.getTime() - a.lastModified.getTime()
  })

  return collected.slice(0, 160).map((item) => toItem(base, item.key, item.lastModified))
}

function safeFilename(name: string) {
  const cleaned = name.replace(/[^\w.\-가-힣]+/g, '-').replace(/-+/g, '-').replace(/^\-+|\-+$/g, '')
  const withExt = IMAGE_EXT.test(cleaned) ? cleaned : `${cleaned || 'image'}.png`
  return withExt.slice(-120)
}

export async function listR2Media(env: NodeJS.Dict<string>): Promise<R2MediaListResponse> {
  if (!isR2Configured(env)) {
    return {
      connected: false,
      mode: 'local',
      items: [],
      message: 'R2 환경 변수가 없어 로컬 미리보기 모드로 동작합니다.',
    }
  }
  try {
    const items = await listImageObjects(env)
    return { connected: true, mode: 'r2', items }
  } catch (error) {
    return {
      connected: false,
      mode: 'local',
      items: [],
      message: error instanceof Error ? error.message : 'R2 목록을 불러오지 못했습니다.',
    }
  }
}

export async function uploadR2Media(
  env: NodeJS.Dict<string>,
  filename: string,
  contentType: string,
  bytes: Buffer,
): Promise<R2MediaItem> {
  if (!ALLOWED_TYPES.has(contentType) && !IMAGE_EXT.test(filename)) {
    throw new Error('JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.')
  }
  if (bytes.length > MAX_BYTES) {
    throw new Error('이미지는 12MB 이하만 업로드할 수 있습니다.')
  }
  if (!isR2Configured(env)) {
    throw new Error('R2가 설정되지 않았습니다.')
  }

  const key = `${LIBRARY_PREFIX}${Date.now()}-${safeFilename(filename)}`
  const type = ALLOWED_TYPES.has(contentType) ? contentType : 'image/png'
  const client = createR2Client(env)
  await client.send(
    new PutObjectCommand({
      Bucket: envString(env, 'R2_BUCKET_NAME'),
      Key: key,
      Body: bytes,
      ContentType: type,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
  return toItem(getR2PublicBase(env), key, new Date())
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buf.length
    if (size > MAX_BYTES * 1.4) throw new Error('업로드 용량이 너무 큽니다.')
    chunks.push(buf)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return {}
  return JSON.parse(raw) as Record<string, unknown>
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export async function handleR2MediaRequest(
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
    sendJson(res, 200, await listR2Media(env))
    return
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const filename = String(body.filename ?? 'image.png')
      const contentType = String(body.contentType ?? 'image/png')
      const data = String(body.data ?? '')
      if (!data) throw new Error('이미지 데이터가 없습니다.')
      const item = await uploadR2Media(env, filename, contentType, Buffer.from(data, 'base64'))
      sendJson(res, 200, { connected: true, mode: 'r2', item })
    } catch (error) {
      sendJson(res, 400, {
        connected: isR2Configured(env),
        mode: isR2Configured(env) ? 'r2' : 'local',
        error: error instanceof Error ? error.message : '업로드에 실패했습니다.',
      })
    }
    return
  }

  sendJson(res, 405, { error: '허용되지 않은 요청입니다.' })
}
