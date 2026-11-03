-- Account requests from the app: stored in the database (never lost), the admin
-- gets a push notification and a mail to info@soulfulyoga.nl, and creates the
-- account with one tap.

create table public.account_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  email text not null check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone text not null check (length(btrim(phone)) between 6 and 30),
  created_at timestamptz not null default now(),
  mailed_at timestamptz -- set by the mail function, so each request is mailed once
);
create unique index account_requests_email on public.account_requests (lower(email));
alter table public.account_requests enable row level security;
create policy "account_requests: admin reads" on public.account_requests for select to authenticated using (public.is_admin());
create policy "account_requests: admin deletes" on public.account_requests for delete to authenticated using (public.is_admin());
grant select, delete on public.account_requests to authenticated;

-- Guests send a request through this function (no direct insert), so the input is checked here.
create function public.request_account(p_name text, p_email text, p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare
  mail text := lower(btrim(coalesce(p_email, '')));
begin
  if btrim(coalesce(p_name, '')) = '' then raise exception 'Vul je naam in'; end if;
  if mail !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Vul een geldig e-mailadres in'; end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 8 then raise exception 'Vul een geldig telefoonnummer in'; end if;
  if exists (select 1 from public.profiles where lower(email) = mail) then
    raise exception 'Er bestaat al een account met dit e-mailadres. Gebruik "Wachtwoord vergeten" om in te loggen.';
  end if;
  insert into public.account_requests (name, email, phone) values (btrim(p_name), mail, btrim(p_phone))
  on conflict (lower(email)) do update set name = excluded.name, phone = excluded.phone, created_at = now();
end;
$$;
grant execute on function public.request_account(text, text, text) to anon, authenticated;

-- The admin turns a request into a customer (origin 'aanvraag'); the app then sends the password mail.
create function public.admin_approve_request(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  r public.account_requests;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan aanvragen goedkeuren'; end if;
  select * into r from public.account_requests where id = p_id;
  if r.id is null then raise exception 'Deze aanvraag bestaat niet meer'; end if;
  perform public.admin_create_customer(r.name, r.email, r.phone, 'aanvraag');
  delete from public.account_requests where id = p_id;
  return r.email;
end;
$$;
revoke execute on function public.admin_approve_request(uuid) from public, anon;
grant execute on function public.admin_approve_request(uuid) to authenticated;

-- On a new request: push to the admin and ask the mail function to mail info@soulfulyoga.nl.
-- Only the request id is passed; the function reads the request itself and mails it once.
create function public.notify_account_request() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.push_to(public.admin_ids(), 'Nieuwe accountaanvraag', '👤 ' || new.name || ' · ' || new.email,
    jsonb_build_object('url', '/admin/klanten'));
  perform net.http_post(
    url := 'https://wqvtjchmoapkiypaqcee.supabase.co/functions/v1/account-request-mail',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$;
create trigger notify_account_request after insert on public.account_requests
  for each row execute function public.notify_account_request();

alter publication supabase_realtime add table public.account_requests;

-- The mail function reads and marks requests with the service role.
grant select, update on public.account_requests to service_role;
