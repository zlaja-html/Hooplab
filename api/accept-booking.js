import { isStaffAuthenticated } from './_auth.js';
import { sendEmail } from './_email.js';
import { acceptBooking, hasSupabaseConfig } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isStaffAuthenticated(req)) {
    return res.status(401).json({ error: 'Staff login required.' });
  }

  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  if (!body.id) {
    return res.status(400).json({ error: 'Missing booking id.' });
  }

  try {
    const booking = await acceptBooking(body.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    await sendEmail({
      to: [booking.email],
      subject: 'Your HoopLab session is confirmed',
      text: [
        `Hi ${booking.name},`,
        '',
        `Your HoopLab ${labelProgram(booking.program)} has been confirmed.`,
        `Appointment: ${booking.appointment}`,
        '',
        'Please arrive ready to train and bring your basketball gear.',
        '',
        'HoopLab Agency'
      ].join('\n')
    });

    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Accept booking failed', error);
    return res.status(500).json({ error: 'Could not accept booking.' });
  }
}

function labelProgram(program) {
  if (program === 'individual-workouts') {
    return 'individual workout';
  }

  if (program === 'group-sessions') {
    return 'group session';
  }

  return 'session';
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
