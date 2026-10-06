-- Zero-trust RLS for public catalog tables.
-- anon/authenticated may only read published catalog rows and insert copyright reports.
-- Mutations go through the admin session API using service_role (BYPASSRLS).

do $$
declare
  rec record;
begin
  for rec in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('printables', 'copyright_reports', 'parenting_tips')
  loop
    execute format('drop policy if exists %I on public.%I', rec.policyname, rec.tablename);
  end loop;
end
$$;

alter table public.printables enable row level security;
alter table public.printables force row level security;
alter table public.copyright_reports enable row level security;
alter table public.copyright_reports force row level security;
alter table public.parenting_tips enable row level security;
alter table public.parenting_tips force row level security;

revoke all on table public.printables from anon, authenticated;
grant select on table public.printables to anon, authenticated;

revoke all on table public.copyright_reports from anon, authenticated;
grant insert on table public.copyright_reports to anon, authenticated;

revoke all on table public.parenting_tips from anon, authenticated;
grant select on table public.parenting_tips to anon, authenticated;

drop policy if exists "printables_anon_all" on public.printables;
drop policy if exists "printables_anon_delete" on public.printables;
drop policy if exists "printables_select_published" on public.printables;

create policy "printables_select_published"
on public.printables
for select
to anon, authenticated
using (published = true);

drop policy if exists "copyright_reports_insert_public" on public.copyright_reports;
drop policy if exists "copyright_reports_select_admin" on public.copyright_reports;
drop policy if exists "copyright_reports_update_admin" on public.copyright_reports;

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

drop policy if exists "parenting_tips_anon_all" on public.parenting_tips;
drop policy if exists "parenting_tips_select_published" on public.parenting_tips;

create policy "parenting_tips_select_published"
on public.parenting_tips
for select
to anon, authenticated
using (published = true);

create index if not exists printables_published_true_idx
  on public.printables (created_at desc)
  where published = true;
