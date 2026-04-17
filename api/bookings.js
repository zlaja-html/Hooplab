import { isStaffAuthenticated } from './_auth.js';
import { hasSupabaseConfig, listBookingCounts, listBookings } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  try {
    if (req.query?.public === '1') {
      const counts = await listBookingCounts();
      return res.status(200).json({ counts });
    }

    if (!isStaffAuthenticated(req)) {
      return res.status(401).json({ error: 'Staff login required.' });
    }

    const bookings = await listBookings();
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Booking fetch failed', error);
    return res.status(500).json({ error: 'Could not load bookings.' });
  }
}
