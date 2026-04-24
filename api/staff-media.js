import { isStaffAuthenticated } from './_auth.js';
import {
  createStaffMedia,
  hasSupabaseConfig,
  listStaffMedia,
  updateStaffMedia
} from './_supabase.js';

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return res.status(500).json({ error: 'Booking database is not configured.' });
  }

  if (!isStaffAuthenticated(req)) {
    return res.status(401).json({ error: 'Staff login required.' });
  }

  try {
    if (req.method === 'GET') {
      const media = await listStaffMedia();
      return res.status(200).json({ media });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

    if (req.method === 'POST') {
      const title = String(body.title || '').trim();
      const src = String(body.src || '').trim();
      const filename = String(body.filename || '').trim();

      if (!title || !src || !filename) {
        return res.status(400).json({ error: 'Missing media fields.' });
      }

      if (!src.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Only image uploads are supported.' });
      }

      const item = await createStaffMedia({
        title,
        src,
        filename,
        is_builtin: false,
        hidden: false
      });

      return res.status(200).json({ item });
    }

    if (req.method === 'PATCH') {
      if (!body.id) {
        return res.status(400).json({ error: 'Missing media id.' });
      }

      const item = await updateStaffMedia(body.id, {
        hidden: body.hidden !== false
      });

      return res.status(200).json({ item });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Staff media API failed', error);
    return res.status(500).json({ error: 'Could not update staff media.' });
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
