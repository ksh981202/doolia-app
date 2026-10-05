alter table public.copyright_reports
  add column if not exists reporter_name text not null default '',
  add column if not exists good_faith_agreed boolean not null default false;

comment on column public.copyright_reports.reporter_name is '신고자 성명 또는 법인명';
comment on column public.copyright_reports.good_faith_agreed is '권리 확인 및 허위신고 책임 동의';

drop policy if exists "copyright_reports_insert_public" on public.copyright_reports;
create policy "copyright_reports_insert_public"
on public.copyright_reports
for insert
to anon, authenticated
with check (
  status = 'pending'
  and admin_notes is null
  and good_faith_agreed = true
  and char_length(btrim(reporter_name)) >= 2
);
