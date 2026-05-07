import { getStaffSession, isStaffAuthenticated } from './_auth.js';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  hasSupabaseConfig,
  listCalendarEvents,
  updateCalendarEvent
} from './_supabase.js';

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  if (!isStaffAuthenticated(req)) {
    return res.status(401).json({ error: 'Staff login required.' });
  }

  try {
    if (req.method === 'GET') {
      const events = await listCalendarEvents();
      return res.status(200).json({ events });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
    const staffUser = getStaffSession(req);

    if (req.method === 'POST') {
      const required = ['title', 'start_date', 'end_date'];
      const missing = required.filter(key => !body[key]);

      if (missing.length) {
        return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
      }

      const event = await createCalendarEvent({
        title: body.title,
        event_type: body.event_type || 'blocker',
        staff_owner: body.staff_owner || staffUser?.id || null,
        color: body.color || null,
        start_date: body.start_date,
        end_date: body.end_date,
        start_time: body.start_time || null,
        end_time: body.end_time || null,
        all_day: body.all_day !== false,
        location: body.location || null,
        notes: body.notes || null,
        recurrence: normalizeRecurrence(body.recurrence),
        active: body.active !== false
      });

      return res.status(200).json({ event });
    }

    if (req.method === 'PATCH') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing event id.' });
      }

      const updates = {};
      const fields = ['title', 'event_type', 'staff_owner', 'color', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'notes'];

      fields.forEach(field => {
        if (field in body) {
          updates[field] = body[field] || null;
        }
      });

      if ('all_day' in body) {
        updates.all_day = body.all_day !== false;
      }

      if ('active' in body) {
        updates.active = body.active === true;
      }

      if ('recurrence' in body) {
        updates.recurrence = normalizeRecurrence(body.recurrence);
      }

      const event = await updateCalendarEvent(body.id, updates);
      return res.status(200).json({ event });
    }

    if (req.method === 'DELETE') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing event id.' });
      }

      await deleteCalendarEvent(body.id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Calendar events API failed', error);
    return res.status(500).json({ error: 'Could not update calendar events.' });
  }
}

function normalizeRecurrence(recurrence) {
  const value = recurrence && typeof recurrence === 'object' ? recurrence : {};
  const frequency = String(value.frequency || 'none').toLowerCase();
  const allowed = new Set(['none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly']);

  return {
    frequency: allowed.has(frequency) ? frequency : 'none',
    until: value.until || null
  };
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
