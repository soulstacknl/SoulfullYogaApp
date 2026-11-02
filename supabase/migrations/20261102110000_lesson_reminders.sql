-- Push reminder 24 hours before each lesson a customer is scheduled for.
-- The app registers its Expo push token; pg_cron runs send_lesson_reminders()
-- every 15 minutes, which posts to Expo's push service via pg_net.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- One row per device. A token belongs to whoever logged in on that device last.
create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null default '',
  updated_at timestamptz not null default now()
);
create index on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;
create policy "push_tokens: own reads" on public.push_tokens for select to authenticated using (user_id = auth.uid());

create function public.register_push_token(p_token text, p_platform text default '') returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  insert into public.push_tokens (token, user_id, platform) values (p_token, auth.uid(), coalesce(p_platform, ''))
  on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end;
$$;

-- On logout: this device stops getting the previous user's reminders.
create function public.unregister_push_token(p_token text) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.push_tokens where token = p_token and user_id = auth.uid();
end;
$$;

revoke execute on function public.register_push_token(text, text) from public, anon;
revoke execute on function public.unregister_push_token(text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;
grant select on public.push_tokens to authenticated;

-- Which reminders went out, so each customer gets one per lesson.
create table public.lesson_reminders (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (session_id, date, user_id)
);
alter table public.lesson_reminders enable row level security;  -- server only, no policies

-- Customers scheduled for a lesson: standing lesson or approved booking, not
-- cancelled, lesson not closed. Mirrors statusFor/activeOn in lib/schedule.ts.
create function public.lesson_participants(p_session text, p_date date) returns setof uuid
language sql stable security definer set search_path = public as $$
  select p.user_id from (
    select e.user_id from public.enrollments e
    where e.session_id = p_session and p_date >= e.start_date
      and (p_date - e.start_date) % 7 = 0 and (p_date - e.start_date) / 7 < e.weeks
    union
    select b.user_id from public.bookings b where b.session_id = p_session and b.date = p_date
  ) p
  where not exists (select 1 from public.cancellations c
                    where c.session_id = p_session and c.date = p_date and c.user_id = p.user_id)
    and not exists (select 1 from public.closures z
                    where p_date between z.from_date and z.to_date and (z.session_id is null or z.session_id = p_session));
$$;
revoke execute on function public.lesson_participants(text, date) from public, anon, authenticated;

create function public.send_lesson_reminders() returns integer
language plpgsql security definer set search_path = public, extensions as $$
declare
  local_now timestamp := now() at time zone 'Europe/Amsterdam';
  messages jsonb;
  sent integer;
begin
  -- Lessons starting 23–24 hours from now; the hour of slack covers a missed run.
  with lessons as (
    select s.id as session_id, d::date as date, s.start_time,
      case s.style when 'yin' then 'Yin Yoga' when 'flow' then 'Flow Yoga' else 'Gentle Yoga' end as label
    from public.sessions s
    cross join generate_series(local_now::date, local_now::date + 1, interval '1 day') d
    where extract(isodow from d) = array_position(
        array['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'], s.day)
      and (s.from_date is null or d::date >= s.from_date)
      and (s.until_date is null or d::date <= s.until_date)
      and d::date + s.start_time > local_now + interval '23 hours'
      and d::date + s.start_time <= local_now + interval '24 hours'
  ),
  due as (
    insert into public.lesson_reminders (session_id, date, user_id)
    select l.session_id, l.date, u from lessons l, public.lesson_participants(l.session_id, l.date) u
    on conflict do nothing
    returning session_id, date, user_id
  )
  select jsonb_agg(jsonb_build_object(
      'to', t.token,
      'title', 'Soulful Yoga',
      'body', format('Morgen om %s heb je %s. Namasté 🧘', to_char(l.start_time, 'HH24.MI'), l.label),
      'sound', 'default',
      'channelId', 'lessen',
      'data', jsonb_build_object('sessionId', l.session_id, 'date', l.date)
    )), count(distinct (due.session_id, due.date, due.user_id))
  into messages, sent
  from due
  join lessons l on l.session_id = due.session_id and l.date = due.date
  join public.push_tokens t on t.user_id = due.user_id;

  if messages is not null then
    -- Expo accepts up to 100 messages per request.
    for i in 0 .. (jsonb_array_length(messages) - 1) / 100 loop
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        body := (select jsonb_agg(m) from (select m from jsonb_array_elements(messages) with ordinality x(m, n)
                                           where n > i * 100 and n <= (i + 1) * 100) b),
        headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
      );
    end loop;
  end if;
  return coalesce(sent, 0);
end;
$$;
revoke execute on function public.send_lesson_reminders() from public, anon, authenticated;

select cron.schedule('lesson-reminders', '*/15 * * * *', 'select public.send_lesson_reminders()');
