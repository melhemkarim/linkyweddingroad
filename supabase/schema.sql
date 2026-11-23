-- Paste this whole file into Supabase → SQL Editor → Run. Once.

create extension if not exists pgcrypto;

create table if not exists public.wishes (
  id         uuid primary key default gen_random_uuid(),
  device_id  text not null,
  name       text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id         uuid primary key default gen_random_uuid(),
  device_id  text not null,
  name       text not null,
  path       text not null,
  created_at timestamptz not null default now()
);

create index if not exists wishes_device_idx on public.wishes (device_id);
create index if not exists photos_device_idx on public.photos (device_id);

-- Nobody can read or write these tables from the browser.
-- Only the website's server (with the secret key) can.
alter table public.wishes enable row level security;
alter table public.photos enable row level security;

-- Private storage for the portraits
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', false)
on conflict (id) do nothing;
