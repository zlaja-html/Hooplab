import { createStaffSessionCookie, isValidStaffCode } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  if (!process.env.STAFF_ACCESS_CODE) {
    return res.status(500).json({ error: 'Staff access is not configured.' });
  }

  if (!isValidStaffCode(body.staff_code)) {
    return res.status(401).json({ error: 'Incorrect staff code.' });
  }

  res.setHeader('Set-Cookie', createStaffSessionCookie());
  return res.status(200).json({ ok: true });
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
