const staffForm = document.getElementById('staff-form');
const staffLogin = document.getElementById('staff-login');
const staffDashboard = document.getElementById('staff-dashboard');
const staffHint = document.getElementById('staff-hint');
const list = document.getElementById('appointment-list');
const availabilityForm = document.getElementById('availability-form');
const availabilityHint = document.getElementById('availability-hint');
const availabilityList = document.getElementById('availability-list');
const lockButton = document.getElementById('lock-staff');
let currentBookings = [];
let currentAvailability = [];

async function showDashboard() {
  staffLogin.hidden = true;
  staffDashboard.hidden = false;
  staffHint.textContent = '';
  staffHint.className = 'form-hint';
  await Promise.all([loadAvailability(), loadBookings()]);
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
        ${status === 'pending' ? `
          <div class="booking-actions">
            <button class="button primary" type="button" data-accept-booking="${escapeHtml(booking.id)}">Accept and email player</button>
            <button class="button danger" type="button" data-refuse-booking="${escapeHtml(booking.id)}">Refuse and email player</button>
          </div>
        ` : ''}
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
      <button class="button secondary light" type="button" data-toggle-slot="${escapeHtml(slot.id)}" data-active="${slot.active ? 'false' : 'true'}">
        ${slot.active ? 'Hide appointment' : 'Show appointment'}
      </button>
    `;
    availabilityList.append(card);
  });

  availabilityList.querySelectorAll('[data-toggle-slot]').forEach(button => {
    button.addEventListener('click', () => toggleAvailability(button.dataset.toggleSlot, button.dataset.active === 'true'));
  });
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

function labelProgram(program) {
  if (program === 'individual-workouts') {
    return 'Individual workout';
  }

  if (program === 'group-sessions') {
    return 'Group session';
  }

  return 'Appointment';
}

function formatAppointment(booking) {
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

lockButton?.addEventListener('click', lockDashboard);

fetch('/api/bookings', { credentials: 'include' })
  .then(response => {
    if (response.ok) {
      return showDashboard();
    }

    return null;
  })
  .catch(() => {});
