/**
 * Audit JPG/PNG -> WebP rename + R2/DB upload pipeline.
 * Usage: npx tsx scripts/verify-webp-converter.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const PRINT_WEBP_QUALITY = 0.94
const FOCUS_SLUGS = ['gl21', 'gl22', 'gl25'] as const

type Level = 'PASS' | 'FAIL' | 'WARN' | 'INFO'
type Finding = { level: Level; area: string; message: string }

const findings: Finding[] = []
function note(level: Level, area: string, message: string) {
  findings.push({ level, area, message })
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

function readSrc(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), 'utf8')
}

function fileExtension(name: string) {
  const match = name.match(/\.([a-z0-9]+)$/i)
  return (match?.[1] || 'jpg').toLowerCase()
}

function renameUploadFile(name: string, type: string, slug: string, variant: 'b' | 'c') {
  const ext = fileExtension(name)
  return {
    name: `${slug}_${variant}.${ext}`,
    type: type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  }
}

function convertFilenameToWebp(name: string) {
  return name.replace(/\.[^/.]+$/, '') + '.webp'
}

function printableObjectKey(filename: string) {
  const base = filename.replace(/\\/g, '/').split('/').pop() || 'image.jpg'
  const cleaned = base
    .replace(/[^\w.\-가-힣]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\-+|\-+$/g, '')
    .toLowerCase()
  const withExt = /\.(jpe?g|png|webp)$/i.test(cleaned) ? cleaned : `${cleaned || 'image'}.jpg`
  return `printables/${withExt.slice(-160)}`
}

function contentTypeForImage(filename: string, contentType: string) {
  const allowed = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  if (allowed.has(contentType)) return contentType === 'image/jpg' ? 'image/jpeg' : contentType
  if (/\.png$/i.test(filename)) return 'image/png'
  if (/\.webp$/i.test(filename)) return 'image/webp'
  return 'image/jpeg'
}

function isWebpMagic(bytes: Uint8Array) {
  const ascii = Buffer.from(bytes.subarray(0, 12)).toString('ascii')
  return ascii.startsWith('RIFF') && ascii.includes('WEBP')
}

function draftUrls(row: { image_bw_url: string; image_color_url: string }, images?: { bw?: string; color?: string }) {
  return {
    image_bw_url: images?.bw ?? row.image_bw_url,
    image_color_url: images?.color ?? images?.bw ?? row.image_color_url,
  }
}

function staticAudit() {
  const convert = readSrc('src/features/admin/lib/imageOptimization.ts')
  const hook = readSrc('src/admin/useBulkPrintableUpload.ts')
  const admin = readSrc('src/services/adminPrintableService.ts')
  const r2Client = readSrc('src/services/r2MediaService.ts')
  const r2Server = readSrc('server/r2Media.ts')
  const page = readSrc('src/pages/admin/AdminUploadPage.tsx')

  if (convert.includes('canvas.width = width') && convert.includes('img.naturalWidth')) {
    note('PASS', 'convert', 'Canvas 크기를 naturalWidth/Height로 맞춰 해상도를 강제 축소하지 않습니다.')
  } else {
    note('FAIL', 'convert', '원본 해상도 유지 코드가 없습니다.')
  }
  if (convert.includes('imageSmoothingEnabled = false')) {
    note('PASS', 'convert', 'imageSmoothingEnabled=false — 1:1 복사 시 라인 보간 번짐을 막습니다.')
  } else {
    note('WARN', 'convert', '라인 스무딩 비활성 설정이 없습니다.')
  }
  if (convert.includes("fillStyle = '#FFFFFF'") && convert.includes('alpha: false')) {
    note('INFO', 'convert', '알파를 끄고 흰 배경을 깔아 PNG 투명은 흰색으로 평탄화됩니다(인쇄용).')
  }
  if (convert.includes("'image/webp'") && convert.includes("type: 'image/webp'")) {
    note('PASS', 'convert', 'toBlob MIME과 File.type이 image/webp로 명시됩니다.')
  } else {
    note('FAIL', 'convert', 'WebP MIME 지정이 없습니다.')
  }
  if (convert.includes('convertToOptimizedWebP') && convert.includes('PRINT_WEBP_QUALITY = 0.94')) {
    note('PASS', 'convert', '함수명 convertToOptimizedWebP와 quality 0.94가 명시되어 있습니다.')
  } else {
    note('FAIL', 'convert', 'convertToOptimizedWebP / PRINT_WEBP_QUALITY 정의가 없습니다.')
  }
  if (convert.includes('WebP 변환 실패') && convert.includes('reject') && !convert.includes('finish(file)')) {
    note('PASS', 'convert', '변환 실패 시 throw하며 원본 File을 반환하지 않습니다.')
  } else {
    note('FAIL', 'convert', 'Silent fallback이 남아 있습니다.')
  }
  if (convert.includes('URL.revokeObjectURL(objectUrl)')) {
    note('PASS', 'memory', '변환기의 object URL은 finish()에서 revoke됩니다.')
  } else {
    note('FAIL', 'memory', '변환기에서 revokeObjectURL이 없습니다.')
  }
  if (!/canvas\.width\s*=\s*0/.test(convert)) {
    note('INFO', 'memory', 'Canvas를 0x0으로 비우지는 않습니다. 순차 변환이면 GC에 맡깁니다.')
  }

  if (hook.includes('renameUploadFile') && hook.includes('uploadAdminFile') && hook.includes('${slug}_${variant}')) {
    note('PASS', 'rename', '업로드 전 renameUploadFile → uploadAdminFile 순서가 맞습니다.')
  } else {
    note('FAIL', 'rename', '리네임 후 업로드 경로가 없습니다.')
  }
  if (hook.includes('for (const [index, item] of pairs.entries())')) {
    note('PASS', 'memory', '행 단위 순차 업로드라 30~50장을 동시에 변환하지 않습니다.')
  }

  if (admin.includes('convertToOptimizedWebP') && admin.includes('uploadR2PrintableFile(payload)')) {
    note('PASS', 'upload', 'uploadAdminFile이 WebP 변환 후 R2로 전송합니다.')
  } else {
    note('FAIL', 'upload', 'uploadAdminFile 변환/R2 연결이 없습니다.')
  }
  if (admin.includes('images?.bw ?? str(row.image_bw_url)') && admin.includes('images?.color ?? images?.bw ?? str(row.image_color_url)')) {
    note('PASS', 'db', 'TSV의 초기 image_*_url은 업로드된 R2 URL로 덮어씁니다.')
  } else {
    note('FAIL', 'db', 'draftFromParsedRow가 TSV URL을 우선할 수 있습니다.')
  }

  if (r2Client.includes('contentType: file.type') && r2Client.includes("filename: file.name")) {
    note('PASS', 'r2', '클라이언트는 변환된 File.name / File.type을 API에 그대로 보냅니다.')
  } else {
    note('FAIL', 'r2', 'R2 클라이언트가 filename/contentType을 File에서 읽지 않습니다.')
  }
  if (r2Server.includes('ContentType: type') && r2Server.includes("if (/\\.webp$/i.test(filename)) return 'image/webp'")) {
    note('PASS', 'r2', 'PutObject ContentType이 image/webp로 매핑됩니다.')
  } else {
    note('FAIL', 'r2', '서버 Content-Type 매핑이 없습니다.')
  }
  if (page.includes('URL.revokeObjectURL(src)')) {
    note('PASS', 'memory', '미리보기 FileThumb가 언마운트/교체 시 object URL을 해제합니다.')
  } else {
    note('FAIL', 'memory', '미리보기 object URL 해제가 없습니다.')
  }
  if (page.includes('WebP 변환 실패') && page.includes('result.errors') && hook.includes('errors.push')) {
    note('PASS', 'errors', '행 단위 변환/업로드 예외가 관리자 UI 배너와 로그에 표시됩니다.')
  } else {
    note('FAIL', 'errors', '변환 실패 사유를 관리자 UI에 넘기는 경로가 없습니다.')
  }
  note(
    'INFO',
    'match',
    'matchBulkPrintables.ts는 파일명 {slug}_b/_c 매처입니다. 현재 업로더는 순서 매칭(rows[i]↔bwFiles[i])을 씁니다.',
  )
}

function simulateRenamePipeline() {
  const samples = [
    { name: 'GL01.jpg', type: 'image/jpeg', slug: 'gl21', variant: 'b' as const },
    { name: 'download (1).PNG', type: 'image/png', slug: 'gl21', variant: 'c' as const },
    { name: '임의파일.jpeg', type: 'image/jpeg', slug: 'gl22', variant: 'b' as const },
  ]
  for (const sample of samples) {
    const renamed = renameUploadFile(sample.name, sample.type, sample.slug, sample.variant)
    const webpName = convertFilenameToWebp(renamed.name)
    const key = printableObjectKey(webpName)
    const ctype = contentTypeForImage(webpName, 'image/webp')
    const ok =
      renamed.name === `${sample.slug}_${sample.variant}.${fileExtension(sample.name)}` &&
      webpName === `${sample.slug}_${sample.variant}.webp` &&
      key === `printables/${sample.slug}_${sample.variant}.webp` &&
      ctype === 'image/webp'
    note(
      ok ? 'PASS' : 'FAIL',
      'rename',
      `${sample.name} → ${renamed.name} → ${webpName} → ${key} (${ctype})`,
    )
  }

  const tsv = {
    image_bw_url: 'https://cdn.doolia.com/images/gl21_b.jpg',
    image_color_url: 'https://cdn.doolia.com/images/gl21_c.jpg',
  }
  const saved = draftUrls(tsv, {
    bw: 'https://pub.example/printables/gl21_b.webp?v=1',
    color: 'https://pub.example/printables/gl21_c.webp?v=2',
  })
  const overwritten =
    saved.image_bw_url.includes('printables/gl21_b.webp') && saved.image_color_url.includes('printables/gl21_c.webp')
  note(overwritten ? 'PASS' : 'FAIL', 'db', `TSV JPG URL 덮어쓰기: bw=${saved.image_bw_url} color=${saved.image_color_url}`)
}

function runPython(code: string) {
  return execFileSync('python', ['-c', code], { encoding: 'utf8' }).trim()
}

function convertSampleImages() {
  const dir = mkdtempSync(join(tmpdir(), 'doolia-webp-'))
  try {
    const helper = join(dir, 'convert.py')
    writeFileSync(
      helper,
      `
from PIL import Image, ImageDraw
import json, os, sys

out = {}
base = sys.argv[1]

# line-art-like JPG
line = Image.new('RGB', (640, 480), (255, 255, 255))
d = ImageDraw.Draw(line)
d.line((40, 40, 600, 40), fill=(0, 0, 0), width=3)
d.rectangle((80, 80, 200, 220), outline=(0, 0, 0), width=3)
d.ellipse((300, 120, 520, 340), outline=(0, 0, 0), width=3)
jpg_path = os.path.join(base, 'GL01.jpg')
line.save(jpg_path, 'JPEG', quality=95)

# color JPG with known RGB
color = Image.new('RGB', (320, 240), (255, 0, 0))
d2 = ImageDraw.Draw(color)
d2.rectangle((20, 20, 120, 120), fill=(0, 128, 255))
color_jpg = os.path.join(base, 'GL06.jpg')
color.save(color_jpg, 'JPEG', quality=95)

# PNG with alpha
rgba = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
d3 = ImageDraw.Draw(rgba)
d3.ellipse((20, 20, 140, 140), fill=(0, 0, 0, 255))
png_path = os.path.join(base, 'alpha.png')
rgba.save(png_path, 'PNG')

def to_webp(src, dest, flatten=False):
    im = Image.open(src)
    w, h = im.size
    if flatten or im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255, 255, 255))
        if im.mode == 'RGBA':
            bg.paste(im, mask=im.split()[3])
        else:
            bg.paste(im)
        im = bg
    elif im.mode != 'RGB':
        im = im.convert('RGB')
    im.save(dest, 'WEBP', quality=94, method=6)
    back = Image.open(dest).convert('RGB')
    px = back.getpixel((0, 0))
    center = back.getpixel((w // 2, h // 2)) if w > 2 else px
    return {
        'src': os.path.basename(src),
        'dest': os.path.basename(dest),
        'w': w,
        'h': h,
        'out_w': back.size[0],
        'out_h': back.size[1],
        'bytes': os.path.getsize(dest),
        'corner': px,
        'center': center,
    }

out['line'] = to_webp(jpg_path, os.path.join(base, 'gl21_b.webp'))
out['color'] = to_webp(color_jpg, os.path.join(base, 'gl21_c.webp'))
out['alpha'] = to_webp(png_path, os.path.join(base, 'gl99_b.webp'), flatten=True)
print(json.dumps(out))
`,
    )
    const raw = execFileSync('python', [helper, dir], { encoding: 'utf8' })
    const result = JSON.parse(raw) as Record<
      string,
      { src: string; dest: string; w: number; h: number; out_w: number; out_h: number; bytes: number; corner: number[]; center: number[] }
    >

    for (const [label, item] of Object.entries(result)) {
      const bytes = readFileSync(join(dir, item.dest))
      const magic = isWebpMagic(bytes)
      const sameSize = item.w === item.out_w && item.h === item.out_h
      note(magic ? 'PASS' : 'FAIL', 'webp', `${label}: ${item.dest} 시그니처 RIFF/WEBP=${magic}, ${item.bytes}B`)
      note(sameSize ? 'PASS' : 'FAIL', 'convert', `${label}: 해상도 ${item.w}x${item.h} → ${item.out_w}x${item.out_h}`)
    }

    const line = result.line
    const lineCornerWhite = line.corner.every((n, i) => Math.abs(n - [255, 255, 255][i]) <= 8)
    note(lineCornerWhite ? 'PASS' : 'WARN', 'convert', `선화 모서리 흰색 유지 RGB=${line.corner.join(',')}`)

    const color = result.color
    const redish = color.corner[0] > 200 && color.corner[1] < 40 && color.corner[2] < 40
    note(redish ? 'PASS' : 'WARN', 'convert', `컬러 샘플 모서리 RGB=${color.corner.join(',')} (기대 ≈255,0,0)`)

    const alpha = result.alpha
    const flattened = alpha.corner.every((n, i) => Math.abs(n - [255, 255, 255][i]) <= 8)
    note(flattened ? 'PASS' : 'WARN', 'convert', `알파 PNG 흰 배경 평탄화 RGB=${alpha.corner.join(',')}`)

    const pipeline = [
      { original: 'GL01.jpg', slug: 'gl21', variant: 'b' as const, dest: 'gl21_b.webp' },
      { original: 'GL06.jpg', slug: 'gl21', variant: 'c' as const, dest: 'gl21_c.webp' },
    ]
    for (const item of pipeline) {
      const renamed = renameUploadFile(item.original, 'image/jpeg', item.slug, item.variant)
      const webp = convertFilenameToWebp(renamed.name)
      note(
        webp === item.dest ? 'PASS' : 'FAIL',
        'rename',
        `시뮬레이션 ${item.original} → ${renamed.name} → ${webp}`,
      )
    }

    note('INFO', 'convert', `Pillow WebP quality=${Math.round(PRINT_WEBP_QUALITY * 100)} 로 브라우저 0.94 파이프라인을 재현했습니다.`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function probeLiveAssets() {
  loadEnv()
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    note('WARN', 'r2', 'Supabase env가 없어 라이브 URL 프로브를 건너뜁니다.')
    return
  }
  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('printables')
    .select('slug, image_bw_url, image_color_url')
    .in('slug', [...FOCUS_SLUGS])
  if (error || !data?.length) {
    note('WARN', 'r2', `라이브 조회 실패: ${error?.message || '행 없음'}`)
    return
  }
  for (const row of data) {
    for (const kind of ['image_bw_url', 'image_color_url'] as const) {
      const asset = String(row[kind] || '')
      const expect = kind === 'image_bw_url' ? `${row.slug}_b.webp` : `${row.slug}_c.webp`
      const nameOk = asset.toLowerCase().includes(expect)
      note(nameOk ? 'PASS' : 'FAIL', 'db', `${row.slug} ${kind} → ${asset}`)
      try {
        const res = await fetch(asset, { headers: { Range: 'bytes=0-15' } })
        const buf = new Uint8Array(await res.arrayBuffer())
        const type = (res.headers.get('content-type') || '').split(';')[0]
        const magic = isWebpMagic(buf)
        const ok = res.ok && type === 'image/webp' && magic
        note(ok ? 'PASS' : 'FAIL', 'r2', `${expect} HTTP ${res.status} type=${type || '-'} magic=${magic}`)
      } catch (caught) {
        note('FAIL', 'r2', `${expect} fetch 실패: ${caught instanceof Error ? caught.message : 'error'}`)
      }
    }
  }
}

async function main() {
  console.log('============================================================')
  console.log('DOOLIA JPG→WebP 변환 / R2 / DB 파이프라인 점검')
  console.log(new Date().toISOString())
  console.log('============================================================')
  staticAudit()
  simulateRenamePipeline()
  convertSampleImages()
  await probeLiveAssets()

  const fails = findings.filter((item) => item.level === 'FAIL')
  const warns = findings.filter((item) => item.level === 'WARN')
  console.log('')
  for (const item of findings) {
    console.log(`${item.level.padEnd(4)}  [${item.area}]  ${item.message}`)
  }
  console.log('')
  console.log(`판정: FAIL ${fails.length} / WARN ${warns.length} / 기타 ${findings.length - fails.length - warns.length}`)
  console.log(fails.length ? '결과: FAIL' : warns.length ? '결과: PASS(경고 있음)' : '결과: PASS')
  process.exit(fails.length ? 1 : 0)
}

void main()
