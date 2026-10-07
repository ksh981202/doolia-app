/**
 * Integrity check for 8 affiliate short-form videos + WebP posters.
 * Usage: npx tsx scripts/verify-affiliate-videos.ts
 */
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { AFFILIATE_ITEMS } from '../src/shared/config/affiliates.ts'

type Grade = 'PASS' | 'WARN' | 'FAIL'
type Check = { grade: Grade; title: string; detail: string }

const ROOT = resolve(process.cwd())
const DEV_ORIGIN = 'http://localhost:9999'
const EXPECTED = [
  { id: '01_crayons', image: '/affiliate/affiliate_01_crayons.webp', video: '/affiliate/affiliate_01_crayons.mp4' },
  { id: '02_colored_pencils', image: '/affiliate/affiliate_02_colored_pencils.webp', video: '/affiliate/affiliate_02_colored_pencils.mp4' },
  { id: '03_markers', image: '/affiliate/affiliate_03_markers.webp', video: '/affiliate/affiliate_03_markers.mp4' },
  { id: '04_water_brush', image: '/affiliate/affiliate_04_water_brush.webp', video: '/affiliate/affiliate_04_water_brush-silent.mp4' },
  { id: '05_art_smock', image: '/affiliate/affiliate_05_art_smock.webp', video: '/affiliate/affiliate_05_art_smock-silent.mp4' },
  { id: '06_craft_mat', image: '/affiliate/affiliate_06_craft_mat.webp', video: '/affiliate/affiliate_06_craft_mat-silent.mp4' },
  { id: '07_safety_scissors', image: '/affiliate/affiliate_07_safety_scissors.webp', video: '/affiliate/affiliate_07_safety_scissors-silent.mp4' },
  { id: '08_kids_art_set', image: '/affiliate/affiliate_08_kids_art_set.webp', video: '/affiliate/affiliate_08_kids_art_set-silent.mp4' },
] as const

const checks: Check[] = []

function add(grade: Grade, title: string, detail: string) {
  checks.push({ grade, title, detail })
}

function publicPath(urlPath: string) {
  return resolve(ROOT, 'public', urlPath.replace(/^\//, ''))
}

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function probe(urlPath: string) {
  try {
    const res = await fetch(`${DEV_ORIGIN}${urlPath}`, { method: 'HEAD' })
    const type = res.headers.get('content-type') || ''
    const length = Number(res.headers.get('content-length') || 0)
    return { ok: res.ok, status: res.status, type, length }
  } catch {
    return null
  }
}

function inspectDisk() {
  add(
    AFFILIATE_ITEMS.length === 8 ? 'PASS' : 'FAIL',
    `제휴 아이템 ${AFFILIATE_ITEMS.length}개`,
    '8종 숏폼 전수 매핑이 목표입니다.',
  )

  for (const expected of EXPECTED) {
    const item = AFFILIATE_ITEMS.find((entry) => entry.id === expected.id)
    if (!item) {
      add('FAIL', `${expected.id} 누락`, 'AFFILIATE_ITEMS에 해당 id가 없습니다.')
      continue
    }

    const videoOk = item.videoUrl === expected.video
    const imageOk = item.image === expected.image
    add(
      videoOk && imageOk ? 'PASS' : 'FAIL',
      `${item.id} URL 매핑`,
      `image=${item.image} videoUrl=${item.videoUrl}${videoOk && imageOk ? '' : ` (기대 image=${expected.image} video=${expected.video})`}`,
    )

    for (const [kind, url] of [
      ['poster', item.image],
      ['video', item.videoUrl],
    ] as const) {
      const file = publicPath(url)
      if (!existsSync(file)) {
        add('FAIL', `${item.id} ${kind} 파일 없음`, file)
        continue
      }
      const bytes = statSync(file).size
      add(
        bytes > 1024 ? 'PASS' : 'FAIL',
        `${item.id} ${kind} ${kb(bytes)}`,
        url,
      )
    }
  }
}

async function inspectHttp() {
  const live = await probe('/affiliate/affiliate_01_crayons.mp4')
  if (!live) {
    add('WARN', 'dev 서버 미기동', `${DEV_ORIGIN} HEAD 실패. 디스크 검사만 수행했습니다.`)
    return
  }

  for (const item of AFFILIATE_ITEMS) {
    const poster = await probe(item.image)
    const video = await probe(item.videoUrl)
    const posterOk = Boolean(poster?.ok && /image\//.test(poster.type || 'image/'))
    const videoOk = Boolean(video?.ok && (video.type.includes('video') || video.type.includes('octet-stream') || video.length > 10_000))
    add(
      posterOk ? 'PASS' : 'FAIL',
      `${item.id} poster HTTP ${poster?.status ?? 'n/a'}`,
      `${item.image} type=${poster?.type || '-'} length=${poster?.length ?? 0}`,
    )
    add(
      videoOk ? 'PASS' : 'FAIL',
      `${item.id} video HTTP ${video?.status ?? 'n/a'}`,
      `${item.videoUrl} type=${video?.type || '-'} length=${video?.length ?? 0}`,
    )
  }
}

inspectDisk()
await inspectHttp()

const counts = {
  FAIL: checks.filter((item) => item.grade === 'FAIL').length,
  WARN: checks.filter((item) => item.grade === 'WARN').length,
  PASS: checks.filter((item) => item.grade === 'PASS').length,
}

console.log('DOOLIA affiliate video integrity')
console.log(`summary: FAIL=${counts.FAIL}  WARN=${counts.WARN}  PASS=${counts.PASS}`)
console.log('')
for (const grade of ['FAIL', 'WARN', 'PASS'] as const) {
  const group = checks.filter((item) => item.grade === grade)
  if (!group.length) continue
  console.log(`=== ${grade} (${group.length}) ===`)
  for (const item of group) {
    console.log(`[${item.grade}] ${item.title}`)
    console.log(`    ${item.detail}`)
  }
  console.log('')
}

process.exitCode = counts.FAIL ? 1 : 0
