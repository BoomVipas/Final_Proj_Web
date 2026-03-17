-- MedCare Supabase Schema
-- Apply in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- WARDS
create table if not exists wards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  floor int not null,
  room_range text not null,
  caregiver_name text,
  created_at timestamptz default now()
);

-- RESIDENTS
create table if not exists residents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_en text,
  room text not null,
  ward_id uuid references wards(id),
  photo_url text,
  allergies text[] default '{}',
  chronic_conditions text[] default '{}',
  flags jsonb default '{"crush": false, "liquid": false, "needs_assistance": false}',
  doctor_contact text,
  line_user_id text,
  is_active bool default true,
  created_at timestamptz default now()
);

-- MEDICATIONS (master list)
create table if not exists medications (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_en text,
  form text,
  dosage_unit text,
  notes text,
  is_active bool default true
);

-- RESIDENT MEDICATIONS (med schedule per resident)
create table if not exists resident_medications (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid references residents(id) on delete cascade,
  medication_id uuid references medications(id),
  dose_amount numeric not null,
  dose_unit text not null default 'เม็ด',
  schedule text[] not null,
  special_instructions text,
  requires_crushing bool default false,
  is_active bool default true,
  updated_at timestamptz default now()
);

-- STOCK
create table if not exists stock (
  id uuid primary key default uuid_generate_v4(),
  medication_id uuid references medications(id) unique,
  quantity numeric not null default 0,
  unit text default 'เม็ด',
  threshold_warn int default 14,
  threshold_critical int default 7,
  daily_consumption numeric default 0,
  updated_at timestamptz default now()
);

-- DISPENSE EVENTS (immutable audit log — no DELETE, no UPDATE)
create table if not exists dispense_events (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid references residents(id),
  meal text not null,
  day_of_week text,
  medications_json jsonb not null,
  total_pills int not null,
  staff_id uuid,
  dispensed_at timestamptz default now(),
  outcome text default 'success'
);

-- USERS
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  role text not null check (role in ('admin', 'nurse', 'caregiver', 'family')),
  display_name text,
  resident_id uuid references residents(id),
  created_at timestamptz default now()
);

-- WEEKLY FILL STATUS (tracks which residents are done this week)
create table if not exists weekly_fill_status (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid references residents(id),
  week_start date not null,
  is_filled bool default false,
  filled_at timestamptz,
  filled_by uuid references users(id),
  unique (resident_id, week_start)
);

create index if not exists idx_residents_ward_id on residents(ward_id);
create index if not exists idx_resident_medications_resident on resident_medications(resident_id);
create index if not exists idx_resident_medications_medication on resident_medications(medication_id);
create index if not exists idx_weekly_fill_status_week_start on weekly_fill_status(week_start);
create index if not exists idx_dispense_events_resident_dispensed_at on dispense_events(resident_id, dispensed_at desc);

-- Immutability guard for audit table
create or replace function prevent_dispense_events_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'dispense_events is immutable: % is not allowed', tg_op;
end;
$$;

drop trigger if exists trg_prevent_dispense_events_mutation on dispense_events;
create trigger trg_prevent_dispense_events_mutation
before update or delete on dispense_events
for each row execute function prevent_dispense_events_mutation();

-- Enable Realtime on key tables
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'resident_medications'
  ) then
    alter publication supabase_realtime add table resident_medications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'stock'
  ) then
    alter publication supabase_realtime add table stock;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'weekly_fill_status'
  ) then
    alter publication supabase_realtime add table weekly_fill_status;
  end if;
end $$;

-- RLS (enable now, tighten in phase 2)
alter table residents enable row level security;
alter table resident_medications enable row level security;
alter table dispense_events enable row level security;
alter table stock enable row level security;

-- Allow service role full access

drop policy if exists "service role full access" on residents;
create policy "service role full access"
on residents
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role full access" on resident_medications;
create policy "service role full access"
on resident_medications
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role full access" on dispense_events;
create policy "service role full access"
on dispense_events
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role full access" on stock;
create policy "service role full access"
on stock
for all
to service_role
using (true)
with check (true);
