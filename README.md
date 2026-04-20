# Hooplab Landing Page

Static landing page for the Hooplab agency using a blue/white/black palette.

## Run locally
1) Clone the repo (already in this folder).
2) Open `index.html` in your browser.

## Customize
- Update copy in `index.html` (Home, About, Services, Tryouts, Tours, Apply).
- Tweak colors/spacing in `styles.css` (`:root` variables at the top).
- Adjust form fields in the Apply section if needed.

## Deployment
This is plain HTML/CSS/JS and can be hosted on any static host (GitHub Pages, Netlify, Vercel, S3, etc.). No build step required.

## Form backend (Apply)
- The Apply form posts to `/api/apply` (see `api/apply.js`).
- `api/apply.js` is a Vercel serverless handler. It validates required fields, saves appointment bookings to Supabase, and emails submissions to `contact@hooplab-agency.com` using Resend.
- Individual workout and group session submissions include the selected `appointment` slot in the email.
- Configure environment variable `RESEND_API_KEY` in your hosting platform (e.g., Vercel Project Settings > Environment Variables).
- Optional: set `RESEND_FROM` to a verified sender (e.g., `HoopLab Agency <no-reply@yourdomain.com>`). Without it, the handler uses `HoopLab Agency <onboarding@resend.dev>` as a fallback that does not require domain verification.
- Optional: set `DESTINATION_EMAIL` to override the inbox (default is `contact@hooplab-agency.com`). Useful if your Resend plan only allows sending to your own email before domain verification.
- Deploy on a host that supports serverless routes (e.g., Vercel). Static-only hosts without functions will not process the form.

## Appointments
- Edit available individual workout times in `appointments.js` under `HOOPLAB_WORKOUT_SLOTS`.
- Edit monthly group session dates in `appointments.js` under `HOOPLAB_GROUP_SESSION_SLOTS`.
- The public form shows the correct calendar when `Individual Workouts` or `Group Sessions` is selected.
- `employee-appointments.html` uses server-side staff login and reads shared bookings from Supabase.

## Supabase setup
Create a Supabase project, open the SQL editor, and run:

```sql
create table if not exists hooplab_bookings (
  id uuid primary key default gen_random_uuid(),
  program text not null,
  appointment text not null,
  appointment_date date,
  appointment_time time,
  name text not null,
  age integer,
  position text,
  experience text,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists hooplab_unique_individual_workout_slot
on hooplab_bookings (appointment)
where program = 'individual-workouts';

alter table hooplab_bookings
add column if not exists status text not null default 'pending';

alter table hooplab_bookings
add column if not exists accepted_at timestamptz;

alter table hooplab_bookings
add column if not exists refused_at timestamptz;

create table if not exists hooplab_availability (
  id uuid primary key default gen_random_uuid(),
  program text not null,
  appointment text not null,
  appointment_date date not null,
  appointment_time time not null,
  label text not null,
  note text,
  capacity integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

The unique index prevents two players from booking the same individual workout slot. Group sessions can receive multiple bookings; their visible capacity is controlled in `appointments.js`.
Staff can add and hide available appointments from `employee-appointments.html`; those slots are stored in `hooplab_availability`. Staff can accept or refuse player booking requests, and the player receives an email update.

Add these Vercel environment variables:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BOOKINGS_TABLE=hooplab_bookings
SUPABASE_AVAILABILITY_TABLE=hooplab_availability
STAFF_ACCESS_CODE=choose-a-private-staff-code
STAFF_SESSION_SECRET=choose-a-long-random-secret
RESEND_API_KEY=your_resend_key
DESTINATION_EMAIL=your_inbox
RESEND_FROM=HoopLab Agency <your_verified_sender>
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `STAFF_ACCESS_CODE`, and `STAFF_SESSION_SECRET` private. Do not put them in frontend JavaScript.

## Run locally
- Open `index.html` directly in your browser, or run a static server (e.g., `npx serve .`) from the repo root.
- The serverless route won’t run locally unless you emulate it; for local preview, form submission will hit `/api/apply` and fail unless you proxy or mock it.
