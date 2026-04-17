const staffForm = document.getElementById('staff-form');
const staffLogin = document.getElementById('staff-login');
const staffDashboard = document.getElementById('staff-dashboard');
const staffHint = document.getElementById('staff-hint');
const list = document.getElementById('appointment-list');
const exportButton = document.getElementById('export-bookings');
const lockButton = document.getElementById('lock-staff');
let currentBookings = [];

async function showDashboard() {
  staffLogin.hidden = true;
  staffDashboard.hidden = false;
  await loadBookings();
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

  list.innerHTML = '';

  if (!sorted.length) {
    const empty = document.createElement('p');
    empty.className = 'form-hint';
    empty.textContent = 'No appointments have been booked yet.';
    list.append(empty);
    return;
  }

  sorted.forEach(booking => {
    const card = document.createElement('article');
    card.className = 'appointment-card';
    card.innerHTML = `
      <strong>${escapeHtml(formatAppointment(booking))}</strong>
      <span>${escapeHtml(labelProgram(booking.program || 'appointment'))}</span>
      <span>${escapeHtml(booking.name || 'Unknown player')} - ${escapeHtml(booking.position || 'Position missing')} - Age ${escapeHtml(booking.age || '-')}</span>
      <span>${escapeHtml(booking.email || '')}</span>
      <span>${escapeHtml(booking.phone || '')}</span>
      <span>${escapeHtml(booking.experience || '')}</span>
    `;
    list.append(card);
  });
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

function exportCsv() {
  const headers = [
    'program',
    'appointment',
    'appointment_date',
    'appointment_time',
    'name',
    'age',
    'position',
    'experience',
    'email',
    'phone',
    'created_at'
  ];
  const rows = currentBookings.map(booking => {
    return headers.map(header => csvCell(booking[header] || '')).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'hooplab-bookings.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
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

exportButton?.addEventListener('click', exportCsv);
lockButton?.addEventListener('click', lockDashboard);

fetch('/api/bookings', { credentials: 'include' })
  .then(response => {
    if (response.ok) {
      return showDashboard();
    }

    return null;
  })
  .catch(() => {});
