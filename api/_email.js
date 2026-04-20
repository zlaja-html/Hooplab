const DESTINATION = process.env.DESTINATION_EMAIL || 'contact@hooplab-agency.com';
const DEFAULT_FROM = 'HoopLab Agency <onboarding@resend.dev>';

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({ to = [DESTINATION], subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Email service not configured. Set RESEND_API_KEY.');
  }

  let from = process.env.RESEND_FROM || DEFAULT_FROM;

  if (!/^[^<]*<[^@>]+@[^>]+>$/.test(from) && !/^[^@]+@[^@]+$/.test(from)) {
    console.warn('Invalid RESEND_FROM value, falling back to default sender');
    from = DEFAULT_FROM;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email send failed: ${response.status} ${details}`);
  }

  return response.json();
}
