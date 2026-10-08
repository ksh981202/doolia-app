import { supabase } from '@/lib/supabase'
import { adminDb } from '@/services/adminDataClient'
import {
  AFFILIATE_ITEMS,
  type AffiliateItem,
  type LocalizedText,
  prefetchAffiliateMedia,
  setActiveAffiliatePool,
} from '@/shared/config/affiliates'

export type AffiliateRecord = {
  id: string
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  badge_ko: string
  badge_en: string
  benefit1_ko: string
  benefit1_en: string
  benefit2_ko: string
  benefit2_en: string
  cta_ko: string
  cta_en: string
  image_url: string
  video_url: string
  affiliate_url: string
  affiliate_url_en: string
  theme_ids: string[]
  is_active: boolean
  sort_order: number
  impression_count: number
  click_count: number
  created_at?: string
}

function localized(ko: string, en: string): LocalizedText {
  const english = en || ko
  const korean = ko || en
  return {
    ko: korean,
    en: english,
    ja: english,
    zh: english,
    es: english,
    pt: english,
    de: english,
    fr: english,
    it: english,
    vi: english,
  }
}

export function recordToAffiliateItem(row: AffiliateRecord): AffiliateItem {
  return {
    id: row.id,
    image: row.image_url,
    videoUrl: row.video_url,
    badge: localized(row.badge_ko, row.badge_en),
    headline: localized(row.title_ko, row.title_en),
    painPoint: localized(row.description_ko, row.description_en),
    benefit1: localized(row.benefit1_ko, row.benefit1_en),
    benefit2: localized(row.benefit2_ko, row.benefit2_en),
    ctaText: localized(row.cta_ko, row.cta_en),
    coupangUrl: row.affiliate_url,
    amazonUrl: row.affiliate_url_en || row.affiliate_url,
  }
}

export function emptyAffiliateDraft(): AffiliateRecord {
  return {
    id: '',
    title_ko: '',
    title_en: '',
    description_ko: '',
    description_en: '',
    badge_ko: '🎨 즐거운 미술놀이를 위한 준비물 추천',
    badge_en: '🎨 Recommended Supplies for Fun Art Play',
    benefit1_ko: '',
    benefit1_en: '',
    benefit2_ko: '',
    benefit2_en: '',
    cta_ko: '자세히 보기 ↗',
    cta_en: 'Learn more ↗',
    image_url: '',
    video_url: '',
    affiliate_url: '',
    affiliate_url_en: '',
    theme_ids: ['all'],
    is_active: true,
    sort_order: 0,
    impression_count: 0,
    click_count: 0,
  }
}

export async function fetchPublicAffiliateItems(): Promise<AffiliateItem[]> {
  if (!supabase) {
    setActiveAffiliatePool(AFFILIATE_ITEMS)
    prefetchAffiliateMedia(AFFILIATE_ITEMS)
    return AFFILIATE_ITEMS
  }
  const { data, error } = await supabase
    .from('affiliate_items')
    .select(
      'id, title_ko, title_en, description_ko, description_en, badge_ko, badge_en, benefit1_ko, benefit1_en, benefit2_ko, benefit2_en, cta_ko, cta_en, image_url, video_url, affiliate_url, affiliate_url_en, theme_ids, is_active, sort_order, impression_count, click_count',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error || !data?.length) {
    setActiveAffiliatePool(AFFILIATE_ITEMS)
    prefetchAffiliateMedia(AFFILIATE_ITEMS)
    return AFFILIATE_ITEMS
  }
  const items = (data as AffiliateRecord[]).map(recordToAffiliateItem)
  setActiveAffiliatePool(items)
  prefetchAffiliateMedia(items)
  return items
}

export async function incrementAffiliateImpression(id: string) {
  if (!supabase || !id) return
  const { error } = await supabase.rpc('increment_affiliate_impression', { p_id: id })
  if (error) console.warn('Failed to log affiliate impression:', error.message)
}

export async function incrementAffiliateClick(id: string) {
  if (!supabase || !id) return
  const { error } = await supabase.rpc('increment_affiliate_click', { p_id: id })
  if (error) console.warn('Failed to log affiliate click:', error.message)
}

export async function listAdminAffiliates(): Promise<AffiliateRecord[]> {
  const { rows } = await adminDb<AffiliateRecord>({ action: 'list', table: 'affiliate_items' })
  return [...(rows ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id.localeCompare(b.id))
}

export async function saveAdminAffiliate(row: AffiliateRecord) {
  const id = row.id.trim() || crypto.randomUUID().slice(0, 8)
  await adminDb({
    action: 'upsert',
    table: 'affiliate_items',
    row: {
      id,
      title_ko: row.title_ko,
      title_en: row.title_en,
      description_ko: row.description_ko,
      description_en: row.description_en,
      badge_ko: row.badge_ko,
      badge_en: row.badge_en,
      benefit1_ko: row.benefit1_ko,
      benefit1_en: row.benefit1_en,
      benefit2_ko: row.benefit2_ko,
      benefit2_en: row.benefit2_en,
      cta_ko: row.cta_ko,
      cta_en: row.cta_en,
      image_url: row.image_url,
      video_url: row.video_url,
      affiliate_url: row.affiliate_url,
      affiliate_url_en: row.affiliate_url_en,
      theme_ids: row.theme_ids?.length ? row.theme_ids : ['all'],
      is_active: row.is_active,
      sort_order: row.sort_order,
    },
  })
  return id
}

export async function updateAdminAffiliate(id: string, patch: Partial<AffiliateRecord>) {
  await adminDb({
    action: 'update',
    table: 'affiliate_items',
    eq: { id },
    patch,
  })
}

export async function deleteAdminAffiliate(id: string) {
  await adminDb({
    action: 'delete',
    table: 'affiliate_items',
    eq: { id },
  })
}

export function affiliateCtr(impressions: number, clicks: number) {
  if (!impressions) return 0
  return Math.round((clicks / impressions) * 1000) / 10
}
