// Simple smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', evt => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      evt.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Lightweight form handling placeholder
const form = document.querySelector('#apply-form');
if (form) {
  const hint = document.getElementById('form-hint');

  form.addEventListener('submit', evt => {
    evt.preventDefault();
    const data = new FormData(form);
    // Honeypot basic spam guard
    if (data.get('extra_field')) {
      return;
    }
    const payload = Object.fromEntries(data.entries());

    fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        hint.textContent = data.message || 'Application received. We will review and respond after evaluation.';
        hint.style.color = '#0b5fff';
        form.reset();
      } else {
        hint.textContent = data.error || 'Could not submit right now. Please email us your details.';
        hint.style.color = '#c00';
      }
    }).catch(() => {
      hint.textContent = 'Could not submit right now. Please email us your details.';
      hint.style.color = '#c00';
    });
  });
}
