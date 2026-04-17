const TABLE = process.env.SUPABASE_BOOKINGS_TABLE || 'hooplab_bookings';

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createBooking(booking) {
  const response = await supabaseFetch('', {
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
    'created_at'
  ].join(',');
  const response = await supabaseFetch(`?select=${fields}&order=created_at.desc`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase list failed: ${response.status} ${details}`);
  }

  return response.json();
}

export async function listBookingCounts() {
  const response = await supabaseFetch('?select=appointment');

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase count failed: ${response.status} ${details}`);
  }

  const rows = await response.json();

  return rows.reduce((counts, row) => {
    if (row.appointment) {
      counts[row.appointment] = (counts[row.appointment] || 0) + 1;
    }

    return counts;
  }, {});
}

async function supabaseFetch(query = '', options = {}) {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase is not configured');
  }

  const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');

  return fetch(`${baseUrl}/rest/v1/${TABLE}${query}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}
