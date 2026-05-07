alter table public.hooplab_availability
add column if not exists staff_owner text;

alter table public.hooplab_bookings
add column if not exists staff_owner text;

create table if not exists public.hooplab_calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'blocker',
  staff_owner text,
  color text,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  all_day boolean not null default true,
  location text,
  notes text,
  recurrence jsonb not null default '{"frequency":"none","until":null}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hooplab_calendar_events_start_date_idx
on public.hooplab_calendar_events (start_date, end_date);

alter table public.hooplab_calendar_events enable row level security;

revoke all on table public.hooplab_calendar_events from anon, authenticated;
