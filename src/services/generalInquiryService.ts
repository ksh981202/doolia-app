import { supabase } from '@/lib/supabase'
import { notifyAdminPendingChanged } from '@/admin/pendingEvents'
import { adminDb } from '@/services/adminDataClient'

export const INQUIRY_TYPES = ['suggestion', 'partnership', 'bug', 'other'] as const
export const INQUIRY_STATUSES = ['pending', 'processing', 'resolved'] as const

export type InquiryType = (typeof INQUIRY_TYPES)[number]
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export type GeneralInquiry = {
  id: string
  name: string
  email: string
  type: InquiryType
  content: string
  status: InquiryStatus
  admin_note: string
  created_at: string
}

export type SubmitGeneralInquiryInput = {
  name: string
  email: string
  type: InquiryType
  content: string
}

function isInquiryType(value: string): value is InquiryType {
  return INQUIRY_TYPES.includes(value as InquiryType)
}

function isInquiryStatus(value: string): value is InquiryStatus {
  return INQUIRY_STATUSES.includes(value as InquiryStatus)
}

function normalize(row: Partial<GeneralInquiry> & { id: string }): GeneralInquiry {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    type: isInquiryType(row.type || '') ? row.type! : 'other',
    content: row.content || '',
    status: isInquiryStatus(row.status || '') ? row.status! : 'pending',
    admin_note: row.admin_note || '',
    created_at: row.created_at || new Date().toISOString(),
  }
}

export function validateGeneralInquiry(input: SubmitGeneralInquiryInput) {
  const name = input.name.trim()
  const email = input.email.trim()
  const content = input.content.trim()
  if (name.length < 2 || name.length > 120) return 'contact.error_name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'contact.error_email'
  if (!isInquiryType(input.type)) return 'contact.label_type'
  if (content.length < 2 || content.length > 4000) return 'contact.error_content'
  return ''
}

export async function submitGeneralInquiry(input: SubmitGeneralInquiryInput) {
  const error = validateGeneralInquiry(input)
  if (error) throw new Error(error)
  if (!supabase) throw new Error('contact.error_submit')

  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    type: input.type,
    content: input.content.trim(),
  }

  const { error: insertError } = await supabase.from('general_inquiries').insert(payload)
  if (insertError) throw new Error('contact.error_submit')
}

export async function listGeneralInquiries() {
  const remote = await adminDb<GeneralInquiry>({
    action: 'list',
    table: 'general_inquiries',
  })
  return (remote.rows ?? [])
    .map((row) => normalize(row))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
}

export async function updateGeneralInquiry(
  id: string,
  patch: { status?: InquiryStatus; admin_note?: string },
) {
  await adminDb({
    action: 'update',
    table: 'general_inquiries',
    eq: { id },
    patch,
  })
  notifyAdminPendingChanged()
}

export async function countPendingGeneralInquiries() {
  const rows = await listGeneralInquiries()
  return rows.filter((row) => row.status === 'pending').length
}
