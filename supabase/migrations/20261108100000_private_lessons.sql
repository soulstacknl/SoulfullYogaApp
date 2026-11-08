-- Private lessons: the admin plans a one-to-one lesson with a customer on a date and time.
-- They are not part of the timetable and use no strips; only the customer and the admin
-- see them. The customer gets a push when one is planned or removed and a reminder
-- 24 hours before; the customer can cancel until the start, and the admin then gets a push.

create table public.private_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  cancelled_at timestamptz,
  reminded_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index private_lessons_user on public.private_lessons (user_id, date);

alter table public.private_lessons enable row level security;
create policy "private lessons: own or admin reads" on public.private_lessons for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "private lessons: admin writes" on public.private_lessons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.private_lessons to authenticated;

alter publication supabase_realtime add table public.private_lessons;

-- "di 10 nov 14.00"
create function public.private_lesson_label(p_date date, p_start time) returns text
language sql immutable set search_path = public as $$
  select (array['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'])[extract(isodow from p_date)]
    || ' ' || extract(day from p_date)
    || ' ' || (array['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'])[extract(month from p_date)]
    || ' ' || to_char(p_start, 'HH24.MI');
$$;

-- The customer cancels their own private lesson, until it starts.
create function public.cancel_private_lesson(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.private_lessons set cancelled_at = now()
  where id = p_id and user_id = auth.uid() and cancelled_at is null
    and date + start_time > (now() at time zone 'Europe/Amsterdam');
  if not found then raise exception 'Deze privéles kan niet meer worden afgemeld'; end if;
end;
$$;
revoke execute on function public.cancel_private_lesson(uuid) from public, anon;
grant execute on function public.cancel_private_lesson(uuid) to authenticated;

create function public.push_private_lesson() returns trigger
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
      jsonb_build_object('url', '/admin/rooster-beheer'));
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
create trigger push_private_lesson after insert or update or delete on public.private_lessons
  for each row execute function public.push_private_lesson();

-- Reminder 24 hours before, like send_lesson_reminders does for group lessons.
create function public.send_private_lesson_reminders() returns integer
language plpgsql security definer set search_path = public, extensions as $$
declare
  local_now timestamp := now() at time zone 'Europe/Amsterdam';
  r record;
  sent integer := 0;
begin
  for r in
    update public.private_lessons set reminded_at = now()
    where cancelled_at is null and reminded_at is null
      and date + start_time > local_now + interval '23 hours'
      and date + start_time <= local_now + interval '24 hours'
    returning id, user_id, start_time
  loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := (select jsonb_agg(jsonb_build_object(
          'to', t.token, 'title', 'Soulful Yoga',
          'body', format('Morgen om %s heb je je privéles. Namasté 🧘', to_char(r.start_time, 'HH24.MI')),
          'sound', 'default', 'channelId', 'lessen',
          'data', jsonb_build_object('url', '/lessen', 'uid', t.user_id)))
        from public.push_tokens t where t.user_id = r.user_id),
      headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
    ) where exists (select 1 from public.push_tokens t where t.user_id = r.user_id);
    sent := sent + 1;
  end loop;
  return sent;
end;
$$;
revoke execute on function public.send_private_lesson_reminders() from public, anon, authenticated;

select cron.schedule('private-lesson-reminders', '*/15 * * * *', 'select public.send_private_lesson_reminders()');
