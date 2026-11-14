-- AROHANA registration table
-- Run this entire script in Supabase -> SQL Editor -> New query.
-- It intentionally does not enable public SELECT access to student records.

create extension if not exists pgcrypto;

create table if not exists public.arohana_registrations (
  id uuid primary key,
  full_name text not null check (char_length(trim(full_name)) between 2 and 80),
  roll_number text not null unique
    check (roll_number = upper(roll_number))
    check (roll_number ~ '^KUB[A-Z0-9]{3,21}$'),
  created_at timestamptz not null default now()
);

alter table public.arohana_registrations enable row level security;

-- Remove/recreate only this named policy so this script can be safely rerun.
drop policy if exists "Anyone can submit AROHANA registration" on public.arohana_registrations;

create policy "Anyone can submit AROHANA registration"
on public.arohana_registrations
for insert
to anon, authenticated
with check (
  char_length(trim(full_name)) between 2 and 80
  and roll_number = upper(roll_number)
  and roll_number ~ '^KUB[A-Z0-9]{3,21}$'
);

grant insert on table public.arohana_registrations to anon, authenticated;

-- Do not add a public SELECT policy. Review registrations inside Supabase Table Editor.
