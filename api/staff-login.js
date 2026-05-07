import { createStaffSessionCookie, getStaffUserFromCredentials, listStaffUsers } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  const staffUser = getStaffUserFromCredentials(body.staff_user, body.staff_code);

  if (!staffUser && !process.env.STAFF_ACCESS_CODE && !listStaffUsers().length) {
    return res.status(500).json({ error: 'Staff access is not configured.' });
  }

  if (!staffUser) {
    return res.status(401).json({ error: 'Incorrect staff code.' });
  }

  res.setHeader('Set-Cookie', createStaffSessionCookie(staffUser));
  return res.status(200).json({ ok: true, staffUser });
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
