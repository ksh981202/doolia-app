/**
 * Normalize gl1~gl10 theme_en labels to official theme IDs.
 * Usage: npx tsx scripts/fix-theme-ids.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const TARGET_SLUGS = ['gl1', 'gl2', 'gl3', 'gl4', 'gl5', 'gl6', 'gl7', 'gl8', 'gl9', 'gl10'] as const
const OFFICIAL_IDS = [
  'animals',
  'dinosaur',
  'vehicles',
  'princess',
  'space-robot',
  'food',
  'sea-nature',
  'daily',
  'jobs',
  'sports',
  'seasons',
  'imagination',
] as const

const BY_THEME_KO: Record<string, (typeof OFFICIAL_IDS)[number]> = {
  '엉뚱발랄 상상나라': 'imagination',
  '귀여운 동물': 'animals',
  '공룡 세상': 'dinosaur',
  '자동차 & 탈것': 'vehicles',
  '공주 & 판타지': 'princess',
  '우주 & 로봇': 'space-robot',
  '과일 & 디저트': 'food',
  '바다 & 곤충': 'sea-nature',
  '우리 집 & 일상': 'daily',
  '멋진 직업과 꿈': 'jobs',
}

const BY_THEME_EN_LABEL: Record<string, (typeof OFFICIAL_IDS)[number]> = {
  'wacky imagination': 'imagination',
  'cute animals': 'animals',
  'dinosaur world': 'dinosaur',
  'cars & vehicles': 'vehicles',
  vehicles: 'vehicles',
  'princess & fantasy': 'princess',
  'space & robots': 'space-robot',
  'fruits & desserts': 'food',
  'sea & insects': 'sea-nature',
  'ocean & insects': 'sea-nature',
  'home & daily': 'daily',
  'jobs & dreams': 'jobs',
  'great jobs & dreams': 'jobs',
}

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

function resolveOfficialId(themeKo: string, themeEn: string) {
  const fromKo = BY_THEME_KO[themeKo.trim()]
  if (fromKo) return fromKo
  return BY_THEME_EN_LABEL[themeEn.trim().toLowerCase()]
}

async function main() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('VITE_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 또는 VITE_SUPABASE_ANON_KEY 가 필요합니다.')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('printables')
    .select('id, slug, theme_ko, theme_en')
    .in('slug', [...TARGET_SLUGS])

  if (error) {
    console.error('조회 실패:', error.message)
    process.exit(1)
  }

  const rows = data ?? []
  if (rows.length !== TARGET_SLUGS.length) {
    console.error(`대상 ${TARGET_SLUGS.length}건 중 ${rows.length}건만 조회되었습니다.`)
    process.exit(1)
  }

  let updated = 0
  let skipped = 0
  for (const row of rows) {
    const slug = String(row.slug)
    const current = String(row.theme_en || '')
    const next = resolveOfficialId(String(row.theme_ko || ''), current)
    if (!next) {
      console.error(`SKIP/FAIL ${slug}: theme_ko="${row.theme_ko}" theme_en="${row.theme_en}" 매핑 없음`)
      process.exit(1)
    }
    if (current === next) {
      console.log(`SKIP  ${slug.padEnd(5)}  이미 ${next}`)
      skipped += 1
      continue
    }
    const { error: updateError, data: changed } = await supabase
      .from('printables')
      .update({ theme_en: next })
      .eq('id', row.id)
      .eq('slug', slug)
      .select('slug, theme_ko, theme_en')
      .maybeSingle()
    if (updateError) {
      console.error(`UPDATE 실패 ${slug}:`, updateError.message)
      process.exit(1)
    }
    if (!changed) {
      console.error(`UPDATE 0행 ${slug} (RLS/권한을 확인하세요)`)
      process.exit(1)
    }
    console.log(`OK    ${slug.padEnd(5)}  "${current}" -> ${next}`)
    updated += 1
  }

  console.log(`완료: updated=${updated} skipped=${skipped}`)
}

void main()
