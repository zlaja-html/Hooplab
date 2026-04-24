import { isStaffAuthenticated } from './_auth.js';
import {
  createTrainingPlan,
  deleteTrainingPlan,
  getBooking,
  hasSupabaseConfig,
  listTrainingPlans,
  updateTrainingPlan
} from './_supabase.js';

const ALLOWED_PROGRAMS = new Set(['individual-workouts', 'group-sessions', 'tryouts']);

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  if (!isStaffAuthenticated(req)) {
    return res.status(401).json({ error: 'Staff login required.' });
  }

  try {
    if (req.method === 'GET') {
      const plans = await listTrainingPlans();
      return res.status(200).json({ plans });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

    if (req.method === 'POST') {
      const validation = await validatePlanPayload(body);

      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const payload = buildPlanPayload(validation.booking, body);
      const plan = body.id
        ? await updateTrainingPlan(body.id, payload)
        : await createTrainingPlan(payload);

      return res.status(200).json({ plan });
    }

    if (req.method === 'DELETE') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing plan id.' });
      }

      await deleteTrainingPlan(body.id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Training plan API failed', error);
    return res.status(500).json({ error: 'Could not update training plans.' });
  }
}

async function validatePlanPayload(body) {
  if (!body.booking_id) {
    return { error: 'Choose a booking first.' };
  }

  const booking = await getBooking(body.booking_id);

  if (!booking) {
    return { error: 'Selected booking could not be found.' };
  }

  if (!ALLOWED_PROGRAMS.has(booking.program)) {
    return { error: 'Training plans only support individual workouts, group sessions, and tryouts.' };
  }

  if (!body.title) {
    return { error: 'Add a plan title.' };
  }

  if (!String(body.player_overview || '').trim()) {
    return { error: 'Add the player-facing overview.' };
  }

  const drills = Array.isArray(body.drills) ? body.drills : [];
  const cleanDrills = drills
    .map(drill => ({
      title: String(drill?.title || '').trim(),
      minutes: Number(drill?.minutes) || 0,
      focus: String(drill?.focus || '').trim(),
      notes: String(drill?.notes || '').trim()
    }))
    .filter(drill => drill.title && drill.minutes > 0);

  if (!cleanDrills.length) {
    return { error: 'Add at least one drill with a duration.' };
  }

  return { booking };
}

function buildPlanPayload(booking, body) {
  const drills = (Array.isArray(body.drills) ? body.drills : [])
    .map(drill => ({
      title: String(drill?.title || '').trim(),
      minutes: Number(drill?.minutes) || 0,
      focus: String(drill?.focus || '').trim(),
      notes: String(drill?.notes || '').trim()
    }))
    .filter(drill => drill.title && drill.minutes > 0);

  const topics = String(body.player_topics || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  return {
    booking_id: booking.id,
    program: booking.program,
    title: String(body.title || '').trim(),
    player_overview: String(body.player_overview || '').trim(),
    player_topics: topics,
    prep_notes: String(body.prep_notes || '').trim() || null,
    coach_notes: String(body.coach_notes || '').trim() || null,
    drills,
    updated_at: new Date().toISOString()
  };
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
