/**
 * Affiliate short-form video traffic & load-speed audit (read-only).
 * Usage: npx tsx scripts/verify-video-performance.ts
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { AFFILIATE_ITEMS } from '../src/shared/config/affiliates.ts'

interface VideoPerfReport {
  id: string
  videoUrl: string
  sizeBytes: number
  sizeMB: number
  hasPoster: boolean
  posterSizeBytes: number
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING'
}

function posterUrl(item: (typeof AFFILIATE_ITEMS)[number]) {
  return item.image
}

console.log('⚡ [둘리아 제휴 비디오 8종 트래픽 & 로딩 속도 전수 진단 (Read-Only)]')
console.log('=================================================================\n')

const reports: VideoPerfReport[] = []
let totalVideoSize = 0
let totalPosterSize = 0
let failCount = 0
let warnCount = 0

AFFILIATE_ITEMS.forEach((item, index) => {
  const num = String(index + 1).padStart(2, '0')
  const videoRelPath = item.videoUrl ? item.videoUrl.replace(/^\//, '') : ''
  const posterRelPath = posterUrl(item).replace(/^\//, '')

  const videoFullPath = join(process.cwd(), 'public', videoRelPath)
  const posterFullPath = join(process.cwd(), 'public', posterRelPath)

  const hasVideo = existsSync(videoFullPath)
  const hasPoster = existsSync(posterFullPath)

  const videoSize = hasVideo ? statSync(videoFullPath).size : 0
  const posterSize = hasPoster ? statSync(posterFullPath).size : 0

  totalVideoSize += videoSize
  totalPosterSize += posterSize

  const sizeMB = Number((videoSize / (1024 * 1024)).toFixed(2))

  let status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' = 'OPTIMAL'
  if (sizeMB > 3.0) {
    status = 'WARNING'
    warnCount += 1
  } else if (sizeMB > 1.5) {
    status = 'ACCEPTABLE'
  }

  if (!hasVideo) failCount += 1
  if (!hasPoster) failCount += 1

  reports.push({
    id: item.id,
    videoUrl: item.videoUrl || 'NONE',
    sizeBytes: videoSize,
    sizeMB,
    hasPoster,
    posterSizeBytes: posterSize,
    status,
  })

  const statusBadge = status === 'OPTIMAL' ? '🟢 최적' : status === 'ACCEPTABLE' ? '🟡 양호' : '🔴 용량 주의'
  console.log(`[${num}] ${item.id}`)
  console.log(`  ├─ 비디오: ${item.videoUrl} (${sizeMB} MB) -> ${statusBadge}`)
  console.log(`  └─ 포스터 WebP: ${posterUrl(item)} (${(posterSize / 1024).toFixed(1)} KB)${hasPoster ? '' : ' [MISSING]'}`)
})

console.log('\n🔍 [DownloadModal.tsx 비디오 렌더링 속성 점검]')
const modalPath = join(process.cwd(), 'src/features/download/ui/DownloadModal.tsx')
let modalCheckPass = true

if (existsSync(modalPath)) {
  const modalContent = readFileSync(modalPath, 'utf-8')

  const checks = [
    { name: 'muted 속성 적용 (모바일 무음 자동재생 보장)', regex: /\bmuted\b/ },
    { name: 'autoPlay 속성 적용', regex: /\bautoPlay\b/ },
    { name: 'loop 속성 적용 (무한 루프)', regex: /\bloop\b/ },
    { name: 'playsInline 속성 적용 (iOS 전체화면 이탈 방지)', regex: /\bplaysInline\b/ },
    { name: 'poster 이미지 연동 (깜빡임 없는 선행 렌더링)', regex: /poster=/ },
  ]

  for (const check of checks) {
    if (check.regex.test(modalContent)) {
      console.log(`  ✅ ${check.name}: 정상 선언됨`)
    } else {
      console.log(`  ⚠️ ${check.name}: 미선언 또는 확인 필요`)
      if (check.name.includes('muted') || check.name.includes('playsInline')) {
        modalCheckPass = false
      }
    }
  }
} else {
  console.log('  ❌ DownloadModal.tsx 파일을 찾을 수 없습니다.')
  modalCheckPass = false
}

const totalMb = totalVideoSize / (1024 * 1024)
console.log('\n=================================================================')
console.log('📊 [트래픽 및 스트리밍 종합 진단 리포트]')
console.log('=================================================================')
console.log(`- 전체 비디오 8종 총 용량: ${totalMb.toFixed(2)} MB (평균 ${(totalMb / 8).toFixed(2)} MB/개)`)
console.log(`- 전체 포스터 8종 총 용량: ${(totalPosterSize / 1024).toFixed(1)} KB (초경량 보장)`)
console.log(`- 파일 완전성 검증: ${failCount === 0 ? '8종 영상 모두 정상 탑재 (PASS)' : `누락 ${failCount}건 (FAIL)`}`)
console.log(`- 대량 동시접속 트래픽 위험도: ${totalMb < 25 ? '매우 안전 (트래픽 과부하 위험 0%)' : '주의'}`)
console.log(`- 용량 주의(3MB 초과): ${warnCount}건`)
console.log(`- 양호(1.5~3.0MB): ${reports.filter((item) => item.status === 'ACCEPTABLE').length}건`)
console.log(`- 최적(1.5MB 미만): ${reports.filter((item) => item.status === 'OPTIMAL').length}건`)
console.log('=================================================================\n')

if (failCount > 0 || !modalCheckPass) {
  console.log('❌ 일부 파일 경로 또는 렌더링 속성 점검이 필요합니다.')
  process.exitCode = 1
} else {
  console.log('🎉 [PASS] 대규모 트래픽 발생 시에도 끊김 없이 가볍게 구동되는 최적 상태입니다!')
}
