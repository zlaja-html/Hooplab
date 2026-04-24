const staffForm = document.getElementById('staff-form');
const staffLogin = document.getElementById('staff-login');
const staffDashboard = document.getElementById('staff-dashboard');
const staffHint = document.getElementById('staff-hint');
const list = document.getElementById('appointment-list');
const availabilityForm = document.getElementById('availability-form');
const availabilityHint = document.getElementById('availability-hint');
const availabilityList = document.getElementById('availability-list');
const trainingPlanForm = document.getElementById('training-plan-form');
const trainingPlanIdInput = document.getElementById('training-plan-id');
const trainingPlanBooking = document.getElementById('training-plan-booking');
const trainingPlanHint = document.getElementById('training-plan-hint');
const trainingPlanList = document.getElementById('training-plan-list');
const trainingDrills = document.getElementById('training-drills');
const trainingPlanTotal = document.getElementById('training-plan-total');
const addDrillButton = document.getElementById('add-drill');
const resetTrainingPlanButton = document.getElementById('reset-training-plan');
const deleteTrainingPlanButton = document.getElementById('delete-training-plan');
const lockButton = document.getElementById('lock-staff');
let currentBookings = [];
let currentAvailability = [];
let currentTrainingPlans = [];

async function showDashboard() {
  staffLogin.hidden = true;
  staffDashboard.hidden = false;
  staffHint.textContent = '';
  staffHint.className = 'form-hint';
  await Promise.all([loadAvailability(), loadBookings(), loadTrainingPlans()]);
}

async function loadBookings() {
  list.innerHTML = '<p class="form-hint">Loading appointments...</p>';

  try {
    const response = await fetch('/api/bookings', { credentials: 'include' });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      lockDashboard();
      staffHint.className = 'form-hint error';
      staffHint.textContent = result.error || 'Staff login required.';
      return;
    }

    currentBookings = result.bookings || [];
    renderBookings(currentBookings);
    renderBookingOptions();
    renderTrainingPlans(currentTrainingPlans);
  } catch {
    list.innerHTML = '<p class="form-hint error">Could not load appointments.</p>';
  }
}

async function loadAvailability() {
  availabilityList.innerHTML = '<p class="form-hint">Loading availability...</p>';

  try {
    const response = await fetch('/api/availability', { credentials: 'include' });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      availabilityList.innerHTML = `<p class="form-hint error">${escapeHtml(result.error || 'Could not load availability.')}</p>`;
      return;
    }

    currentAvailability = result.availability || [];
    renderAvailability(currentAvailability);
  } catch {
    availabilityList.innerHTML = '<p class="form-hint error">Could not load availability.</p>';
  }
}

async function loadTrainingPlans() {
  trainingPlanList.innerHTML = '<p class="form-hint">Loading training plans...</p>';

  try {
    const response = await fetch('/api/training-plans', { credentials: 'include' });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      trainingPlanList.innerHTML = `<p class="form-hint error">${escapeHtml(result.error || 'Could not load training plans.')}</p>`;
      return;
    }

    currentTrainingPlans = result.plans || [];
    renderTrainingPlans(currentTrainingPlans);
    renderBookings(currentBookings);
    renderBookingOptions();
  } catch {
    trainingPlanList.innerHTML = '<p class="form-hint error">Could not load training plans.</p>';
  }
}

async function lockDashboard() {
  await fetch('/api/staff-logout', {
    method: 'POST',
    credentials: 'include'
  }).catch(() => {});

  staffLogin.hidden = false;
  staffDashboard.hidden = true;
}

function renderBookings(bookings) {
  const sorted = [...bookings].sort((a, b) => {
    return String(a.appointment).localeCompare(String(b.appointment));
  });
  const groups = [
    ['pending', 'Pending requests'],
    ['accepted', 'Accepted bookings'],
    ['refused', 'Refused bookings']
  ];

  list.innerHTML = '';

  if (!sorted.length) {
    const empty = document.createElement('p');
    empty.className = 'form-hint';
    empty.textContent = 'No appointments have been booked yet.';
    list.append(empty);
    return;
  }

  groups.forEach(([status, title]) => {
    const groupBookings = sorted.filter(booking => (booking.status || 'pending') === status);

    if (!groupBookings.length) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'booking-group';
    section.innerHTML = `<h4>${escapeHtml(title)}</h4>`;

    groupBookings.forEach(booking => {
      const plan = currentTrainingPlans.find(item => item.booking_id === booking.id);
      const card = document.createElement('article');
      card.className = `appointment-card status-${escapeHtml(status)}`;
      card.innerHTML = `
        <div class="appointment-card-head">
          <strong>${escapeHtml(formatAppointment(booking))}</strong>
          <span class="status-pill ${escapeHtml(status)}">${escapeHtml(status)}</span>
        </div>
        <span>${escapeHtml(labelProgram(booking.program || 'appointment'))}</span>
        <span>${escapeHtml(booking.name || 'Unknown player')} - ${escapeHtml(booking.position || 'Position missing')} - Age ${escapeHtml(booking.age || '-')}</span>
        <span>${escapeHtml(booking.email || '')}</span>
        <span>${escapeHtml(booking.phone || '')}</span>
        <span>${escapeHtml(booking.experience || '')}</span>
        ${plan ? renderPlanSnippet(plan) : ''}
        <div class="booking-actions">
          ${status === 'pending' ? `
            <button class="button primary" type="button" data-accept-booking="${escapeHtml(booking.id)}">Accept and email player</button>
            <button class="button danger" type="button" data-refuse-booking="${escapeHtml(booking.id)}">Refuse and email player</button>
          ` : ''}
          ${supportsTrainingPlan(booking.program) ? `
            <button class="button secondary light" type="button" data-edit-plan-booking="${escapeHtml(booking.id)}">
              ${plan ? 'Edit training plan' : 'Attach training plan'}
            </button>
          ` : ''}
        </div>
      `;
      section.append(card);
    });

    list.append(section);
  });

  list.querySelectorAll('[data-accept-booking]').forEach(button => {
    button.addEventListener('click', () => acceptBooking(button.dataset.acceptBooking, button));
  });

  list.querySelectorAll('[data-refuse-booking]').forEach(button => {
    button.addEventListener('click', () => refuseBooking(button.dataset.refuseBooking, button));
  });

  list.querySelectorAll('[data-edit-plan-booking]').forEach(button => {
    button.addEventListener('click', () => loadPlanIntoForm(button.dataset.editPlanBooking));
  });
}

function renderAvailability(availability) {
  const sorted = [...availability].sort((a, b) => {
    return String(a.appointment).localeCompare(String(b.appointment));
  });

  availabilityList.innerHTML = '';

  if (!sorted.length) {
    const empty = document.createElement('p');
    empty.className = 'form-hint';
    empty.textContent = 'No available appointments have been added yet.';
    availabilityList.append(empty);
    return;
  }

  sorted.forEach(slot => {
    const card = document.createElement('article');
    card.className = 'appointment-card';
    card.innerHTML = `
      <strong>${escapeHtml(slot.appointment || '')}</strong>
      <span>${escapeHtml(labelProgram(slot.program))} - Capacity ${escapeHtml(slot.capacity || 1)} - ${slot.active ? 'Active' : 'Hidden'}</span>
      <span>${escapeHtml(slot.label || '')}${slot.note ? ` - ${escapeHtml(slot.note)}` : ''}</span>
      <div class="booking-actions">
        <button class="button secondary light" type="button" data-toggle-slot="${escapeHtml(slot.id)}" data-active="${slot.active ? 'false' : 'true'}">
          ${slot.active ? 'Hide appointment' : 'Show appointment'}
        </button>
        <button class="button danger" type="button" data-delete-slot="${escapeHtml(slot.id)}">
          Delete appointment
        </button>
      </div>
    `;
    availabilityList.append(card);
  });

  availabilityList.querySelectorAll('[data-toggle-slot]').forEach(button => {
    button.addEventListener('click', () => toggleAvailability(button.dataset.toggleSlot, button.dataset.active === 'true'));
  });

  availabilityList.querySelectorAll('[data-delete-slot]').forEach(button => {
    button.addEventListener('click', () => deleteAvailability(button.dataset.deleteSlot, button));
  });
}

function renderTrainingPlans(plans) {
  trainingPlanList.innerHTML = '';

  if (!plans.length) {
    const empty = document.createElement('p');
    empty.className = 'form-hint';
    empty.textContent = 'No training plans have been saved yet.';
    trainingPlanList.append(empty);
    return;
  }

  plans.forEach(plan => {
    const booking = currentBookings.find(item => item.id === plan.booking_id);
    const totalMinutes = totalPlanMinutes(plan.drills);
    const card = document.createElement('article');
    card.className = 'appointment-card';
    card.innerHTML = `
      <div class="appointment-card-head">
        <strong>${escapeHtml(plan.title || 'Untitled plan')}</strong>
        <span class="status-pill accepted">${escapeHtml(totalMinutes)} min</span>
      </div>
      <span>${escapeHtml(labelProgram(plan.program || 'appointment'))}</span>
      <span>${escapeHtml(bookingLabel(booking))}</span>
      <span>${escapeHtml(plan.player_overview || '')}</span>
      ${renderTopicSummary(plan.player_topics)}
      <div class="booking-actions">
        <button class="button secondary light" type="button" data-edit-plan="${escapeHtml(plan.id)}">Edit plan</button>
        <button class="button danger" type="button" data-delete-plan="${escapeHtml(plan.id)}">Delete</button>
      </div>
    `;
    trainingPlanList.append(card);
  });

  trainingPlanList.querySelectorAll('[data-edit-plan]').forEach(button => {
    button.addEventListener('click', () => loadPlanIntoFormById(button.dataset.editPlan));
  });

  trainingPlanList.querySelectorAll('[data-delete-plan]').forEach(button => {
    button.addEventListener('click', () => deleteTrainingPlan(button.dataset.deletePlan, button));
  });
}

function renderBookingOptions() {
  if (!trainingPlanBooking) {
    return;
  }

  const eligibleBookings = currentBookings
    .filter(booking => supportsTrainingPlan(booking.program))
    .filter(booking => booking.status !== 'refused');

  const currentValue = trainingPlanBooking.value;
  trainingPlanBooking.innerHTML = '<option value="">Choose a booking</option>';

  eligibleBookings.forEach(booking => {
    const option = document.createElement('option');
    option.value = booking.id;
    option.textContent = bookingLabel(booking);
    trainingPlanBooking.append(option);
  });

  trainingPlanBooking.value = eligibleBookings.some(booking => booking.id === currentValue) ? currentValue : '';
}

function renderPlanSnippet(plan) {
  return `
    <div class="plan-attachment">
      <strong>${escapeHtml(plan.title || 'Training plan attached')}</strong>
      <span>${escapeHtml(totalPlanMinutes(plan.drills))} minutes - ${escapeHtml((plan.player_topics || []).slice(0, 2).join(' | ') || 'Overview ready')}</span>
    </div>
  `;
}

function renderTopicSummary(topics) {
  const safeTopics = Array.isArray(topics) ? topics : [];

  if (!safeTopics.length) {
    return '<span>Player summary ready.</span>';
  }

  return `<span>${escapeHtml(safeTopics.join(' | '))}</span>`;
}

function supportsTrainingPlan(program) {
  return program === 'individual-workouts' || program === 'group-sessions' || program === 'tryouts';
}

function bookingLabel(booking) {
  if (!booking) {
    return 'Detached booking';
  }

  return `${labelProgram(booking.program)} - ${booking.name || 'Unknown player'} - ${formatAppointment(booking)}`;
}

function loadPlanIntoForm(bookingId) {
  const plan = currentTrainingPlans.find(item => item.booking_id === bookingId);

  if (plan) {
    loadPlanIntoFormById(plan.id);
    return;
  }

  const booking = currentBookings.find(item => item.id === bookingId);
  resetTrainingPlanForm({
    bookingId,
    title: booking ? `${booking.name || 'Player'} ${labelProgram(booking.program)} plan` : ''
  });
  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = 'Create the training plan and save it to attach it to this booking.';
  trainingPlanForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function loadPlanIntoFormById(planId) {
  const plan = currentTrainingPlans.find(item => item.id === planId);

  if (!plan || !trainingPlanForm) {
    return;
  }

  trainingPlanIdInput.value = plan.id || '';
  trainingPlanBooking.value = plan.booking_id || '';
  document.getElementById('training-plan-title').value = plan.title || '';
  document.getElementById('training-plan-overview').value = plan.player_overview || '';
  document.getElementById('training-plan-topics').value = Array.isArray(plan.player_topics) ? plan.player_topics.join('\n') : '';
  document.getElementById('training-plan-prep').value = plan.prep_notes || '';
  document.getElementById('training-plan-coach-notes').value = plan.coach_notes || '';
  trainingDrills.innerHTML = '';
  (Array.isArray(plan.drills) ? plan.drills : []).forEach(drill => appendDrillRow(drill));

  if (!trainingDrills.children.length) {
    appendDrillRow();
  }

  deleteTrainingPlanButton.hidden = false;
  updateTrainingPlanTotal();
  trainingPlanHint.className = 'form-hint success';
  trainingPlanHint.textContent = 'Editing attached training plan.';
  trainingPlanForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetTrainingPlanForm(defaults = {}) {
  trainingPlanForm?.reset();
  trainingPlanIdInput.value = '';
  trainingDrills.innerHTML = '';
  appendDrillRow();
  if (defaults.bookingId) {
    trainingPlanBooking.value = defaults.bookingId;
  }
  if (defaults.title) {
    document.getElementById('training-plan-title').value = defaults.title;
  }
  deleteTrainingPlanButton.hidden = true;
  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = 'Attach a plan to a booking, add exact drills, and save it.';
  updateTrainingPlanTotal();
}

function appendDrillRow(drill = {}) {
  const row = document.createElement('div');
  row.className = 'drill-row';
  row.innerHTML = `
    <div class="form-row">
      <label>
        Drill
        <input type="text" name="drill_title" value="${escapeHtml(drill.title || '')}" placeholder="Closeout footwork into live reads" required>
      </label>
      <label>
        Minutes
        <input type="number" name="drill_minutes" min="1" max="180" value="${escapeHtml(drill.minutes || '')}" placeholder="12" required>
      </label>
    </div>
    <label>
      Focus
      <input type="text" name="drill_focus" value="${escapeHtml(drill.focus || '')}" placeholder="Decision-making under pressure">
    </label>
    <label>
      Coaching details
      <textarea name="drill_notes" rows="2" placeholder="Set-up, progression, coaching cues, scoring system">${escapeHtml(drill.notes || '')}</textarea>
    </label>
    <div class="booking-actions">
      <button class="button danger" type="button" data-remove-drill>Remove drill</button>
    </div>
  `;
  trainingDrills.append(row);

  row.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', updateTrainingPlanTotal);
  });

  row.querySelector('[data-remove-drill]')?.addEventListener('click', () => {
    row.remove();
    if (!trainingDrills.children.length) {
      appendDrillRow();
    }
    updateTrainingPlanTotal();
  });
}

function collectDrills() {
  return [...trainingDrills.querySelectorAll('.drill-row')].map(row => ({
    title: row.querySelector('[name="drill_title"]')?.value || '',
    minutes: row.querySelector('[name="drill_minutes"]')?.value || '',
    focus: row.querySelector('[name="drill_focus"]')?.value || '',
    notes: row.querySelector('[name="drill_notes"]')?.value || ''
  }));
}

function updateTrainingPlanTotal() {
  const total = collectDrills().reduce((sum, drill) => sum + (Number(drill.minutes) || 0), 0);
  trainingPlanTotal.textContent = `${total} min`;
}

function totalPlanMinutes(drills) {
  return (Array.isArray(drills) ? drills : []).reduce((sum, drill) => sum + (Number(drill.minutes) || 0), 0);
}

async function acceptBooking(id, button) {
  button.disabled = true;
  button.textContent = 'Accepting...';

  try {
    const response = await fetch('/api/accept-booking', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      button.disabled = false;
      button.textContent = result.error || 'Accept failed';
      return;
    }

    await loadBookings();
  } catch {
    button.disabled = false;
    button.textContent = 'Accept failed';
  }
}

async function refuseBooking(id, button) {
  button.disabled = true;
  button.textContent = 'Refusing...';

  try {
    const response = await fetch('/api/refuse-booking', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      button.disabled = false;
      button.textContent = result.error || 'Refuse failed';
      return;
    }

    await loadBookings();
  } catch {
    button.disabled = false;
    button.textContent = 'Refuse failed';
  }
}

async function toggleAvailability(id, active) {
  availabilityHint.className = 'form-hint';
  availabilityHint.textContent = 'Updating appointment...';

  try {
    const response = await fetch('/api/availability', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      availabilityHint.className = 'form-hint error';
      availabilityHint.textContent = result.error || 'Could not update appointment.';
      return;
    }

    availabilityHint.className = 'form-hint success';
    availabilityHint.textContent = 'Appointment updated.';
    await loadAvailability();
  } catch {
    availabilityHint.className = 'form-hint error';
    availabilityHint.textContent = 'Could not update appointment.';
  }
}

async function deleteAvailability(id, button) {
  const confirmed = window.confirm('Delete this appointment completely? This cannot be undone.');

  if (!confirmed) {
    return;
  }

  availabilityHint.className = 'form-hint';
  availabilityHint.textContent = 'Deleting appointment...';
  button.disabled = true;

  try {
    const response = await fetch('/api/availability', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      button.disabled = false;
      availabilityHint.className = 'form-hint error';
      availabilityHint.textContent = result.error || 'Could not delete appointment.';
      return;
    }

    availabilityHint.className = 'form-hint success';
    availabilityHint.textContent = 'Appointment deleted.';
    await loadAvailability();
  } catch {
    button.disabled = false;
    availabilityHint.className = 'form-hint error';
    availabilityHint.textContent = 'Could not delete appointment.';
  }
}

async function deleteTrainingPlan(id, button) {
  const confirmed = window.confirm('Delete this training plan? This cannot be undone.');

  if (!confirmed) {
    return;
  }

  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = 'Deleting training plan...';
  if (button) {
    button.disabled = true;
  }

  try {
    const response = await fetch('/api/training-plans', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (button) {
        button.disabled = false;
      }
      trainingPlanHint.className = 'form-hint error';
      trainingPlanHint.textContent = result.error || 'Could not delete training plan.';
      return;
    }

    resetTrainingPlanForm();
    trainingPlanHint.className = 'form-hint success';
    trainingPlanHint.textContent = 'Training plan deleted.';
    await loadTrainingPlans();
  } catch {
    if (button) {
      button.disabled = false;
    }
    trainingPlanHint.className = 'form-hint error';
    trainingPlanHint.textContent = 'Could not delete training plan.';
  }
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

  return 'Appointment';
}

function formatAppointment(booking) {
  if (booking.program === 'tryouts') {
    return 'Tryout request';
  }

  if (booking.appointment_date && booking.appointment_time) {
    return `${booking.appointment_date} ${booking.appointment_time}`;
  }

  return booking.appointment || 'No appointment';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

staffForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const data = new FormData(staffForm);
  staffHint.className = 'form-hint';
  staffHint.textContent = 'Checking staff access...';

  try {
    const response = await fetch('/api/staff-login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_code: data.get('staff_code') })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      staffHint.className = 'form-hint error';
      staffHint.textContent = result.error || 'Incorrect staff code.';
      return;
    }

    await showDashboard();
  } catch {
    staffHint.className = 'form-hint error';
    staffHint.textContent = 'Could not check staff access.';
  }
});

availabilityForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const data = new FormData(availabilityForm);
  availabilityHint.className = 'form-hint';
  availabilityHint.textContent = 'Adding appointment...';

  try {
    const response = await fetch('/api/availability', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(data.entries()))
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      availabilityHint.className = 'form-hint error';
      availabilityHint.textContent = result.error || 'Could not add appointment.';
      return;
    }

    availabilityForm.reset();
    availabilityForm.querySelector('[name="capacity"]').value = '1';
    availabilityHint.className = 'form-hint success';
    availabilityHint.textContent = 'Appointment added.';
    await loadAvailability();
  } catch {
    availabilityHint.className = 'form-hint error';
    availabilityHint.textContent = 'Could not add appointment.';
  }
});

trainingPlanForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const payload = {
    id: trainingPlanIdInput.value || undefined,
    booking_id: trainingPlanBooking.value,
    title: document.getElementById('training-plan-title').value,
    player_overview: document.getElementById('training-plan-overview').value,
    player_topics: document.getElementById('training-plan-topics').value,
    prep_notes: document.getElementById('training-plan-prep').value,
    coach_notes: document.getElementById('training-plan-coach-notes').value,
    drills: collectDrills()
  };

  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = trainingPlanIdInput.value ? 'Updating training plan...' : 'Saving training plan...';

  try {
    const response = await fetch('/api/training-plans', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      trainingPlanHint.className = 'form-hint error';
      trainingPlanHint.textContent = result.error || 'Could not save training plan.';
      return;
    }

    trainingPlanHint.className = 'form-hint success';
    trainingPlanHint.textContent = 'Training plan saved.';
    await loadTrainingPlans();
    if (result.plan?.id) {
      loadPlanIntoFormById(result.plan.id);
    }
  } catch {
    trainingPlanHint.className = 'form-hint error';
    trainingPlanHint.textContent = 'Could not save training plan.';
  }
});

addDrillButton?.addEventListener('click', () => {
  appendDrillRow();
  updateTrainingPlanTotal();
});

resetTrainingPlanButton?.addEventListener('click', () => resetTrainingPlanForm());

deleteTrainingPlanButton?.addEventListener('click', () => {
  if (trainingPlanIdInput.value) {
    deleteTrainingPlan(trainingPlanIdInput.value);
  }
});

lockButton?.addEventListener('click', lockDashboard);

fetch('/api/bookings', { credentials: 'include' })
  .then(response => {
    if (response.ok) {
      resetTrainingPlanForm();
      return showDashboard();
    }

    return null;
  })
  .catch(() => {});
