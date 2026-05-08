const loginSection = document.getElementById('calendar-login');
const loginForm = document.getElementById('calendar-login-form');
const loginHint = document.getElementById('calendar-login-hint');
const calendarShell = document.getElementById('calendar-shell');
const rangeLabel = document.getElementById('calendar-range-label');
const viewHost = document.getElementById('calendar-view-host');
const legend = document.getElementById('calendar-legend');
const upcomingList = document.getElementById('calendar-upcoming-list');
const viewButtons = [...document.querySelectorAll('[data-calendar-view]')];
const prevButton = document.getElementById('calendar-prev');
const nextButton = document.getElementById('calendar-next');
const todayButton = document.getElementById('calendar-today');
const eventForm = document.getElementById('calendar-event-form');
const eventHint = document.getElementById('calendar-event-hint');
const eventIdInput = document.getElementById('calendar-event-id');
const deleteEventButton = document.getElementById('calendar-delete-event');
const resetEventButton = document.getElementById('calendar-reset-form');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

const OWNER_META = {
  harun: { label: 'Harun', color: '#155eef' },
  zlatan: { label: 'Zlatan', color: '#8b5cf6' },
  shared: { label: 'Shared', color: '#0f766e' },
  booking: { label: 'Player booking', color: '#d97706' }
};
const WEEK_HOURS = Array.from({ length: 13 }, (_, index) => 8 + index);

const state = {
  view: 'week',
  anchor: startOfDay(new Date()),
  currentStaffUser: null,
  availability: [],
  bookings: [],
  events: []
};

bootstrap();

async function bootstrap() {
  bindEvents();
  await restoreSession();
}

function bindEvents() {
  loginForm?.addEventListener('submit', handleLogin);
  viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.calendarView)));
  prevButton?.addEventListener('click', () => shiftRange(-1));
  nextButton?.addEventListener('click', () => shiftRange(1));
  todayButton?.addEventListener('click', () => {
    state.anchor = startOfDay(new Date());
    renderCalendar();
  });
  eventForm?.addEventListener('submit', saveEvent);
  deleteEventButton?.addEventListener('click', deleteEvent);
  resetEventButton?.addEventListener('click', () => resetEventForm());
  document.getElementById('calendar-event-all-day')?.addEventListener('change', updateTimeFieldsState);
  menuToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

async function restoreSession() {
  try {
    const response = await fetch('/api/staff-session', { credentials: 'include' });
    const result = await response.json().catch(() => ({}));
    applyStaffOptions(result.staffUsers || []);

    if (!response.ok) {
      return;
    }

    state.currentStaffUser = result.staffUser || null;
    showCalendar();
    await loadCalendarData();
  } catch {
    loginHint.textContent = 'Could not restore the staff session.';
    loginHint.className = 'form-hint error';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const data = new FormData(loginForm);

  loginHint.className = 'form-hint';
  loginHint.textContent = 'Checking staff access...';

  try {
    const response = await fetch('/api/staff-login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_user: data.get('staff_user'),
        staff_code: data.get('staff_code')
      })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      loginHint.className = 'form-hint error';
      loginHint.textContent = result.error || 'Incorrect staff code.';
      return;
    }

    state.currentStaffUser = result.staffUser || null;
    showCalendar();
    await loadCalendarData();
  } catch {
    loginHint.className = 'form-hint error';
    loginHint.textContent = 'Could not open the shared calendar.';
  }
}

function applyStaffOptions(staffUsers) {
  ['calendar-staff-user', 'calendar-event-owner'].forEach(id => {
    const field = document.getElementById(id);

    if (!field || !staffUsers.length) {
      return;
    }

    const currentValue = field.value;
    const keepShared = id === 'calendar-event-owner';
    field.innerHTML = staffUsers
      .map(user => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)}</option>`)
      .join('');

    if (keepShared) {
      field.insertAdjacentHTML('beforeend', '<option value="shared">Shared</option>');
    }

    field.value = [...field.options].some(option => option.value === currentValue)
      ? currentValue
      : field.options[0]?.value || '';
  });
}

function showCalendar() {
  loginSection.hidden = true;
  calendarShell.hidden = false;
  const ownerField = document.getElementById('calendar-event-owner');

  if (state.currentStaffUser && ownerField) {
    ownerField.value = state.currentStaffUser.id;
  }
}

async function loadCalendarData() {
  try {
    const [eventsResponse, availabilityResponse, bookingsResponse] = await Promise.all([
      fetch('/api/calendar-events', { credentials: 'include' }),
      fetch('/api/availability', { credentials: 'include' }),
      fetch('/api/bookings', { credentials: 'include' })
    ]);

    const [eventsResult, availabilityResult, bookingsResult] = await Promise.all([
      eventsResponse.json().catch(() => ({})),
      availabilityResponse.json().catch(() => ({})),
      bookingsResponse.json().catch(() => ({}))
    ]);

    if (!eventsResponse.ok || !availabilityResponse.ok || !bookingsResponse.ok) {
      throw new Error(eventsResult.error || availabilityResult.error || bookingsResult.error || 'load-failed');
    }

    state.events = eventsResult.events || [];
    state.availability = availabilityResult.availability || [];
    state.bookings = bookingsResult.bookings || [];
    resetEventForm();
    updateTimeFieldsState();
    renderCalendar();
  } catch {
    eventHint.className = 'form-hint error';
    eventHint.textContent = 'Could not load the shared calendar data.';
  }
}

function setView(view) {
  state.view = view;
  viewButtons.forEach(button => button.classList.toggle('is-active', button.dataset.calendarView === view));
  renderCalendar();
}

function shiftRange(direction) {
  const next = new Date(state.anchor);

  if (state.view === 'week') {
    next.setDate(next.getDate() + (7 * direction));
  } else if (state.view === 'month') {
    next.setMonth(next.getMonth() + direction, 1);
  } else {
    next.setMonth(next.getMonth() + (6 * direction), 1);
  }

  state.anchor = startOfDay(next);
  renderCalendar();
}

function renderCalendar() {
  const range = getRange();
  const occurrences = getVisibleOccurrences(range.start, range.end);
  rangeLabel.textContent = formatRangeLabel(range.start, range.end);
  renderLegend();
  renderUpcoming(occurrences);

  if (state.view === 'week') {
    renderWeekView(range.start, occurrences);
    return;
  }

  if (state.view === 'month') {
    renderMonthView(range.start, occurrences);
    return;
  }

  renderHalfYearView(range.start, occurrences);
}

function renderLegend() {
  legend.innerHTML = '';

  Object.entries(OWNER_META).forEach(([id, meta]) => {
    const item = document.createElement('span');
    item.className = 'calendar-legend-item';
    item.innerHTML = `<i style="background:${meta.color}"></i>${escapeHtml(meta.label)}`;
    legend.append(item);
  });
}

function renderUpcoming(occurrences) {
  upcomingList.innerHTML = '';
  const upcoming = occurrences
    .filter(item => item.end >= startOfDay(new Date()))
    .sort((a, b) => a.start - b.start)
    .slice(0, 10);

  if (!upcoming.length) {
    upcomingList.innerHTML = '<p class="form-hint">No upcoming events in this range yet.</p>';
    return;
  }

  upcoming.forEach(item => upcomingList.append(renderOccurrenceCard(item, true)));
}

function renderWeekView(weekStart, occurrences) {
  const dayStarts = [...Array(7)].map((_, index) => addDays(startOfWeek(weekStart), index));
  const weekItems = occurrences.filter(item => item.end >= dayStarts[0] && item.start < addDays(dayStarts[6], 1));

  const scheduler = document.createElement('section');
  scheduler.className = 'calendar-week-scheduler';
  scheduler.innerHTML = '<div class="calendar-week-corner">Time</div>';

  dayStarts.forEach(dayStart => {
    const dayItems = weekItems
      .filter(item => intersectsDay(item, dayStart))
      .sort((a, b) => sortOccurrence(a, b));
    const allDayItems = dayItems.filter(item => item.all_day);
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'calendar-day-header-button';
    header.dataset.prefillDay = toDateInputValue(dayStart);
    header.innerHTML = `
      <span>${formatWeekday(dayStart)}</span>
      <strong>${dayStart.getDate()}</strong>
      <small>${allDayItems.length ? `${allDayItems.length} all-day` : 'Add all-day'}</small>
    `;
    scheduler.append(header);
  });

  WEEK_HOURS.forEach(hour => {
    const label = document.createElement('div');
    label.className = 'calendar-time-label';
    label.textContent = `${String(hour).padStart(2, '0')}:00`;
    scheduler.append(label);

    dayStarts.forEach(dayStart => {
      const slotDate = toDateInputValue(dayStart);
      const hourItems = weekItems
        .filter(item => !item.all_day)
        .filter(item => item.start >= dayStart && item.start < addDays(dayStart, 1))
        .filter(item => item.start.getHours() === hour)
        .sort((a, b) => sortOccurrence(a, b));
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'calendar-time-slot';
      slot.dataset.prefillDate = slotDate;
      slot.dataset.prefillTime = `${String(hour).padStart(2, '0')}:00`;
      slot.innerHTML = '<div class="calendar-time-slot-events"></div>';

      const itemsHost = slot.querySelector('.calendar-time-slot-events');

      if (!hourItems.length) {
        const hint = document.createElement('span');
        hint.className = 'calendar-slot-add';
        hint.textContent = '+';
        itemsHost.append(hint);
      } else {
        hourItems.slice(0, 3).forEach(item => itemsHost.append(renderOccurrenceBadge(item)));

        if (hourItems.length > 3) {
          const more = document.createElement('span');
          more.className = 'calendar-slot-more';
          more.textContent = `+${hourItems.length - 3} more`;
          itemsHost.append(more);
        }
      }

      scheduler.append(slot);
    });
  });

  viewHost.replaceChildren(scheduler);
  bindCalendarPrefillControls();
}

function renderMonthView(anchor, occurrences) {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  const grid = document.createElement('section');
  grid.className = 'calendar-month-grid';

  for (let index = 0; index < 42; index += 1) {
    const dayStart = addDays(gridStart, index);
    const dayItems = occurrences
      .filter(item => intersectsDay(item, dayStart))
      .sort((a, b) => sortOccurrence(a, b))
      .slice(0, 4);
    const cell = document.createElement('article');
    cell.className = `calendar-month-cell${dayStart.getMonth() === monthStart.getMonth() ? '' : ' is-outside'}`;
    cell.dataset.prefillDay = toDateInputValue(dayStart);
    cell.innerHTML = `
      <header>
        <span>${formatWeekdayShort(dayStart)}</span>
        <strong>${dayStart.getDate()}</strong>
      </header>
      <div class="calendar-month-items"></div>
    `;

    const itemsHost = cell.querySelector('.calendar-month-items');
    if (!dayItems.length) {
      itemsHost.innerHTML = '<p class="calendar-empty-state"> </p>';
    } else {
      dayItems.forEach(item => itemsHost.append(renderOccurrenceBadge(item)));
    }

    grid.append(cell);
  }

  viewHost.replaceChildren(grid);
  bindCalendarPrefillControls();
}

function renderHalfYearView(anchor, occurrences) {
  const startMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const wrap = document.createElement('section');
  wrap.className = 'calendar-halfyear-grid';

  for (let offset = 0; offset < 6; offset += 1) {
    const monthStart = new Date(startMonth.getFullYear(), startMonth.getMonth() + offset, 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const monthOccurrences = occurrences.filter(item => item.end >= monthStart && item.start <= monthEnd);
    const card = document.createElement('article');
    card.className = 'calendar-mini-month';
    card.innerHTML = `<h3>${formatMonthTitle(monthStart)}</h3><div class="calendar-mini-weeks"></div>`;
    const weeksHost = card.querySelector('.calendar-mini-weeks');

    const gridStart = startOfWeek(monthStart);
    const totalDays = dayDiff(gridStart, addDays(startOfWeek(addDays(monthEnd, 6)), 7));

    for (let index = 0; index < totalDays; index += 7) {
      const rowStart = addDays(gridStart, index);
      const row = document.createElement('div');
      row.className = 'calendar-mini-week';

      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const dayStart = addDays(rowStart, dayOffset);
        const items = monthOccurrences.filter(item => intersectsDay(item, dayStart));
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `calendar-mini-day${dayStart.getMonth() === monthStart.getMonth() ? '' : ' is-outside'}`;
        dot.dataset.prefillDay = toDateInputValue(dayStart);
        dot.innerHTML = `<span>${dayStart.getDate()}</span>`;

        if (items[0]) {
          dot.style.setProperty('--mini-accent', resolveEventColor(items[0]));
          dot.classList.add('has-event');
          dot.title = items.slice(0, 3).map(item => item.title).join(', ');
        }

        row.append(dot);
      }

      weeksHost.append(row);
    }

    wrap.append(card);
  }

  viewHost.replaceChildren(wrap);
  bindCalendarPrefillControls();
}

function renderOccurrenceCard(item, compact = false) {
  const card = document.createElement('article');
  card.className = `calendar-entry-card${compact ? ' compact' : ''}`;
  card.style.setProperty('--event-accent', resolveEventColor(item));
  card.innerHTML = `
    <button class="calendar-entry-card-button" type="button">
      <span class="calendar-entry-meta">${escapeHtml(ownerLabel(item.staff_owner))} · ${escapeHtml(eventTypeLabel(item.event_type))}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(formatOccurrenceTime(item))}</span>
      ${item.notes ? `<span>${escapeHtml(item.notes)}</span>` : ''}
    </button>
  `;

  card.querySelector('button').addEventListener('click', () => {
    if (item.source === 'calendar-event') {
      populateEventForm(item.raw);
    }
  });

  return card;
}

function renderOccurrenceBadge(item) {
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = 'calendar-badge';
  badge.style.setProperty('--event-accent', resolveEventColor(item));
  badge.textContent = `${formatOccurrenceTime(item, true)} ${item.title}`;
  badge.title = item.title;
  badge.addEventListener('click', () => {
    if (item.source === 'calendar-event') {
      populateEventForm(item.raw);
    }
  });
  return badge;
}

async function saveEvent(event) {
  event.preventDefault();
  const data = new FormData(eventForm);
  const payload = {
    id: data.get('id') || undefined,
    title: data.get('title'),
    event_type: data.get('event_type'),
    staff_owner: data.get('staff_owner'),
    start_date: data.get('start_date'),
    end_date: data.get('end_date'),
    start_time: data.get('all_day') ? null : data.get('start_time'),
    end_time: data.get('all_day') ? null : data.get('end_time'),
    all_day: Boolean(data.get('all_day')),
    location: data.get('location'),
    notes: data.get('notes'),
    recurrence: {
      frequency: data.get('recurrence_frequency'),
      until: data.get('recurrence_until') || null
    }
  };

  eventHint.className = 'form-hint';
  eventHint.textContent = payload.id ? 'Updating event...' : 'Saving event...';

  try {
    const response = await fetch('/api/calendar-events', {
      method: payload.id ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      eventHint.className = 'form-hint error';
      eventHint.textContent = result.error || 'Could not save event.';
      return;
    }

    eventHint.className = 'form-hint success';
    eventHint.textContent = 'Event saved.';
    await loadCalendarData();
  } catch {
    eventHint.className = 'form-hint error';
    eventHint.textContent = 'Could not save event.';
  }
}

async function deleteEvent() {
  if (!eventIdInput.value) {
    return;
  }

  eventHint.className = 'form-hint';
  eventHint.textContent = 'Deleting event...';

  try {
    const response = await fetch('/api/calendar-events', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: eventIdInput.value })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      eventHint.className = 'form-hint error';
      eventHint.textContent = result.error || 'Could not delete event.';
      return;
    }

    resetEventForm();
    eventHint.className = 'form-hint success';
    eventHint.textContent = 'Event deleted.';
    await loadCalendarData();
  } catch {
    eventHint.className = 'form-hint error';
    eventHint.textContent = 'Could not delete event.';
  }
}

function resetEventForm() {
  eventForm?.reset();
  eventIdInput.value = '';
  deleteEventButton.hidden = true;
  eventHint.className = 'form-hint';
  eventHint.textContent = '';
  document.getElementById('calendar-event-all-day').checked = true;
  document.getElementById('calendar-event-repeat').value = 'none';
  document.getElementById('calendar-event-start-date').value = toDateInputValue(state.anchor);
  document.getElementById('calendar-event-end-date').value = toDateInputValue(state.anchor);

  if (state.currentStaffUser) {
    document.getElementById('calendar-event-owner').value = state.currentStaffUser.id;
  }

  updateTimeFieldsState();
}

function populateEventForm(event) {
  eventIdInput.value = event.id || '';
  document.getElementById('calendar-event-type').value = event.event_type || 'blocker';
  document.getElementById('calendar-event-owner').value = event.staff_owner || 'shared';
  document.getElementById('calendar-event-title').value = event.title || '';
  document.getElementById('calendar-event-start-date').value = event.start_date || '';
  document.getElementById('calendar-event-end-date').value = event.end_date || event.start_date || '';
  document.getElementById('calendar-event-start-time').value = event.start_time ? String(event.start_time).slice(0, 5) : '';
  document.getElementById('calendar-event-end-time').value = event.end_time ? String(event.end_time).slice(0, 5) : '';
  document.getElementById('calendar-event-all-day').checked = event.all_day !== false;
  document.getElementById('calendar-event-repeat').value = event.recurrence?.frequency || 'none';
  document.getElementById('calendar-event-repeat-until').value = event.recurrence?.until || '';
  document.getElementById('calendar-event-location').value = event.location || '';
  document.getElementById('calendar-event-notes').value = event.notes || '';
  deleteEventButton.hidden = false;
  updateTimeFieldsState();
}

function getRange() {
  if (state.view === 'week') {
    const start = startOfWeek(state.anchor);
    return { start, end: addDays(start, 7) };
  }

  if (state.view === 'month') {
    const start = new Date(state.anchor.getFullYear(), state.anchor.getMonth(), 1);
    return { start, end: new Date(state.anchor.getFullYear(), state.anchor.getMonth() + 1, 1) };
  }

  const start = new Date(state.anchor.getFullYear(), state.anchor.getMonth(), 1);
  return { start, end: new Date(state.anchor.getFullYear(), state.anchor.getMonth() + 6, 1) };
}

function getVisibleOccurrences(rangeStart, rangeEnd) {
  return [
    ...expandCalendarEvents(rangeStart, rangeEnd),
    ...mapAvailabilityOccurrences(rangeStart, rangeEnd),
    ...mapBookingOccurrences(rangeStart, rangeEnd)
  ].sort((a, b) => sortOccurrence(a, b));
}

function expandCalendarEvents(rangeStart, rangeEnd) {
  return state.events.flatMap(event => expandRecurringEvent(event, rangeStart, rangeEnd));
}

function expandRecurringEvent(event, rangeStart, rangeEnd) {
  const occurrences = [];
  const recurrence = event.recurrence || {};
  const frequency = recurrence.frequency || 'none';
  const until = recurrence.until ? new Date(recurrence.until) : rangeEnd;
  const finalEnd = until < rangeEnd ? until : rangeEnd;
  let currentStart = parseDateTime(event.start_date, event.start_time);
  let currentEnd = parseDateTime(event.end_date || event.start_date, event.end_time) || currentStart;
  const duration = Math.max(1, currentEnd - currentStart);

  while (currentStart < rangeEnd && currentStart <= finalEnd) {
    if (currentEnd >= rangeStart) {
      occurrences.push(buildOccurrence({
        source: 'calendar-event',
        raw: event,
        id: `${event.id}:${currentStart.toISOString()}`,
        title: event.title,
        event_type: event.event_type,
        staff_owner: event.staff_owner || 'shared',
        notes: event.notes || event.location || '',
        start: currentStart,
        end: new Date(currentStart.getTime() + duration),
        all_day: event.all_day !== false
      }));
    }

    if (frequency === 'none') {
      break;
    }

    const nextStart = new Date(currentStart);
    const nextEnd = new Date(currentEnd);

    if (frequency === 'daily') {
      nextStart.setDate(nextStart.getDate() + 1);
      nextEnd.setDate(nextEnd.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextStart.setDate(nextStart.getDate() + 7);
      nextEnd.setDate(nextEnd.getDate() + 7);
    } else if (frequency === 'biweekly') {
      nextStart.setDate(nextStart.getDate() + 14);
      nextEnd.setDate(nextEnd.getDate() + 14);
    } else if (frequency === 'monthly') {
      nextStart.setMonth(nextStart.getMonth() + 1);
      nextEnd.setMonth(nextEnd.getMonth() + 1);
    } else if (frequency === 'yearly') {
      nextStart.setFullYear(nextStart.getFullYear() + 1);
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    }

    currentStart = nextStart;
    currentEnd = nextEnd;
  }

  return occurrences;
}

function mapAvailabilityOccurrences(rangeStart, rangeEnd) {
  return state.availability
    .map(slot => {
      const start = parseDateTime(slot.appointment_date, slot.appointment_time);
      const end = new Date(start.getTime() + (60 * 60 * 1000));

      if (!slot.active || end < rangeStart || start >= rangeEnd) {
        return null;
      }

      return buildOccurrence({
        source: 'availability',
        raw: slot,
        id: slot.id,
        title: slot.label || labelProgram(slot.program),
        event_type: 'shared-appointment',
        staff_owner: slot.staff_owner || 'shared',
        notes: `${labelProgram(slot.program)} · Capacity ${slot.capacity || 1}${slot.note ? ` · ${slot.note}` : ''}`,
        start,
        end,
        all_day: false
      });
    })
    .filter(Boolean);
}

function mapBookingOccurrences(rangeStart, rangeEnd) {
  return state.bookings
    .filter(booking => booking.status !== 'refused')
    .map(booking => {
      const start = parseDateTime(booking.appointment_date, booking.appointment_time);
      const end = new Date(start.getTime() + (60 * 60 * 1000));

      if (!booking.appointment_date || end < rangeStart || start >= rangeEnd) {
        return null;
      }

      return buildOccurrence({
        source: 'booking',
        raw: booking,
        id: booking.id,
        title: `${booking.name} · ${labelProgram(booking.program)}`,
        event_type: 'booking',
        staff_owner: booking.staff_owner || 'booking',
        notes: booking.status === 'accepted' ? 'Accepted booking' : 'Pending booking',
        start,
        end,
        all_day: false
      });
    })
    .filter(Boolean);
}

function buildOccurrence(item) {
  return item;
}

function resolveEventColor(item) {
  if (item.raw?.color) {
    return item.raw.color;
  }

  return OWNER_META[item.staff_owner]?.color || '#155eef';
}

function ownerLabel(owner) {
  return OWNER_META[owner]?.label || OWNER_META.shared.label;
}

function eventTypeLabel(type) {
  return {
    blocker: 'Blocker',
    booking: 'Booking',
    trip: 'Trip',
    'shared-appointment': 'Appointment'
  }[type] || 'Event';
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

function formatOccurrenceTime(item, short = false) {
  if (item.all_day) {
    return short ? 'All day' : `${formatDate(item.start)} · All day`;
  }

  const time = `${formatTime(item.start)}-${formatTime(item.end)}`;
  return short ? time : `${formatDate(item.start)} · ${time}`;
}

function formatRangeLabel(start, end) {
  if (state.view === 'week') {
    return `${formatDate(start)} - ${formatDate(addDays(end, -1))}`;
  }

  if (state.view === 'month') {
    return formatMonthTitle(start);
  }

  return `${formatMonthTitle(start)} - ${formatMonthTitle(addDays(end, -1))}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(date);
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(date);
}

function formatWeekdayShort(date) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date);
}

function formatMonthTitle(date) {
  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function parseDateTime(dateValue, timeValue) {
  const safeDate = dateValue || toDateInputValue(new Date());
  const safeTime = timeValue ? String(timeValue).slice(0, 5) : '00:00';
  return new Date(`${safeDate}T${safeTime}:00`);
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return copy;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function dayDiff(start, end) {
  return Math.round((startOfDay(end) - startOfDay(start)) / (24 * 60 * 60 * 1000));
}

function intersectsDay(item, dayStart) {
  const dayEnd = addDays(dayStart, 1);
  return item.end > dayStart && item.start < dayEnd;
}

function sortOccurrence(a, b) {
  return a.start - b.start || String(a.title).localeCompare(String(b.title));
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function updateTimeFieldsState() {
  const allDay = document.getElementById('calendar-event-all-day')?.checked;
  ['calendar-event-start-time', 'calendar-event-end-time'].forEach(id => {
    const field = document.getElementById(id);

    if (field) {
      field.disabled = Boolean(allDay);
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bindCalendarPrefillControls() {
  viewHost.querySelectorAll('[data-prefill-day]').forEach(element => {
    element.addEventListener('click', event => {
      if (event.target.closest('.calendar-badge')) {
        return;
      }

      prefillEventForm({
        date: element.dataset.prefillDay,
        allDay: true
      });
    });
  });

  viewHost.querySelectorAll('[data-prefill-date][data-prefill-time]').forEach(element => {
    element.addEventListener('click', event => {
      if (event.target.closest('.calendar-badge')) {
        return;
      }

      prefillEventForm({
        date: element.dataset.prefillDate,
        startTime: element.dataset.prefillTime,
        endTime: addHourToTime(element.dataset.prefillTime),
        allDay: false
      });
    });
  });
}

function prefillEventForm({ date, startTime = '', endTime = '', allDay = true }) {
  eventIdInput.value = '';
  deleteEventButton.hidden = true;
  document.getElementById('calendar-event-type').value = 'blocker';
  document.getElementById('calendar-event-title').value = '';
  document.getElementById('calendar-event-start-date').value = date;
  document.getElementById('calendar-event-end-date').value = date;
  document.getElementById('calendar-event-all-day').checked = allDay;
  document.getElementById('calendar-event-start-time').value = allDay ? '' : startTime;
  document.getElementById('calendar-event-end-time').value = allDay ? '' : endTime;
  document.getElementById('calendar-event-repeat').value = 'none';
  document.getElementById('calendar-event-repeat-until').value = '';
  eventHint.className = 'form-hint';
  eventHint.textContent = allDay
    ? `Drafting an all-day event for ${date}.`
    : `Drafting an event on ${date} at ${startTime}.`;
  updateTimeFieldsState();
  eventForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('calendar-event-title')?.focus();
}

function addHourToTime(timeValue) {
  const [hours, minutes] = String(timeValue || '00:00').split(':').map(Number);
  const endHour = Math.min(23, (Number.isFinite(hours) ? hours : 0) + 1);
  return `${String(endHour).padStart(2, '0')}:${String(Number.isFinite(minutes) ? minutes : 0).padStart(2, '0')}`;
}

function renderOccurrenceCard(item, compact = false) {
  const card = document.createElement('article');
  card.className = `calendar-entry-card${compact ? ' compact' : ''}`;
  card.style.setProperty('--event-accent', resolveEventColor(item));
  card.innerHTML = `
    <button class="calendar-entry-card-button" type="button">
      <span class="calendar-entry-meta">${escapeHtml(ownerLabel(item.staff_owner))} | ${escapeHtml(eventTypeLabel(item.event_type))}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(formatOccurrenceTime(item))}</span>
      ${item.notes ? `<span>${escapeHtml(item.notes)}</span>` : ''}
    </button>
  `;

  card.querySelector('button').addEventListener('click', () => {
    if (item.source === 'calendar-event') {
      populateEventForm(item.raw);
    }
  });

  return card;
}

function renderOccurrenceBadge(item) {
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = 'calendar-badge';
  badge.style.setProperty('--event-accent', resolveEventColor(item));
  badge.textContent = `${formatOccurrenceTime(item, true)} ${item.title}`;
  badge.title = item.title;
  badge.addEventListener('click', () => {
    if (item.source === 'calendar-event') {
      populateEventForm(item.raw);
    }
  });
  return badge;
}

function mapAvailabilityOccurrences(rangeStart, rangeEnd) {
  return state.availability
    .map(slot => {
      const start = parseDateTime(slot.appointment_date, slot.appointment_time);
      const end = new Date(start.getTime() + (60 * 60 * 1000));

      if (!slot.active || end < rangeStart || start >= rangeEnd) {
        return null;
      }

      return buildOccurrence({
        source: 'availability',
        raw: slot,
        id: slot.id,
        title: slot.label || labelProgram(slot.program),
        event_type: 'shared-appointment',
        staff_owner: slot.staff_owner || 'shared',
        notes: `${labelProgram(slot.program)} | Capacity ${slot.capacity || 1}${slot.note ? ` | ${slot.note}` : ''}`,
        start,
        end,
        all_day: false
      });
    })
    .filter(Boolean);
}

function mapBookingOccurrences(rangeStart, rangeEnd) {
  return state.bookings
    .filter(booking => booking.status !== 'refused')
    .map(booking => {
      const start = parseDateTime(booking.appointment_date, booking.appointment_time);
      const end = new Date(start.getTime() + (60 * 60 * 1000));

      if (!booking.appointment_date || end < rangeStart || start >= rangeEnd) {
        return null;
      }

      return buildOccurrence({
        source: 'booking',
        raw: booking,
        id: booking.id,
        title: `${booking.name} | ${labelProgram(booking.program)}`,
        event_type: 'booking',
        staff_owner: booking.staff_owner || 'booking',
        notes: booking.status === 'accepted' ? 'Accepted booking' : 'Pending booking',
        start,
        end,
        all_day: false
      });
    })
    .filter(Boolean);
}

function formatOccurrenceTime(item, short = false) {
  if (item.all_day) {
    return short ? 'All day' : `${formatDate(item.start)} | All day`;
  }

  const time = `${formatTime(item.start)}-${formatTime(item.end)}`;
  return short ? time : `${formatDate(item.start)} | ${time}`;
}
