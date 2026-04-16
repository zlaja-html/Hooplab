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

async function urlExists(url) {
  try {
    let response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (response.status === 405) {
      response = await fetch(url, { method: 'GET', cache: 'no-store' });
    }
    return response.ok;
  } catch {
    return false;
  }
}

function buildImageCandidates(key) {
  const clean = key.trim();
  const variants = [
    clean,
    clean.toLowerCase(),
    clean.replace(/-/g, '_'),
    clean.replace(/-/g, ' '),
    clean.replace(/-/g, '')
  ];
  const folders = ['', 'images/', 'img/', 'assets/', 'assets/images/', 'uploads/', 'public/', 'public/images/'];
  const ext = ['', '.jpg', '.jpeg', '.png', '.webp', '.avif', '.JPG', '.JPEG', '.PNG', '.WEBP'];

  const candidates = new Set();
  variants.forEach(name => {
    folders.forEach(folder => {
      ext.forEach(suffix => {
        candidates.add(`${folder}${name}${suffix}`);
      });
    });
  });

  return [...candidates];
}

function useFallback(image) {
  const placeholder = document.createElement('div');
  placeholder.className = 'photo-missing';
  placeholder.textContent = image.dataset.fallback || image.alt || 'Image';
  image.replaceWith(placeholder);
}

async function resolveImages() {
  const images = [...document.querySelectorAll('img.photo')];

  for (const image of images) {
    const key = image.dataset.imageKey;
    const directSrc = image.getAttribute('src');

    if (directSrc) {
      image.addEventListener('error', () => useFallback(image), { once: true });
      continue;
    }

    if (!key) {
      useFallback(image);
      continue;
    }

    const candidates = buildImageCandidates(key);
    let matched = false;

    for (const candidate of candidates) {
      if (await urlExists(candidate)) {
        image.src = candidate;
        image.addEventListener('error', () => useFallback(image), { once: true });
        matched = true;
        break;
      }
    }

    if (!matched) {
      useFallback(image);
    }
  }
}

resolveImages();

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
