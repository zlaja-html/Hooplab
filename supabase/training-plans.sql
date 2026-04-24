create table if not exists public.hooplab_training_plans (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.hooplab_bookings(id) on delete cascade,
  availability_id uuid references public.hooplab_availability(id) on delete cascade,
  program text not null,
  title text not null,
  player_overview text not null,
  player_topics jsonb not null default '[]'::jsonb,
  prep_notes text,
  coach_notes text,
  drills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hooplab_training_plans
add column if not exists availability_id uuid references public.hooplab_availability(id) on delete cascade;

alter table public.hooplab_training_plans
alter column booking_id drop not null;

drop index if exists hooplab_training_plans_booking_key;

create unique index if not exists hooplab_training_plans_booking_key
on public.hooplab_training_plans (booking_id)
where booking_id is not null;

create unique index if not exists hooplab_training_plans_availability_key
on public.hooplab_training_plans (availability_id)
where availability_id is not null;

alter table public.hooplab_training_plans enable row level security;

revoke all on table public.hooplab_training_plans from anon, authenticated;
