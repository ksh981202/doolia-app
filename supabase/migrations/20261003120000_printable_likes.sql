alter table public.printables
  add column if not exists likes int not null default 0;

alter table public.printables
  drop constraint if exists printables_likes_nonnegative;

alter table public.printables
  add constraint printables_likes_nonnegative check (likes >= 0);

create or replace function public.increment_printable_likes(p_id uuid, p_delta int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_delta is null or p_delta = 0 then
    return;
  end if;

  update public.printables
  set likes = greatest(0, likes + p_delta)
  where id = p_id;
end;
$$;

revoke all on function public.increment_printable_likes(uuid, int) from public;
grant execute on function public.increment_printable_likes(uuid, int) to anon, authenticated;
