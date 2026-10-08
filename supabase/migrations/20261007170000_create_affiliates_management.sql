-- Affiliate marketing catalog + impression/click counters for admin ops.

create table if not exists public.affiliate_items (
  id text primary key,
  title_ko text not null default '',
  title_en text not null default '',
  description_ko text not null default '',
  description_en text not null default '',
  badge_ko text not null default '',
  badge_en text not null default '',
  benefit1_ko text not null default '',
  benefit1_en text not null default '',
  benefit2_ko text not null default '',
  benefit2_en text not null default '',
  cta_ko text not null default '',
  cta_en text not null default '',
  image_url text not null default '',
  video_url text not null default '',
  affiliate_url text not null default '',
  affiliate_url_en text not null default '',
  theme_ids text[] not null default array['all']::text[],
  is_active boolean not null default true,
  sort_order integer not null default 0,
  impression_count integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint affiliate_items_id_len check (char_length(id) between 1 and 80),
  constraint affiliate_items_counts_nonnegative check (impression_count >= 0 and click_count >= 0)
);

comment on table public.affiliate_items is 'DOOLIA 제휴마케팅 배너 (노출/클릭 추적 + 관리자 CRUD)';

create index if not exists affiliate_items_active_sort_idx
  on public.affiliate_items (is_active, sort_order, created_at);

alter table public.affiliate_items enable row level security;
alter table public.affiliate_items force row level security;

revoke all on table public.affiliate_items from anon, authenticated;
grant select on table public.affiliate_items to anon, authenticated;
grant all on table public.affiliate_items to service_role;

drop policy if exists "affiliate_items_select_active" on public.affiliate_items;
create policy "affiliate_items_select_active"
on public.affiliate_items
for select
to anon, authenticated
using (is_active = true);

insert into public.affiliate_items (
  id, title_ko, title_en, description_ko, description_en, badge_ko, badge_en,
  benefit1_ko, benefit1_en, benefit2_ko, benefit2_en, cta_ko, cta_en,
  image_url, video_url, affiliate_url, affiliate_url_en, theme_ids, is_active, sort_order
) values
('01_crayons', '손이나 벽에 묻어도 물로 쏙 지워지는 안심 크레용', 'Ultra-Clean Washable Crayons for Toddlers', '손이나 옷, 벽에 낙서할까 봐 불안하셨나요?', 'Worried about messy crayon marks on hands, clothes, or walls?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '물과 비누로 말끔하게 세척되는 이지 워셔블', 'Easily washes from skin and most fabrics with warm water', '구강기 안심 무독성 원료 & 단단한 부러짐 방지', '100% Non-toxic safe formula with break-resistant design', '물로 쉽게 닦이는 안심 크레용 둘러보기 ↗', 'View Safe Washable Crayons ↗', '/affiliate/affiliate_01_crayons.webp', '/affiliate/affiliate_01_crayons.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%9C%A0%EC%95%84+%EC%9B%8C%EC%85%94%EB%B8%94+%ED%81%AC%EB%A0%88%EC%9A%A9', 'https://www.amazon.com/s?k=Washable+Crayons+for+Toddlers', ARRAY['all']::text[], true, 1),
('02_colored_pencils', '손 힘이 약한 아이를 위한 맞춤 삼각 점보 색연필', 'Jumbo Triangular Colored Pencils for Easy Grip', '색칠하다가 금방 손가락이 아프다고 멈추나요?', 'Does your child tire quickly from gripping thin pencils?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '바른 연필잡기를 자연스럽게 유도하는 인체공학 삼각 그립', 'Ergonomic triangular shape naturally guides proper grip', '적은 힘으로도 부드럽고 선명하게 칠해지는 점보 심', 'Thick, smooth lead delivers vibrant colors with minimal effort', '손이 편한 삼각 점보 색연필 둘러보기 ↗', 'View Jumbo Triangular Pencils ↗', '/affiliate/affiliate_02_colored_pencils.webp', '/affiliate/affiliate_02_colored_pencils.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%82%BC%EA%B0%81+%EC%A0%90%EB%B3%B4+%EC%83%89%EC%97%B0%ED%95%84', 'https://www.amazon.com/s?k=Jumbo+Triangular+Colored+Pencils+for+Kids', ARRAY['all']::text[], true, 2),
('03_markers', '뚜껑 열려도 오래 쓰는 안심 워셔블 수성 사인펜', 'Ultra-Washable Long-Lasting Kids Marker Pens', '뚜껑을 안 닫아 금방 말라버린 사인펜이 많았나요?', 'Tired of dried-out markers with lost caps?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '피부와 옷에 묻어도 물로 쏙 지워지는 수성 잉크', 'Ultra-washable water-based ink cleans easily from skin and clothes', '아이가 꾹꾹 눌러 써도 밀려 들어가지 않는 튼튼한 닙', 'Durable pressure-resistant nib won’t push in under hard pressing', '물로 지워지는 키즈 수성 사인펜 둘러보기 ↗', 'View Washable Marker Pens ↗', '/affiliate/affiliate_03_markers.webp', '/affiliate/affiliate_03_markers.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%9B%8C%EC%85%94%EB%B8%94+%EC%88%98%EC%84%B1+%EC%82%AC%EC%9D%B8%ED%8E%9C', 'https://www.amazon.com/s?k=Washable+Markers+for+Kids', ARRAY['all']::text[], true, 3),
('04_water_brush', '물통 엎지를 걱정 없는 신개념 워터 브러쉬 펜', 'No-Spill Water Brush Pens for Mess-Free Watercolor', '물감 놀이할 때 물통이 쏟아질까 봐 조마조마하셨나요?', 'Constantly worried about tipped-over water cups while painting?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '펜 몸통에 물을 채워 엎지를 걱정 없는 깔끔한 수채 놀이', 'Built-in refillable water reservoir eliminates messy water spills', '부드럽고 갈라짐 없는 탄력적인 고급 나일론 모', 'High-quality flexible nylon bristles that keep their shape', '물 안 쏟는 워터 브러쉬 펜 세트 둘러보기 ↗', 'View Water Brush Pens ↗', '/affiliate/affiliate_04_water_brush.webp', '/affiliate/affiliate_04_water_brush-silent.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%9B%8C%ED%84%B0+%EB%B8%8C%EB%9F%AC%EC%89%AC+%ED%8E%9C+%EC%84%B8%ED%8A%B8', 'https://www.amazon.com/s?k=Water+Brush+Pens+for+Kids', ARRAY['all']::text[], true, 4),
('05_art_smock', '옷 버림 없이 마음껏 그리는 유아 방수 미술가운', 'Waterproof Long Sleeve Art Smock for Mess-Free Play', '아이가 아끼는 예쁜 옷에 물감이 묻을까 봐 걱정되셨나요?', 'Afraid of paint and marker stains ruining favorite clothes?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '소매 끝 밴딩과 전면 완벽 방수로 깔끔한 놀이 환경', 'Full waterproof coverage with snug elastic cuffs keeps clothes spotless', '물티슈로 슥 닦거나 가볍게 물세탁 가능한 가벼운 원단', 'Lightweight breathable fabric that wipes clean in seconds', '안심 방수 유아 미술가운 둘러보기 ↗', 'View Waterproof Art Smocks ↗', '/affiliate/affiliate_05_art_smock.webp', '/affiliate/affiliate_05_art_smock-silent.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%9C%A0%EC%95%84+%EB%B0%A9%EC%88%98+%EB%AF%B8%EC%88%A0%EA%B0%80%EC%9A%B4+%EC%A0%84%EC%8B%A0', 'https://www.amazon.com/s?k=Waterproof+Kids+Art+Smock+Long+Sleeve', ARRAY['all']::text[], true, 5),
('06_craft_mat', '테이블 오염 완벽 차단! 대형 실리콘 미술 매트', 'Extra Large Silicone Craft Mat with Cleaning Cup', '식탁이나 책상에 낙서가 배어들까 봐 전전긍긍하셨나요?', 'Stressing over marker bleed-through and table scratches?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '물세척 한 번으로 끝나는 무독성 식품용 실리콘', '100% Food-grade non-stick silicone washes clean with water', '물감 팔레트와 붓 거치 공간이 빌트인된 깔끔한 편의성', 'Built-in paint wells and brush holders keep craft time tidy', '정리가 쉬운 대형 실리콘 미술 매트 둘러보기 ↗', 'View Silicone Craft Mats ↗', '/affiliate/affiliate_06_craft_mat.webp', '/affiliate/affiliate_06_craft_mat-silent.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%9C%A0%EC%95%84+%EC%8B%A4%EB%A6%AC%EC%BD%98+%EB%AF%B8%EC%88%A0+%EB%A7%A4%ED%8A%B8+%EB%8C%80%ED%98%95', 'https://www.amazon.com/s?k=Silicone+Craft+Mat+for+Kids', ARRAY['all']::text[], true, 6),
('07_safety_scissors', '손 베일 걱정 없는 둥근 안전 가위', 'Safe Blunt-Tip Preschool Training Scissors', '아이가 혼자 가위질할 때 다칠까 봐 손을 못 떼셨나요?', 'Afraid of accidental cuts when your toddler practices scissor skills?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '종이만 잘리고 살이나 옷은 안 잘리는 안심 날 설계', 'Safety blades only cut paper, keeping skin, hair, and clothes safe', '손 힘이 약한 유아도 쉽게 오릴 수 있는 스프링 지지대', 'Spring-assisted lever automatically reopens for effortless cutting', '다칠 걱정 없는 어린이 안전가위 둘러보기 ↗', 'View Safe Toddler Scissors ↗', '/affiliate/affiliate_07_safety_scissors.webp', '/affiliate/affiliate_07_safety_scissors-silent.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%95%88%EC%A0%84%EA%B0%80%EC%9C%84+%EC%9C%A0%EC%95%84', 'https://www.amazon.com/s?k=Toddler+Safety+Scissors+for+Kids', ARRAY['all']::text[], true, 7),
('08_kids_art_set', '하나로 끝내는 올인원 어린이 종합 미술세트', 'All-In-One Deluxe Kids Art Supplies Gift Set', '미술도구를 따로 사기 번거롭고 정리가 잘 안 되나요?', 'Tired of buying separate supplies and dealing with messy clutter?', '🎨 즐거운 미술놀이를 위한 준비물 추천', '🎨 Recommended Supplies for Fun Art Play', '색연필·사인펜·크레파스 등 풍성한 도구가 한 번에', 'Complete variety including crayons, colored pencils, and markers', '손잡이 가방형 케이스로 스스로 정리하는 습관 형성', 'Portable carry case encourages self-cleanup and easy travel', '선물하기 좋은 종합 미술세트 둘러보기 ↗', 'View Deluxe Kids Art Sets ↗', '/affiliate/affiliate_08_kids_art_set.webp', '/affiliate/affiliate_08_kids_art_set-silent.mp4', 'https://www.coupang.com/np/search?component=&q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%A2%85%ED%95%A9+%EB%AF%B8%EC%88%A0%EC%84%B8%ED%8A%B8+%EC%BC%80%EC%9D%B4%EC%8A%A4', 'https://www.amazon.com/s?k=Kids+Art+Set+with+Case', ARRAY['all']::text[], true, 8)
on conflict (id) do nothing;

create or replace function public.increment_affiliate_impression(p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_id is null or btrim(p_id) = '' then
    return;
  end if;
  update public.affiliate_items
  set impression_count = impression_count + 1
  where id = p_id and is_active = true;
end;
$$;

create or replace function public.increment_affiliate_click(p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_id is null or btrim(p_id) = '' then
    return;
  end if;
  update public.affiliate_items
  set click_count = click_count + 1
  where id = p_id and is_active = true;
end;
$$;

revoke all on function public.increment_affiliate_impression(text) from public;
revoke all on function public.increment_affiliate_click(text) from public;
grant execute on function public.increment_affiliate_impression(text) to anon, authenticated, service_role;
grant execute on function public.increment_affiliate_click(text) to anon, authenticated, service_role;
