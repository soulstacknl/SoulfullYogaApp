-- History of what the admin does with a customer's strips: a new card, strips added or
-- taken off (group card and private card). Strips taken by lessons are not logged here:
-- those follow from the attendance itself. Only the admin reads this history.

create table public.strip_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  card text not null check (card in ('groep', 'prive')),
  kind text not null check (kind in ('kaart', 'aanpassing')),
  delta integer not null,
  balance integer not null,
  created_at timestamptz not null default now()
);
create index strip_events_user on public.strip_events (user_id, created_at desc);
alter table public.strip_events enable row level security;
create policy "strip events: admin reads" on public.strip_events for select using (public.is_admin());
grant select on public.strip_events to authenticated;

create or replace function public.admin_adjust_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  before integer;
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  select coalesce(strippen, 0) into before from public.profiles where id = p_id;
  update public.profiles set strippen = greatest(0, coalesce(strippen, 0) + p_delta),
    strips_valid_until = case when p_delta > 0
      then greatest(coalesce(strips_valid_until, public.card_valid_until()), public.card_valid_until())
      else strips_valid_until end
  where id = p_id returning strippen into result;
  if result is not null and result <> before then
    insert into public.strip_events (user_id, card, kind, delta, balance) values (p_id, 'groep', 'aanpassing', result - before, result);
  end if;
  return result;
end;
$$;

create or replace function public.admin_activate_card(p_id uuid, p_size integer default 10) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = coalesce(strippen, 0) + p_size,
    total = greatest(p_size, coalesce(strippen, 0) + p_size),
    strips_valid_until = greatest(coalesce(strips_valid_until, public.card_valid_until()), public.card_valid_until())
  where id = p_id returning strippen into result;
  if result is not null then
    insert into public.strip_events (user_id, card, kind, delta, balance) values (p_id, 'groep', 'kaart', p_size, result);
  end if;
  return result;
end;
$$;

create or replace function public.admin_adjust_private_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  before integer;
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  select private_strips into before from public.profiles where id = p_id;
  update public.profiles set private_strips = greatest(0, coalesce(private_strips, 0) + p_delta) where id = p_id
  returning private_strips into result;
  if result is not null and result <> coalesce(before, 0) then
    insert into public.strip_events (user_id, card, kind, delta, balance)
    values (p_id, 'prive', case when before is null then 'kaart' else 'aanpassing' end, result - coalesce(before, 0), result);
  end if;
  return result;
end;
$$;
