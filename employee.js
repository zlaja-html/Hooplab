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
const trainingPlanBreakdown = document.getElementById('training-plan-breakdown');
const trainingPlanTotal = document.getElementById('training-plan-total');
const resetTrainingPlanButton = document.getElementById('reset-training-plan');
const deleteTrainingPlanButton = document.getElementById('delete-training-plan');
const logoutButton = document.getElementById('lock-staff');
const flyerList = document.getElementById('flyer-list');
const flyerHint = document.getElementById('flyer-hint');
const uploadFlyerButton = document.getElementById('upload-flyer');
const flyerUploadInput = document.getElementById('flyer-upload-input');
let currentBookings = [];
let currentAvailability = [];
let currentTrainingPlans = [];
let currentFlyers = [];

async function showDashboard() {
  staffLogin.hidden = true;
  staffDashboard.hidden = false;
  staffHint.textContent = '';
  staffHint.className = 'form-hint';
  await Promise.all([loadAvailability(), loadBookings(), loadTrainingPlans(), loadFlyers()]);
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
    renderTrainingPlans(currentTrainingPlans);
    renderBookingOptions();
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
    renderAvailability(currentAvailability);
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

async function loadFlyers() {
  if (!flyerList) {
    return;
  }

  flyerList.innerHTML = '<p class="form-hint">Loading flyers and posts...</p>';

  try {
    const response = await fetch('/api/staff-media', { credentials: 'include' });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      flyerList.innerHTML = `<p class="form-hint error">${escapeHtml(result.error || 'Could not load flyers and posts.')}</p>`;
      return;
    }

    currentFlyers = result.media || [];
    renderFlyers();
  } catch {
    flyerList.innerHTML = '<p class="form-hint error">Could not load flyers and posts.</p>';
  }
}

function renderFlyers() {
  if (!flyerList) {
    return;
  }

  const items = currentFlyers;
  flyerList.innerHTML = '';

  if (!items.length) {
    flyerList.innerHTML = '<p class="form-hint">No flyers or posts are currently shown.</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'flyer-card';
    card.innerHTML = `
      <div class="flyer-media">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy">
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.filename || item.title)}</span>
      <div class="booking-actions">
        <a class="button secondary light" href="${escapeHtml(item.src)}" download="${escapeHtml(item.filename || item.title)}">Download</a>
        <button class="button danger" type="button" data-delete-flyer="${escapeHtml(item.id)}">Remove from page</button>
      </div>
    `;
    flyerList.append(card);
  });

  flyerList.querySelectorAll('[data-delete-flyer]').forEach(button => {
    button.addEventListener('click', () => removeFlyerFromPage(button.dataset.deleteFlyer));
  });
}

function removeFlyerFromPage(id) {
  hideFlyer(id);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

async function handleFlyerUpload(files) {
  if (!files.length) {
    return;
  }

  flyerHint.className = 'form-hint';
  flyerHint.textContent = 'Uploading images...';

  try {
    for (const file of files) {
      const src = await readFileAsDataUrl(file);
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Uploaded image';
      const response = await fetch('/api/staff-media', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          src,
          filename: file.name
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'upload-failed');
      }
    }

    flyerHint.className = 'form-hint success';
    flyerHint.textContent = `${files.length} image${files.length === 1 ? '' : 's'} added to the shared staff gallery.`;
    await loadFlyers();
  } catch {
    flyerHint.className = 'form-hint error';
    flyerHint.textContent = 'Could not add the selected images.';
  }
}

async function hideFlyer(id) {
  flyerHint.className = 'form-hint';
  flyerHint.textContent = 'Removing image from the page...';

  try {
    const response = await fetch('/api/staff-media', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hidden: true })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      flyerHint.className = 'form-hint error';
      flyerHint.textContent = result.error || 'Could not remove image from the page.';
      return;
    }

    flyerHint.className = 'form-hint success';
    flyerHint.textContent = 'Image removed from the page. The original file stays untouched.';
    await loadFlyers();
  } catch {
    flyerHint.className = 'form-hint error';
    flyerHint.textContent = 'Could not remove image from the page.';
  }
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
          ${status !== 'pending' ? `
            <button class="button danger" type="button" data-delete-booking="${escapeHtml(booking.id)}">Delete booking</button>
          ` : ''}
          ${supportsBookingTrainingPlan(booking.program) ? `
            <button class="button secondary light" type="button" data-edit-plan-booking="${escapeHtml(booking.id)}">
              ${plan ? 'Edit training plan' : 'Attach training plan'}
            </button>
            ${plan ? `
              <button class="button primary" type="button" data-send-plan-inline="${escapeHtml(plan.id)}" data-recipient="zlatan">Send to Zlatan</button>
              <button class="button primary" type="button" data-send-plan-inline="${escapeHtml(plan.id)}" data-recipient="harun">Send to Harun</button>
            ` : ''}
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

  list.querySelectorAll('[data-delete-booking]').forEach(button => {
    button.addEventListener('click', () => deletePlayerBooking(button.dataset.deleteBooking, button));
  });

  list.querySelectorAll('[data-edit-plan-booking]').forEach(button => {
    button.addEventListener('click', () => loadPlanIntoForm(`booking:${button.dataset.editPlanBooking}`));
  });

  list.querySelectorAll('[data-send-plan-inline]').forEach(button => {
    button.addEventListener('click', () => sendTrainingPlan(button.dataset.sendPlanInline, button, button.dataset.recipient));
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
    const plan = currentTrainingPlans.find(item => item.availability_id === slot.id);
    const card = document.createElement('article');
    card.className = 'appointment-card';
    card.innerHTML = `
      <strong>${escapeHtml(slot.appointment || '')}</strong>
      <span>${escapeHtml(labelProgram(slot.program))} - Capacity ${escapeHtml(slot.capacity || 1)} - ${slot.active ? 'Active' : 'Hidden'}</span>
      <span>${escapeHtml(slot.label || '')}${slot.note ? ` - ${escapeHtml(slot.note)}` : ''}</span>
      ${plan ? renderPlanSnippet(plan) : ''}
      <div class="booking-actions">
        ${supportsSlotTrainingPlan(slot.program) ? `
          <button class="button secondary light" type="button" data-edit-plan-slot="${escapeHtml(slot.id)}">
            ${plan ? 'Edit training plan' : 'Attach training plan'}
          </button>
          ${plan ? `
            <button class="button primary" type="button" data-send-plan-slot="${escapeHtml(plan.id)}" data-recipient="zlatan">Send to Zlatan</button>
            <button class="button primary" type="button" data-send-plan-slot="${escapeHtml(plan.id)}" data-recipient="harun">Send to Harun</button>
          ` : ''}
        ` : ''}
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

  availabilityList.querySelectorAll('[data-edit-plan-slot]').forEach(button => {
    button.addEventListener('click', () => loadPlanIntoForm(`availability:${button.dataset.editPlanSlot}`));
  });

  availabilityList.querySelectorAll('[data-send-plan-slot]').forEach(button => {
    button.addEventListener('click', () => sendTrainingPlan(button.dataset.sendPlanSlot, button, button.dataset.recipient));
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
    const target = getPlanTarget(plan);
    const totalMinutes = totalPlanMinutes(plan.drills);
    const card = document.createElement('article');
    card.className = 'appointment-card';
    card.innerHTML = `
      <div class="appointment-card-head">
        <strong>${escapeHtml(plan.title || 'Untitled plan')}</strong>
        <span class="status-pill accepted">${escapeHtml(totalMinutes)} min</span>
      </div>
      <span>${escapeHtml(labelProgram(plan.program || 'appointment'))}</span>
      <span>${escapeHtml(planTargetLabel(target))}</span>
      <span>${escapeHtml(plan.player_overview || '')}</span>
      ${renderPlanSummary(plan)}
      <div class="booking-actions">
        <button class="button secondary light" type="button" data-edit-plan="${escapeHtml(plan.id)}">Edit plan</button>
        <button class="button primary" type="button" data-send-plan="${escapeHtml(plan.id)}" data-recipient="zlatan">Send to Zlatan</button>
        <button class="button primary" type="button" data-send-plan="${escapeHtml(plan.id)}" data-recipient="harun">Send to Harun</button>
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

  trainingPlanList.querySelectorAll('[data-send-plan]').forEach(button => {
    button.addEventListener('click', () => sendTrainingPlan(button.dataset.sendPlan, button, button.dataset.recipient));
  });
}

function renderBookingOptions() {
  if (!trainingPlanBooking) {
    return;
  }

  const currentValue = trainingPlanBooking.value;
  trainingPlanBooking.innerHTML = '<option value="">Choose a workout, session, or tryout</option>';

  currentAvailability
    .filter(slot => supportsSlotTrainingPlan(slot.program) && slot.active)
    .sort((a, b) => String(a.appointment).localeCompare(String(b.appointment)))
    .forEach(slot => {
      const option = document.createElement('option');
      option.value = `availability:${slot.id}`;
      option.textContent = slotLabel(slot);
      trainingPlanBooking.append(option);
    });

  currentBookings
    .filter(booking => supportsBookingTrainingPlan(booking.program))
    .filter(booking => booking.status !== 'refused')
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .forEach(booking => {
      const option = document.createElement('option');
      option.value = `booking:${booking.id}`;
      option.textContent = bookingLabel(booking);
      trainingPlanBooking.append(option);
    });

  trainingPlanBooking.value = [...trainingPlanBooking.options].some(option => option.value === currentValue) ? currentValue : '';
}

function renderPlanSnippet(plan) {
  return `
    <div class="plan-attachment">
      <strong>${escapeHtml(plan.title || 'Training plan attached')}</strong>
      <span>${escapeHtml(totalPlanMinutes(plan.drills))} minutes - ${escapeHtml(planBlockSummary(plan.drills))}</span>
    </div>
  `;
}

function renderPlanSummary(plan) {
  return `<span>${escapeHtml(planBlockSummary(plan.drills))}</span>`;
}

function planBlockSummary(drills) {
  const count = Array.isArray(drills) ? drills.length : 0;
  return count === 1 ? '1 block ready' : `${count} blocks ready`;
}

function supportsSlotTrainingPlan(program) {
  return program === 'individual-workouts' || program === 'group-sessions';
}

function supportsBookingTrainingPlan(program) {
  return program === 'tryouts';
}

function bookingLabel(booking) {
  if (!booking) {
    return 'Detached booking';
  }

  return `${labelProgram(booking.program)} - ${booking.name || 'Unknown player'} - ${formatAppointment(booking)}`;
}

function slotLabel(slot) {
  if (!slot) {
    return 'Detached appointment';
  }

  const appointment = slot.appointment || `${slot.appointment_date || ''} ${String(slot.appointment_time || '').slice(0, 5)}`.trim();
  return `${labelProgram(slot.program)} - ${slot.label || appointment} - ${appointment}`;
}

function planTargetLabel(target) {
  if (!target) {
    return 'Detached target';
  }

  if (target.type === 'availability') {
    return slotLabel(target.record);
  }

  return bookingLabel(target.record);
}

function getPlanTarget(plan) {
  if (plan.availability_id) {
    return {
      type: 'availability',
      record: currentAvailability.find(item => item.id === plan.availability_id) || null
    };
  }

  if (plan.booking_id) {
    return {
      type: 'booking',
      record: currentBookings.find(item => item.id === plan.booking_id) || null
    };
  }

  return null;
}

function loadPlanIntoForm(targetValue) {
  const [targetType, targetId] = String(targetValue).split(':');
  const plan = targetType === 'availability'
    ? currentTrainingPlans.find(item => item.availability_id === targetId)
    : currentTrainingPlans.find(item => item.booking_id === targetId);

  if (plan) {
    loadPlanIntoFormById(plan.id);
    return;
  }

  const titleBase = targetType === 'availability'
    ? slotLabel(currentAvailability.find(item => item.id === targetId))
    : bookingLabel(currentBookings.find(item => item.id === targetId));

  resetTrainingPlanForm({
    targetValue,
    title: titleBase ? `${titleBase} plan` : ''
  });
  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = 'Create the training plan and save it to attach it to this target.';
  trainingPlanForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function loadPlanIntoFormById(planId) {
  const plan = currentTrainingPlans.find(item => item.id === planId);

  if (!plan || !trainingPlanForm) {
    return;
  }

  trainingPlanIdInput.value = plan.id || '';
  trainingPlanBooking.value = plan.availability_id ? `availability:${plan.availability_id}` : `booking:${plan.booking_id}`;
  document.getElementById('training-plan-title').value = plan.title || '';
  document.getElementById('training-plan-overview').value = plan.player_overview || '';
  document.getElementById('training-plan-prep').value = plan.prep_notes || '';
  document.getElementById('training-plan-coach-notes').value = plan.coach_notes || '';
  trainingPlanBreakdown.value = formatTrainingBreakdown(plan.drills);

  deleteTrainingPlanButton.hidden = false;
  updateTrainingPlanTotal();
  trainingPlanHint.className = 'form-hint success';
  trainingPlanHint.textContent = 'Editing attached training plan.';
  trainingPlanForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetTrainingPlanForm(defaults = {}) {
  trainingPlanForm?.reset();
  trainingPlanIdInput.value = '';
  if (defaults.targetValue) {
    trainingPlanBooking.value = defaults.targetValue;
  }
  if (defaults.title) {
    document.getElementById('training-plan-title').value = defaults.title;
  }
  deleteTrainingPlanButton.hidden = true;
  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = 'Attach a plan to a workout, session, or tryout, add the session breakdown, and save it.';
  updateTrainingPlanTotal();
}

function collectDrills() {
  return parseTrainingBreakdown(trainingPlanBreakdown?.value || '');
}

function updateTrainingPlanTotal() {
  const total = collectDrills().reduce((sum, drill) => sum + (Number(drill.minutes) || 0), 0);
  trainingPlanTotal.textContent = `${total} min`;
}

function totalPlanMinutes(drills) {
  return (Array.isArray(drills) ? drills : []).reduce((sum, drill) => sum + (Number(drill.minutes) || 0), 0);
}

function parseTrainingBreakdown(rawValue) {
  return String(rawValue || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(parseTrainingLine)
    .filter(block => block.title && block.minutes > 0);
}

function parseTrainingLine(line) {
  const parts = line.split('|').map(part => part.trim());

  if (parts.length > 1) {
    const [minutesPart, titlePart, focusPart = '', ...noteParts] = parts;
    return {
      title: titlePart || '',
      minutes: extractMinutes(minutesPart),
      focus: focusPart,
      notes: noteParts.join(' | ')
    };
  }

  const match = line.match(/^\s*(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)?\s*[-:]\s*(.+)$/i);

  if (match) {
    return {
      title: match[2].trim(),
      minutes: Number(match[1]) || 0,
      focus: '',
      notes: ''
    };
  }

  const shorthandMatch = line.match(/^\s*(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)?\s+(.+)$/i);

  if (shorthandMatch) {
    return {
      title: shorthandMatch[2].trim(),
      minutes: Number(shorthandMatch[1]) || 0,
      focus: '',
      notes: ''
    };
  }

  return {
    title: line,
    minutes: 0,
    focus: '',
    notes: ''
  };
}

function extractMinutes(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) || 0 : 0;
}

function formatTrainingBreakdown(drills) {
  return (Array.isArray(drills) ? drills : [])
    .map(drill => {
      const parts = [
        String(Number(drill.minutes) || 0),
        String(drill.title || '').trim(),
        String(drill.focus || '').trim(),
        String(drill.notes || '').trim()
      ];

      while (parts.length > 2 && !parts[parts.length - 1]) {
        parts.pop();
      }

      return parts.join(' | ');
    })
    .join('\n');
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

async function deletePlayerBooking(id, button) {
  const confirmed = window.confirm('Delete this booking completely? This cannot be undone.');

  if (!confirmed) {
    return;
  }

  button.disabled = true;
  button.textContent = 'Deleting...';

  try {
    const response = await fetch('/api/bookings', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      button.disabled = false;
      button.textContent = result.error || 'Delete failed';
      return;
    }

    await Promise.all([loadBookings(), loadTrainingPlans()]);
  } catch {
    button.disabled = false;
    button.textContent = 'Delete failed';
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

function recipientLabel(recipient) {
  return recipient === 'harun' ? 'Harun' : 'Zlatan';
}

function recipientEmail(recipient) {
  return recipient === 'harun' ? 'boeblingen.panthers.info@gmail.com' : 'zlaja.077@gmail.com';
}

async function sendTrainingPlan(id, button, recipient = 'zlatan') {
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = 'Sending...';
  trainingPlanHint.className = 'form-hint';
  trainingPlanHint.textContent = `Sending training plan email to ${recipientLabel(recipient)}...`;

  try {
    const response = await fetch('/api/send-training-plan', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, recipient })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      button.disabled = false;
      button.textContent = originalText;
      trainingPlanHint.className = 'form-hint error';
      trainingPlanHint.textContent = result.error || 'Could not send training plan.';
      return;
    }

    button.disabled = false;
    button.textContent = originalText;
    trainingPlanHint.className = 'form-hint success';
    trainingPlanHint.textContent = `Training plan sent to ${recipientEmail(recipient)}.`;
  } catch {
    button.disabled = false;
    button.textContent = originalText;
    trainingPlanHint.className = 'form-hint error';
    trainingPlanHint.textContent = 'Could not send training plan.';
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

uploadFlyerButton?.addEventListener('click', () => {
  flyerUploadInput?.click();
});

flyerUploadInput?.addEventListener('change', async event => {
  const files = [...(event.target.files || [])];
  await handleFlyerUpload(files);
  flyerUploadInput.value = '';
});

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
    target: trainingPlanBooking.value,
    title: document.getElementById('training-plan-title').value,
    player_overview: document.getElementById('training-plan-overview').value,
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

trainingPlanBreakdown?.addEventListener('input', updateTrainingPlanTotal);

resetTrainingPlanButton?.addEventListener('click', () => resetTrainingPlanForm());

deleteTrainingPlanButton?.addEventListener('click', () => {
  if (trainingPlanIdInput.value) {
    deleteTrainingPlan(trainingPlanIdInput.value);
  }
});

logoutButton?.addEventListener('click', lockDashboard);

fetch('/api/bookings', { credentials: 'include' })
  .then(response => {
    if (response.ok) {
      resetTrainingPlanForm();
      return showDashboard();
    }

    return null;
  })
  .catch(() => {});
