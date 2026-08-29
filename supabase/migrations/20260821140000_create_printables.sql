-- DOOLIA Printables — printables table, indexes, RLS, and counter RPCs
-- Apply in Supabase SQL Editor or via: supabase db query / migration

create schema if not exists private;

create table if not exists public.printables (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  category varchar(50) not null,
  tags text[] not null default '{}'::text[],
  color_image_url text not null,
  line_art_url text not null,
  pdf_url text not null,
  views int not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now(),
  constraint printables_category_check
    check (category in ('coloring', 'maze', 'tracing', 'alphabet', 'numbers')),
  constraint printables_views_nonnegative check (views >= 0),
  constraint printables_downloads_nonnegative check (downloads >= 0)
);

comment on table public.printables is 'A4 printable gallery items for DOOLIA Printables';
comment on column public.printables.category is 'coloring | maze | tracing | alphabet | numbers';
comment on column public.printables.created_at is 'Stored as timestamptz (UTC) for consistent ordering';

create index if not exists printables_category_idx
  on public.printables (category);

create index if not exists printables_created_at_idx
  on public.printables (created_at desc);

create index if not exists printables_tags_gin_idx
  on public.printables using gin (tags);

-- Table-level grants. RLS still filters who can actually mutate rows.
grant select on table public.printables to anon, authenticated;
grant insert, update, delete on table public.printables to authenticated;

alter table public.printables enable row level security;
alter table public.printables force row level security;

-- Admin flag lives in JWT app_metadata.role (not user_metadata — that is user-editable).
-- Set via Dashboard → Authentication → user → App Metadata: { "role": "admin" }
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "printables_select_public" on public.printables;
create policy "printables_select_public"
on public.printables
for select
to anon, authenticated
using (true);

drop policy if exists "printables_insert_admin" on public.printables;
create policy "printables_insert_admin"
on public.printables
for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "printables_update_admin" on public.printables;
create policy "printables_update_admin"
on public.printables
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "printables_delete_admin" on public.printables;
create policy "printables_delete_admin"
on public.printables
for delete
to authenticated
using ((select private.is_admin()));

-- Public counters: anon visitors may increment, never set arbitrary values.
create or replace function public.increment_printable_views(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.printables
  set views = views + 1
  where id = p_id;
end;
$$;

create or replace function public.increment_printable_downloads(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.printables
  set downloads = downloads + 1
  where id = p_id;
end;
$$;

revoke all on function public.increment_printable_views(uuid) from public;
revoke all on function public.increment_printable_downloads(uuid) from public;
grant execute on function public.increment_printable_views(uuid) to anon, authenticated;
grant execute on function public.increment_printable_downloads(uuid) to anon, authenticated;
