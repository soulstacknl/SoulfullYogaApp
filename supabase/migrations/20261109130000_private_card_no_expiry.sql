-- The private-lesson card has no end date (only the group card is valid for 4 months).

create or replace function public.admin_adjust_private_strips(p_id uuid, p_delta integer) returns integer
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

create or replace function public.admin_remove_private_card(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set private_strips = null where id = p_id;
end;
$$;

create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for server-side SQL (migrations, seed), which may change anything.
  if auth.uid() is not null and not public.is_admin() and pg_trigger_depth() = 1 and (
    new.role is distinct from old.role or new.strippen is distinct from old.strippen
    or new.total is distinct from old.total or new.email is distinct from old.email
    or new.private_strips is distinct from old.private_strips
    or new.strips_valid_until is distinct from old.strips_valid_until
  ) then
    raise exception 'Alleen de beheerder kan rol, e-mail of strippen aanpassen';
  end if;
  return new;
end;
$$;

alter table public.profiles drop column private_valid_until;
