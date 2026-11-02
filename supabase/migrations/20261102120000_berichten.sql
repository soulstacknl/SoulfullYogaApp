-- Berichten: 1-op-1 chat between a customer and the studio, and news for everyone.
-- New messages and news (when the admin ticks "push") send a push notification.

/* ── Chat ──────────────────────────────────────────────────────────────── */

-- One conversation per customer; from_studio = written by the admin.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  from_studio boolean not null,
  body text not null check (length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.messages (customer_id, created_at);

-- Up to when each side has read the conversation ("Gelezen", unread counts).
create table public.chat_reads (
  customer_id uuid primary key references public.profiles (id) on delete cascade,
  customer_read_at timestamptz,
  studio_read_at timestamptz
);

alter table public.messages enable row level security;
alter table public.chat_reads enable row level security;

create policy "messages: own or admin reads" on public.messages for select to authenticated
  using (customer_id = auth.uid() or public.is_admin());
create policy "messages: customer or admin writes" on public.messages for insert to authenticated
  with check ((customer_id = auth.uid() and not from_studio) or (public.is_admin() and from_studio));
create policy "chat_reads: own or admin reads" on public.chat_reads for select to authenticated
  using (customer_id = auth.uid() or public.is_admin());

-- The server sets the time, so the order can't be faked.
create function public.stamp_message() returns trigger language plpgsql as $$
begin
  new.created_at := now();
  return new;
end;
$$;
create trigger stamp_message before insert on public.messages for each row execute function public.stamp_message();

-- Marks the conversation read for whoever calls it (customer or admin).
create function public.mark_chat_read(p_customer uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    insert into public.chat_reads (customer_id, studio_read_at) values (p_customer, now())
    on conflict (customer_id) do update set studio_read_at = now();
  elsif p_customer = auth.uid() then
    insert into public.chat_reads (customer_id, customer_read_at) values (p_customer, now())
    on conflict (customer_id) do update set customer_read_at = now();
  else
    raise exception 'Geen toegang tot dit gesprek';
  end if;
end;
$$;

/* ── Nieuws ────────────────────────────────────────────────────────────── */

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  body text not null check (length(btrim(body)) between 1 and 8000),
  push boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.news enable row level security;
create policy "news: everyone reads" on public.news for select to anon, authenticated using (true);
create policy "news: admin inserts" on public.news for insert to authenticated with check (public.is_admin());
create policy "news: admin updates" on public.news for update to authenticated using (public.is_admin());
create policy "news: admin deletes" on public.news for delete to authenticated using (public.is_admin());

-- Up to when the customer has seen the news (red dot on new items).
alter table public.profiles add column news_read_at timestamptz;

grant select on public.news to anon;
grant select, insert, update, delete on public.news to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.chat_reads to authenticated;
revoke execute on function public.mark_chat_read(uuid) from public, anon;
grant execute on function public.mark_chat_read(uuid) to authenticated;

/* ── Pushmeldingen ─────────────────────────────────────────────────────── */

-- Sends one notification to every registered device of these users (Expo push, 100 per request).
create function public.push_to(p_users uuid[], p_title text, p_body text, p_data jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  msgs jsonb;
begin
  select jsonb_agg(jsonb_build_object('to', t.token, 'title', p_title, 'body', left(p_body, 180),
                                      'sound', 'default', 'channelId', 'berichten', 'data', p_data))
  into msgs from public.push_tokens t where t.user_id = any (p_users);
  if msgs is null then return; end if;
  for i in 0 .. (jsonb_array_length(msgs) - 1) / 100 loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := (select jsonb_agg(m) from jsonb_array_elements(msgs) with ordinality x(m, n)
               where n > i * 100 and n <= (i + 1) * 100),
      headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
    );
  end loop;
end;
$$;
revoke execute on function public.push_to(uuid[], text, text, jsonb) from public, anon, authenticated;

create function public.push_new_message() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.from_studio then
    perform public.push_to(array[new.customer_id], 'Marjolijn', '💬 ' || new.body, jsonb_build_object('url', '/chat'));
  else
    perform public.push_to(
      array(select id from public.profiles where role = 'admin'),
      (select name from public.profiles where id = new.customer_id),
      '💬 ' || new.body,
      jsonb_build_object('url', '/chat?klant=' || new.customer_id));
  end if;
  return new;
end;
$$;
create trigger push_new_message after insert on public.messages for each row execute function public.push_new_message();

create function public.push_news() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.push then
    perform public.push_to(array(select id from public.profiles where role = 'student'),
      'Soulful Yoga', '📣 ' || new.title, jsonb_build_object('url', '/nieuws/' || new.id));
  end if;
  return new;
end;
$$;
create trigger push_news after insert on public.news for each row execute function public.push_news();

-- Live updates in the app and the portal.
alter publication supabase_realtime add table public.messages, public.chat_reads, public.news;
