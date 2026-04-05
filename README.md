# Hooplab Landing Page

Static landing page for the Hooplab agency using a blue/white/black palette.

## Run locally
1) Clone the repo (already in this folder).
2) Open `index.html` in your browser.

## Customize
- Update copy in `index.html` (Home, About, Services, Tryouts, Tours, Apply).
- Tweak colors/spacing in `styles.css` (`:root` variables at the top).
- Adjust form fields in the Apply section if needed.

## Deployment
This is plain HTML/CSS/JS and can be hosted on any static host (GitHub Pages, Netlify, Vercel, S3, etc.). No build step required.

## Form backend (Apply)
- The Apply form posts to `/api/apply` (see `api/apply.js`).
- `api/apply.js` is a serverless handler (Vercel/Netlify style). It validates required fields and currently returns success.
- Plug in your destination inside `api/apply.js` (Slack/Discord webhook, Supabase/Airtable insert, or email via Resend/SendGrid) and deploy on a host that supports serverless routes (e.g., Vercel).
