import { isStaffAuthenticated } from './_auth.js';
import { sendEmail } from './_email.js';
import {
  getAvailability,
  getBooking,
  getTrainingPlan,
  hasSupabaseConfig
} from './_supabase.js';

const PLAN_DESTINATIONS = {
  zlatan: 'zlaja.077@gmail.com',
  harun: 'boeblingen.panthers.info@gmail.com'
};

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
    return res.status(400).json({ error: 'Missing training plan id.' });
  }

  try {
    const plan = await getTrainingPlan(body.id);

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found.' });
    }

    const target = await loadPlanTarget(plan);

    const recipient = resolveRecipient(body.recipient);

    await sendEmail({
      to: [recipient.email],
      subject: `HoopLab training plan: ${plan.title}`,
      text: buildPlanText(plan, target),
      html: buildPlanHtml(plan, target)
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Send training plan failed', error);
    return res.status(500).json({ error: 'Could not send training plan.' });
  }
}

function resolveRecipient(value) {
  const key = value === 'harun' ? 'harun' : 'zlatan';
  return {
    key,
    email: PLAN_DESTINATIONS[key]
  };
}

async function loadPlanTarget(plan) {
  if (plan.availability_id) {
    const slot = await getAvailability(plan.availability_id);
    return {
      type: 'availability',
      label: slot ? slotLabel(slot) : 'Detached workout slot'
    };
  }

  if (plan.booking_id) {
    const booking = await getBooking(plan.booking_id);
    return {
      type: 'booking',
      label: booking ? bookingLabel(booking) : 'Detached tryout request'
    };
  }

  return { type: 'none', label: 'Detached target' };
}

function buildPlanText(plan, target) {
  const drills = Array.isArray(plan.drills) ? plan.drills : [];
  const topics = Array.isArray(plan.player_topics) ? plan.player_topics : [];

  return [
    `Training plan: ${plan.title}`,
    `Program: ${labelProgram(plan.program)}`,
    `Attached to: ${target.label}`,
    `Total time: ${totalMinutes(drills)} min`,
    '',
    'Player overview',
    plan.player_overview || '-',
    '',
    'Player topics',
    topics.length ? topics.map(topic => `- ${topic}`).join('\n') : '-',
    '',
    'Prep and equipment',
    plan.prep_notes || '-',
    '',
    'Coach notes',
    plan.coach_notes || '-',
    '',
    'Drill plan',
    drills.length ? drills.map((drill, index) => [
      `${index + 1}. ${drill.title} (${Number(drill.minutes) || 0} min)`,
      drill.focus ? `Focus: ${drill.focus}` : null,
      drill.notes ? `Notes: ${drill.notes}` : null
    ].filter(Boolean).join('\n')).join('\n\n') : '-',
    '',
    'HoopLab Agency'
  ].join('\n');
}

function buildPlanHtml(plan, target) {
  const drills = Array.isArray(plan.drills) ? plan.drills : [];
  const topics = Array.isArray(plan.player_topics) ? plan.player_topics : [];

  return `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;line-height:1.5;padding:24px;background:#f5f7fb;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #d8e0ea;border-radius:14px;padding:28px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;color:#16735f;">HoopLab training plan</p>
        <h1 style="margin:0 0 16px;font-size:30px;line-height:1.1;">${escapeHtml(plan.title || 'Untitled plan')}</h1>
        <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">
          <tr><td style="padding:8px 0;color:#65758b;">Program</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(labelProgram(plan.program))}</td></tr>
          <tr><td style="padding:8px 0;color:#65758b;">Attached to</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(target.label)}</td></tr>
          <tr><td style="padding:8px 0;color:#65758b;">Total time</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(String(totalMinutes(drills)))} min</td></tr>
        </table>

        ${sectionHtml('Player overview', `<p style="margin:0;">${escapeHtml(plan.player_overview || '-')}</p>`)}
        ${sectionHtml('Player topics', topics.length ? `<ul style="margin:0;padding-left:18px;">${topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>` : '<p style="margin:0;">-</p>')}
        ${sectionHtml('Prep and equipment', `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(plan.prep_notes || '-')}</p>`)}
        ${sectionHtml('Coach notes', `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(plan.coach_notes || '-')}</p>`)}
        ${sectionHtml('Drill plan', drills.length ? `
          <div style="display:grid;gap:12px;">
            ${drills.map((drill, index) => `
              <div style="border:1px solid #d8e0ea;border-radius:10px;padding:14px 16px;background:#fbfdff;">
                <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                  <strong>${index + 1}. ${escapeHtml(drill.title || 'Untitled drill')}</strong>
                  <span style="font-weight:800;color:#155eef;">${escapeHtml(String(Number(drill.minutes) || 0))} min</span>
                </div>
                ${drill.focus ? `<p style="margin:8px 0 0;"><strong>Focus:</strong> ${escapeHtml(drill.focus)}</p>` : ''}
                ${drill.notes ? `<p style="margin:8px 0 0;white-space:pre-wrap;"><strong>Notes:</strong> ${escapeHtml(drill.notes)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p style="margin:0;">-</p>')}
      </div>
    </div>
  `;
}

function sectionHtml(title, body) {
  return `
    <section style="margin:0 0 22px;">
      <h2 style="margin:0 0 10px;font-size:16px;color:#155eef;">${title}</h2>
      ${body}
    </section>
  `;
}

function totalMinutes(drills) {
  return drills.reduce((sum, drill) => sum + (Number(drill.minutes) || 0), 0);
}

function slotLabel(slot) {
  const appointment = slot.appointment || `${slot.appointment_date || ''} ${String(slot.appointment_time || '').slice(0, 5)}`.trim();
  return `${labelProgram(slot.program)} - ${slot.label || appointment} - ${appointment}`;
}

function bookingLabel(booking) {
  return `${labelProgram(booking.program)} - ${booking.name || 'Unknown player'} - ${formatBookingAppointment(booking)}`;
}

function formatBookingAppointment(booking) {
  if (booking.program === 'tryouts') {
    return 'Tryout request';
  }

  if (booking.appointment_date && booking.appointment_time) {
    return `${booking.appointment_date} ${booking.appointment_time}`;
  }

  return booking.appointment || 'No appointment';
}

function labelProgram(program) {
  if (program === 'individual-workouts') {
    return 'Individual workout';
  }

  if (program === 'group-sessions') {
    return 'Group session';
  }

  if (program === 'tryouts') {
    return 'Tryout';
  }

  return 'Session';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
