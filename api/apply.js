// Serverless handler for Vercel/Netlify style deployments.
// Validate input and forward to your data store or notification endpoint.

const REQUIRED = ['name', 'age', 'position', 'experience', 'video', 'email', 'phone'];

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

  // TODO: Plug in your data destination. Examples:
  // - Send to Slack/Discord webhook
  // - Insert into Supabase/Airtable
  // - Send email via Resend/SendGrid
  //
  // This placeholder just echoes success.

  return res.status(200).json({ ok: true, message: 'Application received' });
}
