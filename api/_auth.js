import crypto from 'node:crypto';

const COOKIE_NAME = 'hooplab_staff_session';
const ONE_DAY_SECONDS = 60 * 60 * 24;

export function createStaffSessionCookie(staffUser) {
  const expires = Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS;
  const normalized = normalizeStaffUser(staffUser) || { id: 'staff', name: 'Staff', color: '#155eef' };
  const payloadData = {
    exp: expires,
    id: normalized.id,
    name: normalized.name,
    color: normalized.color
  };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
  const signature = sign(payload);

  return `${COOKIE_NAME}=${payload}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ONE_DAY_SECONDS}`;
}

export function clearStaffSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function isStaffAuthenticated(req) {
  return Boolean(getStaffSession(req));
}

export function getStaffSession(req) {
  const cookie = parseCookies(req.headers.cookie || '')[COOKIE_NAME];

  if (!cookie) {
    return null;
  }

  const [payload, signature] = cookie.split('.');

  if (!payload || !signature) {
    return null;
  }

  if (!timingSafeEqual(signature, sign(payload))) {
    return null;
  }

  const session = parseSessionPayload(payload);

  if (!session || Number(session.exp) < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return normalizeStaffUser(session);
}

export function getStaffUserFromCredentials(userId, code) {
  const staffUsers = getConfiguredStaffUsers();
  const requestedId = String(userId || '').trim().toLowerCase();

  if (!staffUsers.length) {
    const expected = process.env.STAFF_ACCESS_CODE;

    if (!expected || !timingSafeEqual(String(code || ''), expected)) {
      return null;
    }

    return normalizeStaffUser({ id: requestedId || 'staff', name: requestedId || 'Staff' });
  }

  const match = staffUsers.find(user => user.id === requestedId);

  if (!match || !timingSafeEqual(String(code || ''), String(match.code || ''))) {
    return null;
  }

  return normalizeStaffUser(match);
}

export function listStaffUsers() {
  return getConfiguredStaffUsers().map(normalizeStaffUser);
}

function sign(value) {
  const secret = process.env.STAFF_SESSION_SECRET || process.env.STAFF_ACCESS_CODE || getFallbackSessionSecret();

  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function parseCookies(header) {
  return header.split(';').reduce((cookies, part) => {
    const [name, ...value] = part.trim().split('=');

    if (name) {
      cookies[name] = decodeURIComponent(value.join('='));
    }

    return cookies;
  }, {});
}

function timingSafeEqual(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function getConfiguredStaffUsers() {
  const usersFromJson = parseStaffUsersJson(process.env.STAFF_USERS_JSON);

  if (usersFromJson.length) {
    return usersFromJson;
  }

  const fallbackUsers = [
    createEnvUser('harun', 'Harun', process.env.HARUN_ACCESS_CODE, process.env.HARUN_COLOR || '#155eef'),
    createEnvUser('zlatan', 'Zlatan', process.env.ZLATAN_ACCESS_CODE, process.env.ZLATAN_COLOR || '#8b5cf6')
  ].filter(Boolean);

  return fallbackUsers;
}

function createEnvUser(id, name, code, color) {
  if (!code) {
    return null;
  }

  return { id, name, code, color };
}

function parseStaffUsersJson(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item => item && item.id && item.code);
  } catch {
    return [];
  }
}

function parseSessionPayload(payload) {
  try {
    return JSON.parse(Buffer.from(String(payload), 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function normalizeStaffUser(user) {
  if (!user) {
    return null;
  }

  const id = String(user.id || 'staff').trim().toLowerCase();
  const fallbackName = id ? `${id.charAt(0).toUpperCase()}${id.slice(1)}` : 'Staff';

  return {
    id,
    name: String(user.name || fallbackName).trim(),
    color: normalizeColor(user.color)
  };
}

function normalizeColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#155eef';
}

function getFallbackSessionSecret() {
  const configuredUsers = getConfiguredStaffUsers();
  return configuredUsers.map(user => `${user.id}:${user.code}`).join('|') || 'hooplab-staff-session';
}
