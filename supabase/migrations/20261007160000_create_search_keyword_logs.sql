-- Aggregated public search-keyword stats for the admin dashboard.
-- Public writes go through log_search_query RPC only (no direct INSERT).

create table if not exists public.search_keyword_logs (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  result_count int not null default 0,
  search_count int not null default 1,
  last_searched_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint search_keyword_logs_keyword_len
    check (char_length(keyword) between 2 and 80),
  constraint search_keyword_logs_counts_nonnegative
    check (result_count >= 0 and search_count >= 0),
  constraint search_keyword_logs_keyword_unique unique (keyword)
);

comment on table public.search_keyword_logs is 'DOOLIA 유저 검색어 집계 (인기/미보유 키워드)';

create index if not exists search_keyword_logs_keyword_idx
  on public.search_keyword_logs (keyword);

create index if not exists search_keyword_logs_search_count_idx
  on public.search_keyword_logs (search_count desc);

create index if not exists search_keyword_logs_result_count_idx
  on public.search_keyword_logs (result_count);

alter table public.search_keyword_logs enable row level security;
alter table public.search_keyword_logs force row level security;

revoke all on table public.search_keyword_logs from anon, authenticated;
grant select on table public.search_keyword_logs to anon, authenticated;
grant all on table public.search_keyword_logs to service_role;

drop policy if exists "search_keyword_logs_select_public" on public.search_keyword_logs;
drop policy if exists "search_keyword_logs_insert_rpc_only" on public.search_keyword_logs;

create policy "search_keyword_logs_select_public"
on public.search_keyword_logs
for select
to anon, authenticated
using (true);

create or replace function public.log_search_query(p_keyword text, p_result_count int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text;
  safe_count int;
begin
  normalized := lower(btrim(coalesce(p_keyword, '')));
  if char_length(normalized) < 2 then
    return;
  end if;
  if char_length(normalized) > 80 then
    normalized := left(normalized, 80);
  end if;

  safe_count := greatest(coalesce(p_result_count, 0), 0);

  insert into public.search_keyword_logs as logs (
    keyword,
    result_count,
    search_count,
    last_searched_at
  )
  values (
    normalized,
    safe_count,
    1,
    timezone('utc'::text, now())
  )
  on conflict (keyword) do update
    set search_count = logs.search_count + 1,
        result_count = excluded.result_count,
        last_searched_at = timezone('utc'::text, now());
end;
$$;

revoke all on function public.log_search_query(text, int) from public;
grant execute on function public.log_search_query(text, int) to anon, authenticated, service_role;
