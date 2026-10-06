import { supabase } from '@/lib/supabase'
import { adminDb } from '@/services/adminDataClient'

export const REPORT_TYPES = ['copyright', 'modification', 'other'] as const
export const REPORT_STATUSES = ['pending', 'reviewed', 'resolved'] as const

export type ReportType = (typeof REPORT_TYPES)[number]
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export type CopyrightReport = {
  id: string
  printable_id: string
  printable_slug: string
  printable_title: string
  page_url: string
  reporter_name: string
  reporter_email: string
  good_faith_agreed: boolean
  report_type: ReportType
  content: string
  status: ReportStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type SubmitCopyrightReportInput = {
  printableId: string
  printableSlug: string
  printableTitle: string
  pageUrl: string
  reporterName: string
  reporterEmail: string
  goodFaithAgreed: boolean
  reportType: ReportType
  content: string
}

const LOCAL_KEY = 'doolia-copyright-reports'

function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType)
}

function isReportStatus(value: string): value is ReportStatus {
  return REPORT_STATUSES.includes(value as ReportStatus)
}

function readLocal(): CopyrightReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CopyrightReport[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(rows: CopyrightReport[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
}

function normalize(row: Partial<CopyrightReport> & { id: string }): CopyrightReport {
  return {
    id: row.id,
    printable_id: row.printable_id || '',
    printable_slug: row.printable_slug || '',
    printable_title: row.printable_title || '',
    page_url: row.page_url || '',
    reporter_name: row.reporter_name || '',
    reporter_email: row.reporter_email || '',
    good_faith_agreed: Boolean(row.good_faith_agreed),
    report_type: isReportType(row.report_type || '') ? row.report_type! : 'copyright',
    content: row.content || '',
    status: isReportStatus(row.status || '') ? row.status! : 'pending',
    admin_notes: row.admin_notes ?? null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  }
}

export function validateCopyrightReport(input: SubmitCopyrightReportInput) {
  const name = input.reporterName.trim()
  const email = input.reporterEmail.trim()
  const content = input.content.trim()
  if (name.length < 2) return '신고자 또는 기업명을 입력해 주세요.'
  if (name.length > 120) return '신고자명이 너무 깁니다.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일을 입력해 주세요.'
  if (content.length < 8) return '문의 내용을 조금 더 자세히 적어 주세요.'
  if (content.length > 4000) return '문의 내용이 너무 깁니다.'
  if (!isReportType(input.reportType)) return '문의 유형을 선택해 주세요.'
  if (!input.goodFaithAgreed) return '권리 확인 안내에 동의해 주세요.'
  return ''
}

export async function submitCopyrightReport(input: SubmitCopyrightReportInput) {
  const error = validateCopyrightReport(input)
  if (error) throw new Error(error)

  const payload = {
    printable_id: input.printableId.trim(),
    printable_slug: input.printableSlug.trim(),
    printable_title: input.printableTitle.trim(),
    page_url: input.pageUrl.trim() || (typeof window === 'undefined' ? '' : window.location.href),
    reporter_name: input.reporterName.trim(),
    reporter_email: input.reporterEmail.trim(),
    good_faith_agreed: true,
    report_type: input.reportType,
    content: input.content.trim(),
    status: 'pending' as const,
  }

  if (supabase) {
    const { error: insertError } = await supabase.from('copyright_reports').insert(payload)
    if (insertError) throw new Error(insertError.message || '접수에 실패했습니다.')
    return
  }

  const now = new Date().toISOString()
  writeLocal([
    normalize({
      ...payload,
      id: crypto.randomUUID(),
      admin_notes: null,
      created_at: now,
      updated_at: now,
    }),
    ...readLocal(),
  ])
}

export async function listCopyrightReports() {
  const remote = await adminDb<CopyrightReport>({
    action: 'list',
    table: 'copyright_reports',
  })
  return (remote.rows ?? []).map((row) => normalize(row)).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
}

export async function updateCopyrightReport(
  id: string,
  patch: { status?: ReportStatus; admin_notes?: string | null },
) {
  const updatedAt = new Date().toISOString()
  await adminDb({
    action: 'update',
    table: 'copyright_reports',
    eq: { id },
    patch: { ...patch, updated_at: updatedAt },
  })
}

export async function countPendingCopyrightReports() {
  const rows = await listCopyrightReports()
  return rows.filter((row) => row.status === 'pending').length
}
