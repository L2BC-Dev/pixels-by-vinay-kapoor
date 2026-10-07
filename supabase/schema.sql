-- Pixels booking schema (applied to Supabase project "pixels-bookings").
-- RLS on with no public policies; the app only calls the SECURITY DEFINER RPCs below.
create table if not exists public.booked_dates (
  date date primary key,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  names text not null,
  phone text not null,
  email text,
  event_dates date[] not null,
  city text,
  package text,
  guests text,
  message text
);

alter table public.booked_dates enable row level security;
alter table public.enquiries enable row level security;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.admin (id int primary key default 1, secret_hash text not null);
-- To set / rotate the /admin password:
--   insert into private.admin (id, secret_hash) values (1, extensions.crypt('NEW-PASSWORD', extensions.gen_salt('bf')))
--   on conflict (id) do update set secret_hash = excluded.secret_hash;

create or replace function private.check_admin(pw text) returns boolean
language sql security definer set search_path = '' as $$
  select exists (select 1 from private.admin a where a.secret_hash = extensions.crypt(pw, a.secret_hash));
$$;

create or replace function public.booked_dates_public() returns setof date
language sql security definer set search_path = '' stable as $$
  select date from public.booked_dates where date >= current_date order by date;
$$;

create or replace function public.submit_enquiry(p jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare
  ds date[];
  clash text;
begin
  select array_agg(x::date) into ds from jsonb_array_elements_text(p->'dates') x;
  if coalesce(trim(p->>'names'),'') = '' or coalesce(trim(p->>'phone'),'') = '' or ds is null then
    return 'invalid';
  end if;
  select string_agg(b.date::text, ', ') into clash from public.booked_dates b where b.date = any(ds);
  if clash is not null then return 'clash:' || clash; end if;
  insert into public.enquiries (names, phone, email, event_dates, city, package, guests, message)
  values (left(p->>'names',120), left(p->>'phone',30), left(p->>'email',160), ds[1:7], left(p->>'city',120), left(p->>'package',60), left(p->>'guests',30), left(p->>'message',2000));
  return 'ok';
end $$;

create or replace function public.admin_data(pw text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not private.check_admin(pw) then raise exception 'unauthorized' using errcode = '28000'; end if;
  return jsonb_build_object(
    'booked', coalesce((select jsonb_agg(jsonb_build_object('date', date, 'note', note) order by date) from public.booked_dates), '[]'::jsonb),
    'enquiries', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from (select * from public.enquiries order by created_at desc limit 200) e), '[]'::jsonb)
  );
end $$;

create or replace function public.admin_set_date(pw text, d date, block boolean, note text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.check_admin(pw) then raise exception 'unauthorized' using errcode = '28000'; end if;
  if block then
    insert into public.booked_dates (date, note) values (d, note) on conflict (date) do update set note = excluded.note;
  else
    delete from public.booked_dates where date = d;
  end if;
end $$;

revoke all on function private.check_admin(text) from public, anon, authenticated;
grant execute on function public.booked_dates_public() to anon, authenticated;
grant execute on function public.submit_enquiry(jsonb) to anon, authenticated;
grant execute on function public.admin_data(text) to anon, authenticated;
grant execute on function public.admin_set_date(text, date, boolean, text) to anon, authenticated;
