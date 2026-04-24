import { isStaffAuthenticated } from './_auth.js';
import { deleteBooking, hasSupabaseConfig, listBookingCounts, listBookings } from './_supabase.js';

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      if (req.query?.public === '1') {
        const counts = await listBookingCounts();
        return res.status(200).json({ counts });
      }

      if (!isStaffAuthenticated(req)) {
        return res.status(401).json({ error: 'Staff login required.' });
      }

      const bookings = await listBookings();
      return res.status(200).json({ bookings });
    }

    if (!isStaffAuthenticated(req)) {
      return res.status(401).json({ error: 'Staff login required.' });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

    if (req.method === 'DELETE') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing booking id.' });
      }

      await deleteBooking(body.id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Booking fetch failed', error);
    return res.status(500).json({ error: req.method === 'DELETE' ? 'Could not delete booking.' : 'Could not load bookings.' });
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
