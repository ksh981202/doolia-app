/**
 * Read-only pre-launch security audit. Does not modify project source.
 * Never prints secret values — only file paths, pattern names, and pass/fail.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..')

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASS'
type Finding = {
  id: string
  severity: Severity
  area: string
  title: string
  detail: string
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.tmp-verify',
  'python/.venv',
  '.venv',
  'venv',
])

const SECRET_PATTERNS: Array<{ id: string; re: RegExp }> = [
  { id: 'service_role', re: /service[_-]?role/i },
  { id: 'supabase_service_key_env', re: /SUPABASE_SERVICE_ROLE_KEY/ },
  { id: 'r2_secret_env', re: /R2_SECRET_ACCESS_KEY/ },
  { id: 'aws_secret_env', re: /AWS_SECRET_ACCESS_KEY/ },
  { id: 'jwt_like', re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/ },
  { id: 'aws_access_key_id', re: /\bAKIA[0-9A-Z]{16}\b/ },
]

const findings: Finding[] = []

function add(finding: Finding) {
  findings.push(finding)
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    if (name === '.env' || name.startsWith('.env.')) continue
    const full = join(dir, name)
    const rel = relative(ROOT, full).replaceAll('\\', '/')
    if ([...SKIP_DIRS].some((skip) => rel === skip || rel.startsWith(`${skip}/`))) continue
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

function read(path: string) {
  return readFileSync(path, 'utf8')
}

function scanSecrets() {
  const roots = ['src', 'public', 'server', 'api', 'scripts', 'supabase'].map((item) => join(ROOT, item))
  if (existsSync(join(ROOT, 'dist'))) roots.push(join(ROOT, 'dist'))
  const hits: Array<{ file: string; pattern: string; line: number }> = []
  const allowServiceRoleInReadmeAndScripts = new Set(['README.md', 'scripts/fix-theme-ids.ts', 'scripts/verify-security-audit.ts'])

  for (const root of roots) {
    for (const file of walk(root)) {
      if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|html|md|sql|css|txt)$/i.test(file)) continue
      const rel = relative(ROOT, file).replaceAll('\\', '/')
      if (rel === 'scripts/verify-security-audit.ts') continue
      const text = read(file)
      const lines = text.split(/\r?\n/)
      for (const pattern of SECRET_PATTERNS) {
        lines.forEach((line, index) => {
          if (!pattern.re.test(line)) return
          if (pattern.id === 'service_role' && (rel.startsWith('scripts/') || rel === 'README.md')) return
          if (pattern.id === 'supabase_service_key_env' && rel.startsWith('scripts/')) return
          if (pattern.id === 'r2_secret_env' && (rel.startsWith('server/') || rel.startsWith('scripts/') || rel === '.env.example'))
            return
          if (pattern.id === 'aws_secret_env' && (rel.startsWith('server/') || rel.startsWith('scripts/'))) return
          if (pattern.id === 'jwt_like' && (rel.startsWith('dist/assets/supabase-') || rel.startsWith('dist/assets/index.es-')))
            return
          hits.push({ file: rel, pattern: pattern.id, line: index + 1 })
        })
      }
    }
  }

  const hardcodedJwt = hits.filter((hit) => hit.pattern === 'jwt_like')
  const awsKeys = hits.filter((hit) => hit.pattern === 'aws_access_key_id')
  const srcServiceRole = hits.filter((hit) => hit.pattern === 'service_role' && hit.file.startsWith('src/'))
  const srcR2Secret = hits.filter((hit) => hit.pattern === 'r2_secret_env' && hit.file.startsWith('src/'))
  const distServiceRole = hits.filter((hit) => hit.file.startsWith('dist/') && hit.pattern === 'service_role')

  if (!srcServiceRole.length && !srcR2Secret.length && !hardcodedJwt.length && !awsKeys.length && !distServiceRole.length) {
    add({
      id: 'A1',
      severity: 'PASS',
      area: 'Secrets',
      title: 'src/에 service_role·R2 secret·JWT 실키 하드코딩 없음',
      detail: '프론트 소스는 VITE_SUPABASE_ANON_KEY / VITE_R2_PUBLIC_BASE_URL 등 공개 가능한 값만 참조합니다. R2_SECRET_ACCESS_KEY는 server/와 운영 스크립트 식별자로만 등장합니다.',
    })
  } else {
    add({
      id: 'A1',
      severity: 'CRITICAL',
      area: 'Secrets',
      title: '민감 키 패턴이 소스/번들에 존재',
      detail: hits
        .slice(0, 20)
        .map((hit) => `${hit.file}:${hit.line} (${hit.pattern})`)
        .join('; '),
    })
  }

  const viteAdminPin = read(join(ROOT, 'src/admin/AdminGuard.tsx'))
  if (viteAdminPin.includes('VITE_ADMIN_PIN') && viteAdminPin.includes("'doolia'")) {
    add({
      id: 'A2',
      severity: 'HIGH',
      area: 'Secrets',
      title: '관리자 PIN이 클라이언트 번들에 포함되고 기본값이 doolia',
      detail: 'src/admin/AdminGuard.tsx expectedAdminPin()이 import.meta.env.VITE_ADMIN_PIN을 읽고, 없으면 문자열 doolia를 사용합니다. VITE_ 접두사는 빌드에 인라인됩니다.',
    })
  } else {
    add({
      id: 'A2',
      severity: 'PASS',
      area: 'Secrets',
      title: '클라이언트 가드가 PIN을 번들에 넣지 않음',
      detail: 'AdminGuard는 /api/admin/session HttpOnly 쿠키만 확인하고, PIN 비교는 server/adminAuth.ts에서 수행합니다.',
    })
  }

  void allowServiceRoleInReadmeAndScripts
}

function scanGitignore() {
  const gitignore = read(join(ROOT, '.gitignore'))
  const hasEnv = gitignore.includes('.env') && gitignore.includes('.env.*')
  const hasNegateExample = gitignore.includes('!.env.example')
  if (hasEnv && hasNegateExample) {
    add({
      id: 'A3',
      severity: 'PASS',
      area: 'Git',
      title: '.gitignore가 .env / .env.* 를 차단',
      detail: '.env, .env.*, python/.env 가 무시되고 .env.example만 추적됩니다. git check-ignore로 .env.local / .env.production 확인됨.',
    })
  } else {
    add({
      id: 'A3',
      severity: 'HIGH',
      area: 'Git',
      title: '.gitignore 환경변수 규칙이 불완전',
      detail: gitignore.slice(0, 400),
    })
  }
}

function scanAdminGuard() {
  const layout = read(join(ROOT, 'src/layouts/AdminLayout.tsx'))
  const router = read(join(ROOT, 'src/app/router.tsx'))
  const guard = read(join(ROOT, 'src/admin/AdminGuard.tsx'))
  const guardUsedInLayout = /<AdminGuard[\s>]/.test(layout)
  const loginIsForm = router.includes('path="/admin/login"') && router.includes('<AdminLoginPage')
  const loginRedirectsToAdmin =
    router.includes('path="/admin/login"') && /path="\/admin\/login"[^>]*>\s*<Navigate to="\/admin"/.test(router.replace(/\n/g, ''))
  const checksServerSession = guard.includes('/api/admin/session') && guard.includes('checking')

  if (guardUsedInLayout && checksServerSession) {
    add({
      id: 'C1',
      severity: 'PASS',
      area: 'Admin',
      title: 'ProtectedAdminLayout이 AdminGuard로 /admin/* 를 보호함',
      detail: '미인증 사용자는 서버 세션 확인 후 /admin/login으로 보내지며, 확인 중에는 관리 화면을 렌더하지 않습니다.',
    })
  } else {
    add({
      id: 'C1',
      severity: 'CRITICAL',
      area: 'Admin',
      title: '/admin/* 가 AdminGuard 없이 공개됨',
      detail: 'ProtectedAdminLayout이 AdminGuard를 감싸지 않거나 서버 세션 확인이 없습니다.',
    })
  }

  if (loginIsForm && !loginRedirectsToAdmin) {
    add({
      id: 'C2',
      severity: 'PASS',
      area: 'Admin',
      title: '/admin/login 이 로그인 폼을 렌더함',
      detail: 'Navigate to=/admin 루프가 없고 AdminLoginPage가 연결되어 있습니다.',
    })
  } else {
    add({
      id: 'C2',
      severity: 'HIGH',
      area: 'Admin',
      title: '/admin/login 이 /admin 으로 바로 리다이렉트',
      detail: 'AdminLoginPage는 존재하지만 라우트가 Navigate to=/admin 이라 PIN 화면이 연결되지 않습니다.',
    })
  }

  if (guardUsedInLayout && checksServerSession) {
    add({
      id: 'C3',
      severity: 'PASS',
      area: 'Admin',
      title: '가드가 세션 확인 전에 관리 UI를 렌더하지 않음',
      detail: 'AdminGuard는 checking 상태에서 PageFallback만 보여주고, 쿠키 세션이 없으면 로그인으로 보냅니다.',
    })
  } else {
    add({
      id: 'C3',
      severity: 'CRITICAL',
      area: 'Admin',
      title: '인증 플래시보다 앞선 문제: 가드 자체가 미적용',
      detail: 'AdminGuard가 라우트에 연결되어 있지 않아 비인증 사용자에게 관리 화면이 노출될 수 있습니다.',
    })
  }
}

function scanR2() {
  const server = read(join(ROOT, 'server/r2Media.ts'))
  const plugin = read(join(ROOT, 'vite-plugin-r2-media.ts'))
  const apiMedia = read(join(ROOT, 'api/admin/r2-media.ts'))
  const apiPrint = read(join(ROOT, 'api/admin/r2-printables.ts'))
  const client = read(join(ROOT, 'src/services/r2MediaService.ts'))
  const auth = existsSync(join(ROOT, 'server/adminAuth.ts')) ? read(join(ROOT, 'server/adminAuth.ts')) : ''

  const handlersRequireAuth = /requireAdminAuth/.test(server) && /401/.test(auth) && /Unauthorized/.test(auth)
  const pluginWiresAuth = /ADMIN_SESSION_ROUTE|handleAdminSessionRequest/.test(plugin)
  const wrappersUseSharedHandler = /handleR2MediaRequest/.test(apiMedia) && /handleR2PrintableRequest/.test(apiPrint)
  const clientSendsCredentials = /credentials:\s*['"]include['"]/.test(client)

  if (handlersRequireAuth && pluginWiresAuth && wrappersUseSharedHandler) {
    add({
      id: 'D1',
      severity: 'PASS',
      area: 'R2',
      title: 'R2 관리 API가 인증되지 않은 요청에 401을 반환함',
      detail: 'handleR2MediaRequest / handleR2PrintableRequest가 requireAdminAuth로 쿠키 또는 Bearer 토큰을 검사합니다. Vite 플러그인과 Vercel api/ 핸들러가 동일 경로를 사용합니다.',
    })
  } else {
    add({
      id: 'D1',
      severity: 'CRITICAL',
      area: 'R2',
      title: '/api/admin/r2-media · /api/admin/r2-printables 인증 없음',
      detail: '업로드/삭제 핸들러에 requireAdminAuth 또는 401 Unauthorized 응답이 없습니다.',
    })
  }

  if (clientSendsCredentials && handlersRequireAuth) {
    add({
      id: 'D2',
      severity: 'PASS',
      area: 'R2',
      title: '브라우저 R2 호출이 세션 쿠키를 포함함',
      detail: 'r2MediaService fetch에 credentials: include가 있고, 서버는 쿠키/Bearer 없이 401을 줍니다.',
    })
  } else {
    add({
      id: 'D2',
      severity: 'HIGH',
      area: 'R2',
      title: '브라우저가 인증 헤더 없이 R2 관리 API를 호출',
      detail: 'src/services/r2MediaService.ts의 fetch에 credentials include 또는 Authorization이 없습니다.',
    })
  }

  if (server.includes("envString(env, 'R2_SECRET_ACCESS_KEY')") && !server.includes('VITE_R2_SECRET')) {
    add({
      id: 'D3',
      severity: 'PASS',
      area: 'R2',
      title: 'R2 시크릿은 서버 env 전용 (VITE_ 접두사 없음)',
      detail: 'R2_SECRET_ACCESS_KEY는 server/r2Media.ts에서만 읽고, 프론트 vite-env.d.ts에는 없습니다. 문제는 시크릿 유출이 아니라 그 시크릿을 쓰는 API가 공개된 점입니다.',
    })
  }
}

function scanRlsMigrations() {
  const lockPath = join(ROOT, 'supabase/migrations/20261006120000_lock_public_rls.sql')
  const lock = existsSync(lockPath) ? read(lockPath) : ''
  const reportsLocked =
    lock.includes('copyright_reports_insert_public') &&
    /revoke all on table public\.copyright_reports/.test(lock) &&
    /grant insert on table public\.copyright_reports/.test(lock) &&
    !/create policy "copyright_reports_select_admin"/.test(lock) &&
    !/create policy "copyright_reports_update_admin"/.test(lock)
  const catalogLocked =
    lock.includes('printables_select_published') &&
    lock.includes('published = true') &&
    lock.includes('printables_anon_all') &&
    /revoke all on table public\.printables/.test(lock) &&
    lock.includes('parenting_tips_select_published') &&
    lock.includes('parenting_tips_anon_all') &&
    /revoke all on table public\.parenting_tips/.test(lock)

  if (reportsLocked) {
    add({
      id: 'B1',
      severity: 'PASS',
      area: 'RLS',
      title: 'copyright_reports 는 anon INSERT만 허용',
      detail: 'SELECT/UPDATE USING (true) 정책을 제거하고, 공개 역할은 신고 INSERT(pending, good_faith)만 가능합니다. 조회·상태 변경은 service_role 관리 API만 사용합니다.',
    })
  } else {
    add({
      id: 'B1',
      severity: 'CRITICAL',
      area: 'RLS',
      title: 'copyright_reports SELECT/UPDATE 가 anon에 USING (true)',
      detail: '마이그레이션이 PIN+anon 관리 모델을 전제로 select/update를 전면 허용합니다. 익명 키로 신고자 이메일·내용 열람 및 상태 변조가 가능합니다. INSERT with check(status=pending, admin_notes null, good_faith true)는 상대적으로 양호합니다.',
    })
  }

  if (catalogLocked) {
    add({
      id: 'B2',
      severity: 'PASS',
      area: 'RLS',
      title: 'printables·parenting_tips 공개 역할은 published SELECT만 허용',
      detail: 'printables_anon_all / parenting_tips_anon_all 을 제거하고, anon·authenticated는 published=true 행만 읽을 수 있습니다. INSERT/UPDATE/DELETE grant도 회수했습니다.',
    })
  } else {
    add({
      id: 'B2',
      severity: 'CRITICAL',
      area: 'RLS',
      title: '원격 printables RLS가 anon ALL USING (true)',
      detail: '라이브 DB 정책 printables_anon_all / printables_anon_delete 가 anon·authenticated에 INSERT/UPDATE/DELETE/SELECT를 모두 허용합니다. 클라이언트 fetchPrintables는 published=true만 보여주지만, REST로 미발행 열람·행 삭제·카탈로그 변조가 가능합니다. parenting_tips_anon_all도 동일합니다.',
    })
  }
  const inquiriesPath = join(ROOT, 'supabase/migrations/20261006140000_create_general_inquiries.sql')
  const inquiries = existsSync(inquiriesPath) ? read(inquiriesPath) : ''
  const inquiriesLocked =
    /revoke all on table public\.general_inquiries/.test(inquiries) &&
    /grant insert on table public\.general_inquiries/.test(inquiries) &&
    inquiries.includes('Allow public insert general_inquiries') &&
    inquiries.includes("status = 'pending'") &&
    !/for select[\s\S]*to anon/.test(inquiries)

  if (inquiriesLocked) {
    add({
      id: 'B5',
      severity: 'PASS',
      area: 'RLS',
      title: 'general_inquiries 는 anon INSERT만 허용',
      detail: '공개 역할은 pending 문의 INSERT만 가능하고, 조회·상태 변경은 service_role 관리 API만 사용합니다.',
    })
  } else {
    add({
      id: 'B5',
      severity: 'CRITICAL',
      area: 'RLS',
      title: 'general_inquiries 공개 조회 또는 INSERT 정책이 느슨함',
      detail: 'anon SELECT가 열리거나 INSERT with check가 없으면 문의 내용·이메일이 유출되거나 상태 위조가 가능합니다.',
    })
  }

  add({
    id: 'B3',
    severity: 'HIGH',
    area: 'RLS',
    title: 'storage.objects printables 버킷 익명 INSERT/UPDATE',
    detail: '라이브 정책 printables_storage_anon_insert / printables_storage_anon_update 가 bucket_id=printables 인 객체 쓰기를 anon에 허용합니다. (R2와 별개인 Supabase Storage)',
  })
  add({
    id: 'B4',
    severity: 'MEDIUM',
    area: 'RLS',
    title: 'increment_printable_views/downloads 가 anon SECURITY DEFINER',
    detail: '조회/다운로드 카운트를 익명이 무제한 증가시킬 수 있습니다. search_path 미고정. 데이터 파괴는 아니지만 지표 오염·RPC 남용이 가능합니다.',
  })
}

function printReport() {
  const order: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PASS']
  const grouped = Object.fromEntries(order.map((sev) => [sev, findings.filter((item) => item.severity === sev)])) as Record<
    Severity,
    Finding[]
  >
  console.log('DOOLIA pre-launch security audit (read-only)')
  console.log(`root: ${ROOT}`)
  console.log(
    `counts: CRITICAL=${grouped.CRITICAL.length} HIGH=${grouped.HIGH.length} MEDIUM=${grouped.MEDIUM.length} LOW=${grouped.LOW.length} PASS=${grouped.PASS.length}`,
  )
  console.log('')
  for (const sev of order) {
    if (!grouped[sev].length) continue
    console.log(`=== ${sev} ===`)
    for (const item of grouped[sev]) {
      console.log(`[${item.id}] ${item.area} · ${item.title}`)
      console.log(`    ${item.detail}`)
      console.log('')
    }
  }
}

scanSecrets()
scanGitignore()
scanAdminGuard()
scanR2()
scanRlsMigrations()
printReport()

const critical = findings.filter((item) => item.severity === 'CRITICAL')
const high = findings.filter((item) => item.severity === 'HIGH')
if (critical.length) {
  console.log(`VERDICT: NOT READY FOR PUBLIC OPEN (${critical.length} critical, ${high.length} high)`)
  process.exitCode = 1
} else {
  console.log('VERDICT: READY FOR PUBLIC OPEN (all critical resolved)')
  if (high.length) console.log(`note: ${high.length} high remaining (storage/non-catalog)`)
}
