document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('img.photo').forEach(image => {
  image.addEventListener('error', () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-missing';
    placeholder.textContent = image.dataset.fallback || image.alt || 'Image';
    image.replaceWith(placeholder);
  });
});

const form = document.querySelector('#apply-form');
if (form) {
  const hint = document.getElementById('form-hint');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);

    if (data.get('extra_field')) {
      return;
    }

    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        hint.textContent = result.message || 'Application received. We will review and respond after evaluation.';
        hint.style.color = '#0b5fff';
        form.reset();
      } else {
        hint.textContent = result.error || 'Could not submit right now. Please email us your details.';
        hint.style.color = '#c70000';
      }
    } catch {
      hint.textContent = 'Could not submit right now. Please email us your details.';
      hint.style.color = '#c70000';
    }
  });
}
