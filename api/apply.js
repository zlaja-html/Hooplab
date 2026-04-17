// Serverless handler for Vercel/Netlify style deployments.
// Validates input and emails applications to the HoopLab inbox via Resend.
import { createBooking, hasSupabaseConfig } from './_supabase.js';

const REQUIRED = ['program', 'name', 'age', 'position', 'experience', 'email', 'phone'];
const DESTINATION = process.env.DESTINATION_EMAIL || 'contact@hooplab-agency.com';
const DEFAULT_FROM = 'HoopLab Agency <onboarding@resend.dev>'; // Resend-provided sender that does not require your domain verification.
const BOOKING_PROGRAMS = new Set(['individual-workouts', 'group-sessions']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const missing = REQUIRED.filter(key => !body[key]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }

  // Honeypot spam guard
  if (body.extra_field) {
    return res.status(200).json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured. Set RESEND_API_KEY.' });
  }

  if (BOOKING_PROGRAMS.has(body.program)) {
    if (!body.appointment) {
      return res.status(400).json({ error: 'Appointment is required for this program.' });
    }

    if (!hasSupabaseConfig()) {
      return res.status(500).json({ error: 'Booking database is not configured.' });
    }

    try {
      const appointment = parseAppointment(body.appointment);
      const booking = await createBooking({
        program: body.program,
        appointment: body.appointment,
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        name: body.name,
        age: Number(body.age) || null,
        position: body.position,
        experience: body.experience,
        email: body.email,
        phone: body.phone
      });

      if (booking.conflict) {
        return res.status(409).json({ error: 'This appointment was just booked. Please choose another time.' });
      }
    } catch (error) {
      console.error('Booking save failed', error);
      return res.status(500).json({ error: 'Could not save booking. Please try another time or contact HoopLab.' });
    }
  }

  let from = process.env.RESEND_FROM || DEFAULT_FROM;
  // Basic validation to avoid 422 from Resend
  if (!/^[^<]*<[^@>]+@[^>]+>$/.test(from) && !/^[^@]+@[^@]+$/.test(from)) {
    console.warn('Invalid RESEND_FROM value, falling back to default sender');
    from = DEFAULT_FROM;
  }

  const text = [
    `New HoopLab application`,
    `Program: ${body.program}`,
    body.appointment ? `Appointment: ${body.appointment}` : null,
    `Name: ${body.name}`,
    `Age: ${body.age}`,
    `Position: ${body.position}`,
    `Experience: ${body.experience}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`
  ].filter(Boolean).join('\n');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [DESTINATION],
        subject: `New HoopLab ${body.program} application`,
        text
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Resend email send failed', resp.status, err);
      return res.status(502).json({ error: 'Email send failed', details: err });
    }

    return res.status(200).json({ ok: true, message: 'Application received' });
  } catch (e) {
    console.error('Resend email send failed (exception)', e);
    return res.status(502).json({ error: 'Email send failed', details: e.message });
  }
}

function parseAppointment(appointment) {
  const [date, time] = String(appointment || '').split(/\s+/);

  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    time: /^\d{2}:\d{2}$/.test(time) ? time : null
  };
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
