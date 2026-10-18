import { supabase } from '@/lib/supabase'

export interface AdminBundle {
  id: string
  title_ko: string
  title_en?: string
  title_ja?: string
  title_zh?: string
  title_es?: string
  title_pt?: string
  title_de?: string
  title_fr?: string
  title_it?: string
  title_vi?: string
  recommend_ko?: string
  recommend_en?: string
  recommend_ja?: string
  recommend_zh?: string
  recommend_es?: string
  recommend_pt?: string
  recommend_de?: string
  recommend_fr?: string
  recommend_it?: string
  recommend_vi?: string
  play_ko?: string
  play_en?: string
  play_ja?: string
  play_zh?: string
  play_es?: string
  play_pt?: string
  play_de?: string
  play_fr?: string
  play_it?: string
  play_vi?: string
  slug: string
  age_group: string
  recommend_reason: string
  how_to_play: string
  cover_image_url: string
  pdf_download_url: string
  affiliate_id: string
  item_slugs: string[]
  item_titles: string[]
  status: 'draft' | 'published'
  created_at: string
}

// 모음집 전체 목록 조회
export const getBundles = async (): Promise<AdminBundle[]> => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as AdminBundle[]) || [];
  } catch (e) {
    console.error('Failed to fetch bundles from Supabase', e);
    return [];
  }
};

// 단일 모음집 slug 조회
export const getBundleBySlug = async (slug: string): Promise<AdminBundle | null> => {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data as AdminBundle | null;
  } catch (e) {
    console.error('Failed to fetch bundle by slug', e);
    return null;
  }
};

// 모음집 등록
export const createBundle = async (bundleData: Partial<AdminBundle>): Promise<AdminBundle | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('bundles')
    .insert([bundleData])
    .select()
    .single();
  if (error) throw error;
  return data as AdminBundle;
};

// 도안 선택 기반 초안 등록
export const createDraftBundle = async (selectedItems: any[]): Promise<AdminBundle | null> => {
  try {
    const firstItem = selectedItems[0];
    const uniqueSlug = `bundle-${Date.now()}`;
    const itemSlugs = selectedItems.map((item) => item.slug || item.id);
    const itemTitles = selectedItems.map((item) => item.title_ko || item.title_en || item.slug || '');

    const payload: any = {
      title_ko: '새 모음집 초안',
      title_en: 'New Bundle Draft',
      slug: uniqueSlug,
      status: 'draft',
      cover_image_url: firstItem?.image_color_url || firstItem?.image_bw_url || '',
      pdf_download_url: '',
      pdf_color_url: '',
      affiliate_id: 'scissors',
      item_slugs: itemSlugs,
      item_titles: itemTitles,
      age_group: '만 2~4세',
      recommend_reason: '',
      how_to_play: '',
      recommend_ko: '',
      play_ko: ''
    };

    return await createBundle(payload);
  } catch (e) {
    console.error('createDraftBundle 실패:', e);
    throw e;
  }
};

// 모음집 수정
export const updateBundle = async (id: string, bundleData: Partial<AdminBundle>): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('bundles')
    .update({ ...bundleData, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// 모음집 삭제
export const deleteBundle = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('bundles')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
