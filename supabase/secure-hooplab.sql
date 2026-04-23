-- Harden HoopLab tables exposed through the Supabase Data API.
-- The app uses the service role key only from server-side Vercel functions,
-- so enabling RLS here will not break the existing flow.

alter table public.hooplab_bookings enable row level security;
alter table public.hooplab_availability enable row level security;

-- Deny direct API access from the anon/authenticated roles.
-- Server-side calls made with the service role key still work.
revoke all on table public.hooplab_bookings from anon, authenticated;
revoke all on table public.hooplab_availability from anon, authenticated;

-- No anon/authenticated policies are created on purpose.
-- If you later add client-side Supabase access, add minimal policies first.
