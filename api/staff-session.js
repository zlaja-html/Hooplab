import { getStaffSession, isStaffAuthenticated, listStaffUsers } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isStaffAuthenticated(req)) {
    return res.status(401).json({ error: 'Staff login required.', staffUsers: listStaffUsers() });
  }

  return res.status(200).json({
    authenticated: true,
    staffUser: getStaffSession(req),
    staffUsers: listStaffUsers()
  });
}
