-- Public copyright / rights reports. PIN + anon-key admin (same model as parenting_tips).

create table if not exists public.copyright_reports (
  id uuid primary key default gen_random_uuid(),
  printable_id text not null default '',
  printable_slug text not null default '',
  printable_title text not null default '',
  page_url text not null,
  reporter_name text not null default '',
  reporter_email text not null,
  good_faith_agreed boolean not null default false,
  report_type text not null default 'copyright',
  content text not null,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint copyright_reports_type_check
    check (report_type in ('copyright', 'modification', 'other')),
  constraint copyright_reports_status_check
    check (status in ('pending', 'reviewed', 'resolved')),
  constraint copyright_reports_email_check
    check (char_length(reporter_email) between 5 and 254),
  constraint copyright_reports_content_check
    check (char_length(btrim(content)) between 8 and 4000)
);

comment on table public.copyright_reports is 'DOOLIA 저작권/권리침해 간편 신고';

create index if not exists copyright_reports_status_idx
  on public.copyright_reports (status, created_at desc);

grant select, insert, update on table public.copyright_reports to anon, authenticated;

alter table public.copyright_reports enable row level security;
alter table public.copyright_reports force row level security;

drop policy if exists "Allow public insert to copyright_reports" on public.copyright_reports;
drop policy if exists "Allow admin full access to copyright_reports" on public.copyright_reports;
drop policy if exists "copyright_reports_insert_public" on public.copyright_reports;
drop policy if exists "copyright_reports_select_admin" on public.copyright_reports;
drop policy if exists "copyright_reports_update_admin" on public.copyright_reports;

create policy "copyright_reports_insert_public"
on public.copyright_reports
for insert
to anon, authenticated
with check (status = 'pending' and admin_notes is null and good_faith_agreed = true);

create policy "copyright_reports_select_admin"
on public.copyright_reports
for select
to anon, authenticated
using (true);

create policy "copyright_reports_update_admin"
on public.copyright_reports
for update
to anon, authenticated
using (true)
with check (true);
