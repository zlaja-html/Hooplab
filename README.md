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
- `api/apply.js` is a serverless handler (Vercel/Netlify style). It validates required fields and emails submissions to `contact@hooplab-agency.com` using Resend.
- Configure environment variable `RESEND_API_KEY` in your hosting platform (e.g., Vercel Project Settings > Environment Variables).
- Optional: set `RESEND_FROM` to a verified sender (e.g., `HoopLab Agency <no-reply@yourdomain.com>`). Without it, the handler uses `HoopLab Agency <onboarding@resend.dev>` as a fallback that does not require domain verification.
- Deploy on a host that supports serverless routes (e.g., Vercel). Static-only hosts without functions will not process the form.

## Run locally
- Open `index.html` directly in your browser, or run a static server (e.g., `npx serve .`) from the repo root.
- The serverless route won’t run locally unless you emulate it; for local preview, form submission will hit `/api/apply` and fail unless you proxy or mock it.
