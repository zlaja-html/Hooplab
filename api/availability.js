import { isStaffAuthenticated } from './_auth.js';
import {
  createAvailability,
  deleteAvailability,
  hasSupabaseConfig,
  listAvailability,
  updateAvailability
} from './_supabase.js';

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      const activeOnly = req.query?.public === '1';

      if (!activeOnly && !isStaffAuthenticated(req)) {
        return res.status(401).json({ error: 'Staff login required.' });
      }

      const availability = await listAvailability({ activeOnly });
      return res.status(200).json({ availability });
    }

    if (!isStaffAuthenticated(req)) {
      return res.status(401).json({ error: 'Staff login required.' });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

    if (req.method === 'POST') {
      const required = ['program', 'appointment_date', 'appointment_time', 'label'];
      const missing = required.filter(key => !body[key]);

      if (missing.length) {
        return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
      }

      const appointment = `${body.appointment_date} ${body.appointment_time}`;
      const capacity = Math.max(1, Number(body.capacity) || 1);
      const slot = await createAvailability({
        program: body.program,
        appointment,
        appointment_date: body.appointment_date,
        appointment_time: body.appointment_time,
        label: body.label,
        note: body.note || null,
        capacity,
        active: body.active !== false
      });

      return res.status(200).json({ slot });
    }

    if (req.method === 'PATCH') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing slot id.' });
      }

      const updates = {};

      if (typeof body.active === 'boolean') {
        updates.active = body.active;
      }

      if (body.capacity) {
        updates.capacity = Math.max(1, Number(body.capacity) || 1);
      }

      const slot = await updateAvailability(body.id, updates);
      return res.status(200).json({ slot });
    }

    if (req.method === 'DELETE') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing slot id.' });
      }

      await deleteAvailability(body.id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Availability API failed', error);
    return res.status(500).json({ error: 'Could not update availability.' });
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
