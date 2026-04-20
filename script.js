const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    document.body.classList.toggle('menu-open', !isOpen);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('img').forEach(image => {
  image.addEventListener('error', () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-missing';
    placeholder.textContent = image.alt || 'Image unavailable';
    image.replaceWith(placeholder);
  });
});

const form = document.querySelector('#apply-form');
let slots = window.HOOPLAB_WORKOUT_SLOTS || [];
let groupSlots = window.HOOPLAB_GROUP_SESSION_SLOTS || [];
let bookingCounts = {};

async function refreshBookingData() {
  try {
    const [bookingResponse, availabilityResponse] = await Promise.all([
      fetch('/api/bookings?public=1'),
      fetch('/api/availability?public=1')
    ]);

    if (bookingResponse.ok) {
      const result = await bookingResponse.json();
      bookingCounts = result.counts || {};
    }

    if (availabilityResponse.ok) {
      const result = await availabilityResponse.json();
      const availability = result.availability || [];
      const workoutSlots = availabilityToSlotGroups(availability, 'individual-workouts');
      const sessionSlots = availabilityToSlotGroups(availability, 'group-sessions');

      if (workoutSlots.length) {
        slots = workoutSlots;
      }

      if (sessionSlots.length) {
        groupSlots = sessionSlots;
      }
    }
  } catch {
    bookingCounts = {};
  }
}

function availabilityToSlotGroups(availability, program) {
  return availability
    .filter(slot => slot.program === program)
    .map(slot => ({
      date: slot.appointment_date,
      label: slot.label || slot.appointment_date,
      note: slot.note,
      capacity: slot.capacity || 1,
      times: [String(slot.appointment_time || '').slice(0, 5)]
    }));
}

function appointmentId(day, time) {
  return day.date ? `${day.date} ${time}` : `${day.label} ${time}`;
}

function appointmentLabel(day, time) {
  return `${day.label} at ${time}`;
}

function renderSlots({ shell, input, hint, slotGroups, emptyText }) {
  if (!shell || !input || !hint) {
    return;
  }

  shell.innerHTML = '';

  slotGroups.forEach(day => {
    const dateGroup = document.createElement('div');
    const dateLabel = document.createElement('strong');
    const slotGrid = document.createElement('div');

    dateGroup.className = 'calendar-date';
    dateLabel.textContent = day.note ? `${day.label} - ${day.note}` : day.label;
    slotGrid.className = 'slot-grid';

    day.times.forEach(time => {
      const slot = appointmentId(day, time);
      const label = appointmentLabel(day, time);
      const capacity = day.capacity || 1;
      const bookedCount = bookingCounts[slot] || 0;
      const spotsLeft = capacity - bookedCount;
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'slot-button';
      button.textContent = capacity > 1 ? `${time} (${Math.max(spotsLeft, 0)} left)` : time;
      button.dataset.appointment = slot;

      if (spotsLeft <= 0) {
        button.classList.add('booked');
        button.disabled = true;
        button.setAttribute('aria-label', `${day.label} at ${time} fully booked`);
      } else {
        button.setAttribute(
          'aria-label',
          capacity > 1 ? `${day.label} at ${time}, ${spotsLeft} spots left` : `${day.label} at ${time}`
        );
        button.addEventListener('click', () => {
          shell.querySelectorAll('.slot-button').forEach(item => {
            item.classList.remove('selected');
          });

          button.classList.add('selected');
          input.value = slot;
          hint.textContent = capacity > 1 ? `Selected: ${label} - ${spotsLeft} spots left` : `Selected: ${label}`;
          hint.className = 'form-hint success';
        });
      }

      slotGrid.append(button);
    });

    dateGroup.append(dateLabel, slotGrid);
    shell.append(dateGroup);
  });

  if (!slotGroups.length) {
    shell.textContent = emptyText;
  }
}

document.querySelectorAll('[data-program]').forEach(link => {
  link.addEventListener('click', () => {
    const programSelect = form?.querySelector('[name="program"]');

    if (!programSelect) {
      return;
    }

    programSelect.value = link.dataset.program;
    programSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

if (form) {
  const hint = document.getElementById('form-hint');
  const submitButton = form.querySelector('button[type="submit"]');
  const programSelect = form.querySelector('[name="program"]');
  const scheduler = document.getElementById('workout-scheduler');
  const calendarShell = document.getElementById('calendar-shell');
  const appointmentInput = document.getElementById('appointment-input');
  const appointmentHint = document.getElementById('appointment-hint');
  const groupScheduler = document.getElementById('group-scheduler');
  const groupCalendarShell = document.getElementById('group-calendar-shell');
  const groupAppointmentInput = document.getElementById('group-appointment-input');
  const groupAppointmentHint = document.getElementById('group-appointment-hint');
  const defaultButtonText = submitButton?.textContent || 'Submit application';

  function renderCalendar() {
    renderSlots({
      shell: calendarShell,
      input: appointmentInput,
      hint: appointmentHint,
      slotGroups: slots,
      emptyText: 'No workout appointments are available right now.'
    });
  }

  function renderGroupCalendar() {
    renderSlots({
      shell: groupCalendarShell,
      input: groupAppointmentInput,
      hint: groupAppointmentHint,
      slotGroups: groupSlots,
      emptyText: 'No group sessions are available right now.'
    });
  }

  function syncScheduler() {
    const isWorkout = programSelect?.value === 'individual-workouts';
    const isGroupSession = programSelect?.value === 'group-sessions';

    if (!scheduler || !appointmentInput || !appointmentHint || !groupScheduler || !groupAppointmentInput || !groupAppointmentHint) {
      return;
    }

    scheduler.hidden = !isWorkout;
    appointmentInput.required = isWorkout;
    groupScheduler.hidden = !isGroupSession;
    groupAppointmentInput.required = isGroupSession;

    if (isWorkout) {
      renderCalendar();
    } else {
      appointmentInput.value = '';
      appointmentHint.textContent = 'No appointment selected.';
      appointmentHint.className = 'form-hint';
    }

    if (isGroupSession) {
      renderGroupCalendar();
    } else {
      groupAppointmentInput.value = '';
      groupAppointmentHint.textContent = 'No group session selected.';
      groupAppointmentHint.className = 'form-hint';
    }
  }

  programSelect?.addEventListener('change', syncScheduler);

  refreshBookingData().finally(syncScheduler);

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);

    if (data.get('extra_field')) {
      return;
    }

    const payload = Object.fromEntries(data.entries());

    if (payload.program === 'individual-workouts' && !payload.appointment) {
      hint.className = 'form-hint error';
      hint.textContent = 'Please choose an available workout appointment before submitting.';
      scheduler?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (payload.program === 'group-sessions' && !payload.group_appointment) {
      hint.className = 'form-hint error';
      hint.textContent = 'Please choose an available group session before submitting.';
      groupScheduler?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (payload.program === 'group-sessions') {
      payload.appointment = payload.group_appointment;
    }

    hint.className = 'form-hint';
    hint.textContent = 'Sending your application...';
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        await refreshBookingData();
        hint.className = 'form-hint success';
        hint.textContent =
          result.message || 'Application received. We will review and respond after evaluation.';
        form.reset();
        syncScheduler();
      } else {
        await refreshBookingData();
        syncScheduler();
        hint.className = 'form-hint error';
        hint.textContent =
          result.error || 'Could not submit right now. Please email us your details.';
      }
    } catch {
      hint.className = 'form-hint error';
      hint.textContent = 'Could not submit right now. Please email us your details.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
}
