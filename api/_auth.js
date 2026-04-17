import crypto from 'node:crypto';

const COOKIE_NAME = 'hooplab_staff_session';
const ONE_DAY_SECONDS = 60 * 60 * 24;

export function createStaffSessionCookie() {
  const expires = Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS;
  const payload = `${expires}`;
  const signature = sign(payload);

  return `${COOKIE_NAME}=${payload}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ONE_DAY_SECONDS}`;
}

export function clearStaffSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function isStaffAuthenticated(req) {
  const cookie = parseCookies(req.headers.cookie || '')[COOKIE_NAME];

  if (!cookie) {
    return false;
  }

  const [expires, signature] = cookie.split('.');

  if (!expires || !signature) {
    return false;
  }

  if (Number(expires) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return timingSafeEqual(signature, sign(expires));
}

export function isValidStaffCode(code) {
  const expected = process.env.STAFF_ACCESS_CODE;

  if (!expected) {
    return false;
  }

  return timingSafeEqual(String(code || ''), expected);
}

function sign(value) {
  const secret = process.env.STAFF_SESSION_SECRET || process.env.STAFF_ACCESS_CODE || '';

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
