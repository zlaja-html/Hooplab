// Serverless handler for Vercel/Netlify style deployments.
// Validates input and emails applications to the HoopLab inbox via Resend.

const REQUIRED = ['name', 'age', 'position', 'experience', 'video', 'email', 'phone'];
const DESTINATION = 'contact@hooplab-agency.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const missing = REQUIRED.filter(key => !body[key]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }

  // Honeypot spam guard
  if (body.extra_field) {
    return res.status(200).json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured. Set RESEND_API_KEY.' });
  }

  const text = [
    `New HoopLab application`,
    `Name: ${body.name}`,
    `Age: ${body.age}`,
    `Position: ${body.position}`,
    `Experience: ${body.experience}`,
    `Highlight: ${body.video}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`
  ].join('\n');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HoopLab Agency <no-reply@hooplab-agency.com>',
        to: [DESTINATION],
        subject: 'New HoopLab application',
        text
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(502).json({ error: 'Email send failed', details: err });
    }

    return res.status(200).json({ ok: true, message: 'Application received' });
  } catch (e) {
    return res.status(502).json({ error: 'Email send failed', details: e.message });
  }
}
