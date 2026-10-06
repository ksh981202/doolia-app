-- Public contact form inquiries. Public INSERT only; admin reads/updates via service_role.

create table if not exists public.general_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  type text not null default 'suggestion',
  content text not null,
  status text not null default 'pending',
  admin_note text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint general_inquiries_type_check
    check (type in ('suggestion', 'partnership', 'bug', 'other')),
  constraint general_inquiries_status_check
    check (status in ('pending', 'processing', 'resolved')),
  constraint general_inquiries_email_check
    check (char_length(email) between 5 and 254),
  constraint general_inquiries_name_check
    check (char_length(btrim(name)) between 2 and 120),
  constraint general_inquiries_content_check
    check (char_length(btrim(content)) between 8 and 4000)
);

comment on table public.general_inquiries is 'DOOLIA 일반 문의 (도안 제안 / 제휴 / 오류)';

create index if not exists general_inquiries_status_idx
  on public.general_inquiries (status, created_at desc);

alter table public.general_inquiries enable row level security;
alter table public.general_inquiries force row level security;

revoke all on table public.general_inquiries from anon, authenticated;
grant insert on table public.general_inquiries to anon, authenticated;
grant all on table public.general_inquiries to service_role;

drop policy if exists "Allow public insert general_inquiries" on public.general_inquiries;
drop policy if exists "Allow service_role manage general_inquiries" on public.general_inquiries;
drop policy if exists "general_inquiries_insert_public" on public.general_inquiries;
drop policy if exists "general_inquiries_service_role" on public.general_inquiries;

create policy "Allow public insert general_inquiries"
on public.general_inquiries
for insert
to anon, authenticated
with check (
  status = 'pending'
  and coalesce(admin_note, '') = ''
  and type in ('suggestion', 'partnership', 'bug', 'other')
);

create policy "Allow service_role manage general_inquiries"
on public.general_inquiries
for all
to service_role
using (true)
with check (true);
