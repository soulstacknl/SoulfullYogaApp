-- A separate strip card for private lessons. The admin creates it for an existing customer
-- and takes a strip off by hand after a private lesson (Klanten beheren → Privélessen);
-- the attendance list never touches it. null = no private card.

alter table public.profiles add column private_strips integer check (private_strips >= 0);

-- Customers may not change their own private strips either.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for server-side SQL (migrations, seed), which may change anything.
  if auth.uid() is not null and not public.is_admin() and pg_trigger_depth() = 1 and (
    new.role is distinct from old.role or new.strippen is distinct from old.strippen
    or new.total is distinct from old.total or new.email is distinct from old.email
    or new.private_strips is distinct from old.private_strips
  ) then
    raise exception 'Alleen de beheerder kan rol, e-mail of strippen aanpassen';
  end if;
  return new;
end;
$$;

-- +n / −n (or a new card: +10). Atomic, so quick taps don't get lost.
create function public.admin_adjust_private_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set private_strips = greatest(0, coalesce(private_strips, 0) + p_delta) where id = p_id
  returning private_strips into result;
  return result;
end;
$$;
revoke execute on function public.admin_adjust_private_strips(uuid, integer) from public, anon;
grant execute on function public.admin_adjust_private_strips(uuid, integer) to authenticated;

-- Removing the card (back to "no private card").
create function public.admin_remove_private_card(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set private_strips = null where id = p_id;
end;
$$;
revoke execute on function public.admin_remove_private_card(uuid) from public, anon;
grant execute on function public.admin_remove_private_card(uuid) to authenticated;
