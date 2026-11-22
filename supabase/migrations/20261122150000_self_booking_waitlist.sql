-- Customers plan a lesson themselves when there is a spot (no approval any more); the
-- admin gets a push for information and sees it under Aanmeldingen (Akkoord = seen).
-- A full lesson has a waiting list. A customer's cancellation keeps holding the spot
-- until the admin confirms it (Akkoord); then everyone on the waiting list gets a push.

-- Bookings: who made them, when, and whether the admin has seen a customer's own booking.
alter table public.bookings
  add column created_at timestamptz not null default now(),
  add column booked_by text not null default 'beheer' check (booked_by in ('beheer', 'klant')),
  add column seen_at timestamptz;

-- Free spots on one lesson date: capacity minus the fixed roster, standing lessons,
-- bookings and open requests, minus cancellations - except a customer's cancellation
-- the admin has not confirmed yet: that spot stays taken.
create function public.lesson_available(p_session text, p_date date) returns integer
language sql stable security definer set search_path = public as $$
  with people as (
    select user_id from public.enrollments
    where session_id = p_session and p_date >= start_date and (p_date - start_date) % 7 = 0 and (p_date - start_date) / 7 < weeks
    union select user_id from public.bookings where session_id = p_session and date = p_date
    union select user_id from public.requests where session_id = p_session and date = p_date
  ), freed as (
    select user_id from public.cancellations
    where session_id = p_session and date = p_date and (cancelled_by = 'beheer' or seen_at is not null)
  )
  select coalesce((select capacity from public.capacity_overrides where session_id = p_session and date = p_date),
                  (select capacity from public.sessions where id = p_session), 0)
       - (select count(*) from public.roster_entries where session_id = p_session)::int
       - (select count(*) from people where user_id not in (select user_id from freed))::int;
$$;

create policy "bookings: own insert" on public.bookings for insert with check (user_id = auth.uid());

-- A customer's own booking: marked as such and only when there is a spot.
create function public.stamp_self_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.user_id = auth.uid() and not public.is_admin() then
    if new.approved_at is null and public.lesson_available(new.session_id, new.date) <= 0 then
      raise exception 'Deze les is vol. Zet je op de wachtlijst.';
    end if;
    new.booked_by := 'klant';
  else
    new.booked_by := 'beheer';
    new.seen_at := now();
  end if;
  return new;
end;
$$;
create trigger stamp_self_booking before insert on public.bookings for each row execute function public.stamp_self_booking();

-- Waiting list for a full lesson date.
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (session_id, date, user_id)
);
alter table public.waitlist enable row level security;
create policy "waitlist: own or admin reads" on public.waitlist for select using (user_id = auth.uid() or public.is_admin());
create policy "waitlist: own insert" on public.waitlist for insert with check (user_id = auth.uid());
create policy "waitlist: own or admin deletes" on public.waitlist for delete using (user_id = auth.uid() or public.is_admin());
grant select, insert, delete on public.waitlist to authenticated;
alter publication supabase_realtime add table public.waitlist;

-- After a booking: off the waiting list; push to the customer when the admin approved an
-- (old-style) request, to the admin when a customer planned the lesson themselves.
create or replace function public.push_request_approved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.waitlist where session_id = new.session_id and date = new.date and user_id = new.user_id;
  if new.approved_at is not null then
    perform public.push_to(array[new.user_id], 'Je les is goedgekeurd',
      '✓ ' || public.lesson_label(new.session_id, new.date) || ' · tot dan!', jsonb_build_object('url', '/lessen'));
  elsif new.booked_by = 'klant' then
    perform public.push_to(public.admin_ids(),
      (select name from public.profiles where id = new.user_id) || ' heeft zich aangemeld',
      '✓ ' || public.lesson_label(new.session_id, new.date) || ' · ter info',
      jsonb_build_object('url', '/admin/reserveringen?tab=aanmeldingen'));
  end if;
  return new;
end;
$$;

-- A spot came free: tell everyone on the waiting list of that (future) lesson.
create function public.notify_waitlist(p_session text, p_date date) returns void
language plpgsql security definer set search_path = public as $$
declare
  waiting uuid[];
begin
  if public.lesson_available(p_session, p_date) <= 0 then return; end if;
  if (select (p_date + start_time) <= (now() at time zone 'Europe/Amsterdam') from public.sessions where id = p_session) then return; end if;
  select array_agg(user_id) into waiting from public.waitlist where session_id = p_session and date = p_date;
  if waiting is null then return; end if;
  perform public.push_to(waiting, 'Er is een plek vrij',
    public.lesson_label(p_session, p_date) || ' · ga naar het rooster en tik op Les inplannen',
    jsonb_build_object('url', '/'));
  update public.waitlist set notified_at = now() where session_id = p_session and date = p_date;
end;
$$;
revoke execute on function public.notify_waitlist(text, date) from public, anon, authenticated;

-- Confirming a customer's cancellation releases the spot.
create or replace function public.acknowledge_cancellation(p_session text, p_date date, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen voor de beheerder'; end if;
  update public.cancellations set seen_at = now()
  where session_id = p_session and date = p_date and user_id = p_user and seen_at is null;
  if found then perform public.notify_waitlist(p_session, p_date); end if;
end;
$$;

-- The admin's own cancellation releases the spot at once.
create function public.waitlist_after_admin_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.cancelled_by = 'beheer' then perform public.notify_waitlist(new.session_id, new.date); end if;
  return new;
end;
$$;
create trigger waitlist_after_admin_cancel after insert on public.cancellations
  for each row execute function public.waitlist_after_admin_cancel();

-- The admin's push for a customer's cancellation asks to confirm it.
create or replace function public.push_cancellation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.cancelled_by = 'klant' then
    perform public.push_to(public.admin_ids(),
      (select name from public.profiles where id = new.user_id) || ' meldt zich af',
      '✕ ' || public.lesson_label(new.session_id, new.date)
        || case when new.charged then ' · binnen 24 uur, 1 strip afgeschreven' else '' end
        || ' · bevestig om de plek vrij te geven',
      jsonb_build_object('url', '/admin/reserveringen?tab=afmeldingen'));
  end if;
  return new;
end;
$$;
