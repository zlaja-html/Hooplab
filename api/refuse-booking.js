import { isStaffAuthenticated } from './_auth.js';
import { sendEmail } from './_email.js';
import { hasSupabaseConfig, refuseBooking } from './_supabase.js';

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
    const booking = await refuseBooking(body.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    await sendEmail({
      to: [booking.email],
      subject: 'HoopLab booking update',
      text: [
        `Hi ${booking.name},`,
        '',
        `Your requested HoopLab ${labelProgram(booking.program)} could not be confirmed for this appointment.`,
        `Requested appointment: ${booking.appointment}`,
        '',
        'Please choose another available time on the HoopLab website or contact us directly.',
        '',
        'HoopLab Agency'
      ].join('\n')
    });

    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Refuse booking failed', error);
    return res.status(500).json({ error: 'Could not refuse booking.' });
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
