/**
 * Set long-lived Cache-Control on existing R2 printable objects.
 * Usage: npx tsx scripts/update-r2-cache-headers.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  PRINTABLE_CACHE_CONTROL,
  isR2Configured,
  listPrintableObjectKeys,
  updatePrintableCacheControl,
} from '../server/r2Media.ts'

function loadEnv() {
  for (const name of ['.env', '.env.local', '.env.development']) {
    try {
      for (const raw of readFileSync(resolve(process.cwd(), name), 'utf8').split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const cut = line.indexOf('=')
        if (cut < 1) continue
        const key = line.slice(0, cut).trim()
        let value = line.slice(cut + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!(key in process.env)) process.env[key] = value
      }
    } catch {
      /* optional */
    }
  }
}

async function main() {
  loadEnv()
  if (!isR2Configured(process.env)) {
    console.error('R2 환경 변수(R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL)가 필요합니다.')
    process.exit(1)
  }

  const keys = await listPrintableObjectKeys(process.env)
  console.log(`printables/ 객체 ${keys.length}개`)
  console.log(`목표 Cache-Control: ${PRINTABLE_CACHE_CONTROL}`)

  const result = await updatePrintableCacheControl(process.env, keys)
  console.log(`updated=${result.updated.length} skipped=${result.skipped.length} errors=${result.errors.length}`)
  for (const key of result.updated) console.log(`OK    ${key}`)
  for (const key of result.skipped) console.log(`SKIP  ${key}`)
  for (const line of result.errors) console.log(`FAIL  ${line}`)

  if (result.errors.length) process.exit(1)
}

void main()
