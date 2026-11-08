-- Afmeldingen for the admin: every cancellation by a customer (group or private lesson)
-- shows up under Reserveringen until the admin taps Akkoord. Akkoord only records that
-- the admin has seen it; the customer is already cancelled.

alter table public.cancellations
  add column created_at timestamptz not null default now(),
  add column seen_at timestamptz;
alter table public.private_lessons add column cancel_seen_at timestamptz;

-- What was cancelled before this list existed counts as seen.
update public.cancellations set seen_at = now();
update public.private_lessons set cancel_seen_at = now() where cancelled_at is not null;

-- Customers may not update cancellations (see late_cancel), so Akkoord goes through these.
create function public.acknowledge_cancellation(p_session text, p_date date, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen voor de beheerder'; end if;
  update public.cancellations set seen_at = now()
  where session_id = p_session and date = p_date and user_id = p_user and seen_at is null;
end;
$$;
revoke execute on function public.acknowledge_cancellation(text, date, uuid) from public, anon;
grant execute on function public.acknowledge_cancellation(text, date, uuid) to authenticated;

create function public.acknowledge_private_cancel(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen voor de beheerder'; end if;
  update public.private_lessons set cancel_seen_at = now() where id = p_id and cancelled_at is not null;
end;
$$;
revoke execute on function public.acknowledge_private_cancel(uuid) from public, anon;
grant execute on function public.acknowledge_private_cancel(uuid) to authenticated;

-- The admin's push now opens the list of afmeldingen.
create or replace function public.push_cancellation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.cancelled_by = 'klant' then
    perform public.push_to(public.admin_ids(),
      (select name from public.profiles where id = new.user_id) || ' meldt zich af',
      '✕ ' || public.lesson_label(new.session_id, new.date) || case when new.charged then ' · binnen 24 uur, 1 strip afgeschreven' else '' end,
      jsonb_build_object('url', '/admin/reserveringen?tab=afmeldingen'));
  end if;
  return new;
end;
$$;

create or replace function public.push_private_lesson() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.push_to(array[new.user_id], 'Privéles gepland',
      '🧘 ' || public.private_lesson_label(new.date, new.start_time) || ' met Marjolijn. Namasté!',
      jsonb_build_object('url', '/lessen'));
  elsif tg_op = 'UPDATE' and old.cancelled_at is null and new.cancelled_at is not null then
    perform public.push_to(public.admin_ids(),
      (select name from public.profiles where id = new.user_id) || ' meldt zich af',
      '✕ Privéles ' || public.private_lesson_label(new.date, new.start_time),
      jsonb_build_object('url', '/admin/reserveringen?tab=afmeldingen'));
  elsif tg_op = 'DELETE' and old.cancelled_at is null
    and old.date + old.start_time > (now() at time zone 'Europe/Amsterdam')
    -- Not when the whole account is being deleted.
    and exists (select 1 from public.profiles where id = old.user_id) then
    perform public.push_to(array[old.user_id], 'Privéles vervalt',
      '✕ ' || public.private_lesson_label(old.date, old.start_time) || ' gaat niet door.',
      jsonb_build_object('url', '/lessen'));
  end if;
  return null;
end;
$$;
