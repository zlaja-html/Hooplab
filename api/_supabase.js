const BOOKINGS_TABLE = process.env.SUPABASE_BOOKINGS_TABLE || 'hooplab_bookings';
const AVAILABILITY_TABLE = process.env.SUPABASE_AVAILABILITY_TABLE || 'hooplab_availability';
const TRAINING_PLANS_TABLE = process.env.SUPABASE_TRAINING_PLANS_TABLE || 'hooplab_training_plans';
const STAFF_MEDIA_TABLE = process.env.SUPABASE_STAFF_MEDIA_TABLE || 'hooplab_staff_media';

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createBooking(booking) {
  const response = await supabaseFetch(BOOKINGS_TABLE, '', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(booking)
  });

  if (response.status === 409) {
    return { conflict: true };
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return { booking: rows[0] };
}

export async function listBookings() {
  const fields = [
    'id',
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
    'status',
    'accepted_at',
    'refused_at',
    'created_at'
  ].join(',');
  const response = await supabaseFetch(BOOKINGS_TABLE, `?select=${fields}&order=created_at.desc`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase list failed: ${response.status} ${details}`);
  }

  return response.json();
}

export async function getBooking(id) {
  const fields = [
    'id',
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
    'status',
    'accepted_at',
    'refused_at',
    'created_at'
  ].join(',');
  const response = await supabaseFetch(BOOKINGS_TABLE, `?id=eq.${encodeURIComponent(id)}&select=${fields}&limit=1`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase booking lookup failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function listBookingCounts() {
  const response = await supabaseFetch(BOOKINGS_TABLE, '?select=appointment,status');

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase count failed: ${response.status} ${details}`);
  }

  const rows = await response.json();

  return rows.reduce((counts, row) => {
    if (row.appointment && row.status !== 'cancelled' && row.status !== 'refused') {
      counts[row.appointment] = (counts[row.appointment] || 0) + 1;
    }

    return counts;
  }, {});
}

export async function acceptBooking(id) {
  const response = await supabaseFetch(BOOKINGS_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase accept failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function refuseBooking(id) {
  const response = await supabaseFetch(BOOKINGS_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      status: 'refused',
      refused_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase refuse failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function deleteBooking(id) {
  const response = await supabaseFetch(BOOKINGS_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase booking delete failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function listAvailability({ activeOnly = false } = {}) {
  const fields = [
    'id',
    'program',
    'appointment',
    'appointment_date',
    'appointment_time',
    'label',
    'note',
    'capacity',
    'active',
    'created_at'
  ].join(',');
  const activeQuery = activeOnly ? '&active=eq.true' : '';
  const response = await supabaseFetch(
    AVAILABILITY_TABLE,
    `?select=${fields}${activeQuery}&order=appointment_date.asc&order=appointment_time.asc`
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase availability list failed: ${response.status} ${details}`);
  }

  return response.json();
}

export async function getAvailability(id) {
  const fields = [
    'id',
    'program',
    'appointment',
    'appointment_date',
    'appointment_time',
    'label',
    'note',
    'capacity',
    'active',
    'created_at'
  ].join(',');
  const response = await supabaseFetch(AVAILABILITY_TABLE, `?id=eq.${encodeURIComponent(id)}&select=${fields}&limit=1`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase availability lookup failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function createAvailability(slot) {
  const response = await supabaseFetch(AVAILABILITY_TABLE, '', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(slot)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase availability insert failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function updateAvailability(id, updates) {
  const response = await supabaseFetch(AVAILABILITY_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase availability update failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function deleteAvailability(id) {
  const response = await supabaseFetch(AVAILABILITY_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase availability delete failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function listTrainingPlans() {
  const fields = [
    'id',
    'booking_id',
    'availability_id',
    'program',
    'title',
    'player_overview',
    'player_topics',
    'prep_notes',
    'coach_notes',
    'drills',
    'created_at',
    'updated_at'
  ].join(',');
  const response = await supabaseFetch(
    TRAINING_PLANS_TABLE,
    `?select=${fields}&order=updated_at.desc.nullslast&order=created_at.desc`
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase training-plan list failed: ${response.status} ${details}`);
  }

  return response.json();
}

export async function getTrainingPlan(id) {
  const fields = [
    'id',
    'booking_id',
    'availability_id',
    'program',
    'title',
    'player_overview',
    'player_topics',
    'prep_notes',
    'coach_notes',
    'drills',
    'created_at',
    'updated_at'
  ].join(',');
  const response = await supabaseFetch(TRAINING_PLANS_TABLE, `?id=eq.${encodeURIComponent(id)}&select=${fields}&limit=1`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase training-plan lookup failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function createTrainingPlan(plan) {
  const response = await supabaseFetch(TRAINING_PLANS_TABLE, '', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(plan)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase training-plan insert failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function updateTrainingPlan(id, updates) {
  const response = await supabaseFetch(TRAINING_PLANS_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      ...updates,
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase training-plan update failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function deleteTrainingPlan(id) {
  const response = await supabaseFetch(TRAINING_PLANS_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase training-plan delete failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function listStaffMedia({ includeHidden = false } = {}) {
  const fields = [
    'id',
    'title',
    'src',
    'filename',
    'is_builtin',
    'hidden',
    'created_at'
  ].join(',');
  const hiddenQuery = includeHidden ? '' : '&hidden=eq.false';
  const response = await supabaseFetch(
    STAFF_MEDIA_TABLE,
    `?select=${fields}${hiddenQuery}&order=is_builtin.desc&order=created_at.asc`
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase staff-media list failed: ${response.status} ${details}`);
  }

  return response.json();
}

export async function createStaffMedia(item) {
  const response = await supabaseFetch(STAFF_MEDIA_TABLE, '', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(item)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase staff-media insert failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0];
}

export async function updateStaffMedia(id, updates) {
  const response = await supabaseFetch(STAFF_MEDIA_TABLE, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase staff-media update failed: ${response.status} ${details}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

async function supabaseFetch(table, query = '', options = {}) {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase is not configured');
  }

  const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');

  return fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}
