-- Late cancellation (terms art. 5.4): a customer who cancels within 24 hours of
-- the start pays one strip. Undoing that cancellation gives the strip back.
-- The database decides, so the rule holds whatever the client sends.

alter table public.cancellations
  add column late boolean not null default false,     -- cancelled within 24 hours of the start
  add column charged boolean not null default false;  -- a strip was deducted for it

create function public.charge_late_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  starts timestamptz;
begin
  if new.cancelled_by <> 'klant' then return new; end if;
  -- Already cancelled: the insert will be skipped or fail, so charge nothing.
  if exists (select 1 from public.cancellations c
             where c.session_id = new.session_id and c.date = new.date and c.user_id = new.user_id) then
    return new;
  end if;
  select (new.date + s.start_time) at time zone 'Europe/Amsterdam' into starts
  from public.sessions s where s.id = new.session_id;
  new.late := now() > starts - interval '24 hours';
  if new.late then
    update public.profiles set strippen = strippen - 1 where id = new.user_id and strippen > 0;
    new.charged := found;
  end if;
  return new;
end;
$$;

create function public.refund_late_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.charged then
    update public.profiles set strippen = strippen + 1 where id = old.user_id;
  end if;
  return old;
end;
$$;

-- Only the database sets late/charged: drop whatever the client sent.
create function public.reset_cancel_flags() returns trigger
language plpgsql as $$
begin
  new.late := false;
  new.charged := false;
  return new;
end;
$$;

-- Triggers fire in name order: reset first, then charge.
create trigger a_reset_cancel_flags before insert on public.cancellations
  for each row execute function public.reset_cancel_flags();
create trigger b_charge_late_cancel before insert on public.cancellations
  for each row execute function public.charge_late_cancel();
create trigger refund_late_cancel after delete on public.cancellations
  for each row execute function public.refund_late_cancel();

-- Flags can't be changed afterwards (cancellations are only inserted and deleted).
revoke update on public.cancellations from authenticated, anon;

-- Strip changes made by these triggers run inside another trigger; allow them.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for server-side SQL (migrations, seed), which may change anything.
  if auth.uid() is not null and not public.is_admin() and pg_trigger_depth() = 1 and (
    new.role is distinct from old.role or new.strippen is distinct from old.strippen
    or new.total is distinct from old.total or new.email is distinct from old.email
  ) then
    raise exception 'Alleen de beheerder kan rol, e-mail of strippen aanpassen';
  end if;
  return new;
end;
$$;
