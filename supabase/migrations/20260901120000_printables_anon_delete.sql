-- PIN + anon-key admin client needs DELETE on printables (same model as parenting_tips).
grant delete on table public.printables to anon;

drop policy if exists "printables_delete_admin" on public.printables;
create policy "printables_delete_admin"
on public.printables
for delete
to anon, authenticated
using (true);
