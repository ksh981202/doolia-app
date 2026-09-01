-- Admin pipeline: extra printable columns, parenting_tips, storage
-- PIN + anon-key admin client (no private.is_admin() dependency)

alter table public.printables
  add column if not exists slug text,
  add column if not exists title_ko text,
  add column if not exists title_en text,
  add column if not exists catalog_slug text,
  add column if not exists image_bw_url text,
  add column if not exists image_color_url text,
  add column if not exists published boolean not null default true,
  add column if not exists description text;

update public.printables
set
  slug = coalesce(nullif(slug, ''), id::text),
  title_ko = coalesce(nullif(title_ko, ''), title),
  title_en = coalesce(nullif(title_en, ''), title),
  image_bw_url = coalesce(nullif(image_bw_url, ''), line_art_url),
  image_color_url = coalesce(nullif(image_color_url, ''), color_image_url)
where true;

create unique index if not exists printables_slug_uidx on public.printables (slug);

create table if not exists public.parenting_tips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null default 'cognition',
  thumbnail_url text not null default '',
  thumbnail_alt text not null default '',
  read_minutes int not null default 5,
  views int not null default 0,
  published boolean not null default false,
  body_markdown text not null default '',
  takeaways text[] not null default '{}'::text[],
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parenting_tips_category_check
    check (category in ('motor', 'cognition', 'emotion', 'homeschool')),
  constraint parenting_tips_read_minutes_check check (read_minutes > 0)
);

comment on table public.parenting_tips is 'DOOLIA 육아·놀이 팁 칼럼';

create index if not exists parenting_tips_published_idx
  on public.parenting_tips (published, published_at desc);

grant select, insert, update, delete on table public.parenting_tips to anon, authenticated;

alter table public.parenting_tips enable row level security;
alter table public.parenting_tips force row level security;

drop policy if exists "parenting_tips_select_published" on public.parenting_tips;
drop policy if exists "parenting_tips_insert_admin" on public.parenting_tips;
drop policy if exists "parenting_tips_update_admin" on public.parenting_tips;
drop policy if exists "parenting_tips_delete_admin" on public.parenting_tips;
drop policy if exists "parenting_tips_anon_all" on public.parenting_tips;

create policy "parenting_tips_anon_all"
on public.parenting_tips
for all
to anon, authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('printables', 'printables', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('parenting-tips', 'parenting-tips', true)
on conflict (id) do nothing;

drop policy if exists "doolia_media_public_read" on storage.objects;
create policy "doolia_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('printables', 'parenting-tips'));
