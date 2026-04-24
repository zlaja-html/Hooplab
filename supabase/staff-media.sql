create table if not exists public.hooplab_staff_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  src text not null,
  filename text not null,
  is_builtin boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists hooplab_staff_media_filename_builtin_key
on public.hooplab_staff_media (filename)
where is_builtin = true;

insert into public.hooplab_staff_media (title, src, filename, is_builtin, hidden)
values
  ('Day 1 flyer', 'images/Day1Flyer.png', 'Day1Flyer.png', true, false),
  ('HoopLab sponsor post', 'images/sponzor-Hooplab.jpeg', 'sponzor-Hooplab.jpeg', true, false)
on conflict do nothing;

alter table public.hooplab_staff_media enable row level security;

revoke all on table public.hooplab_staff_media from anon, authenticated;
