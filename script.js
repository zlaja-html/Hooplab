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

function buildImageCandidates(key) {
  const clean = key.trim();
  const variants = [
    clean,
    clean.toLowerCase(),
    clean.replace(/-/g, '_'),
    clean.replace(/-/g, ' '),
    clean.replace(/-/g, '')
  ];
  const folders = ['', 'images/', 'img/', 'assets/', 'assets/images/', 'uploads/'];
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.JPG', '.JPEG', '.PNG', '.WEBP'];

  const results = new Set();
  variants.forEach(name => {
    folders.forEach(folder => {
      extensions.forEach(ext => {
        results.add(`${folder}${name}${ext}`);
      });
    });
  });

  return [...results];
}

function testImage(path) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(path);
    image.onerror = () => resolve(null);
    image.src = path;
  });
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
    if (image.getAttribute('src')) {
      image.addEventListener('error', () => useFallback(image), { once: true });
      continue;
    }

    const key = image.dataset.imageKey;
    if (!key) {
      useFallback(image);
      continue;
    }

    const candidates = buildImageCandidates(key);
    let matched = null;

    for (const candidate of candidates) {
      // eslint-disable-next-line no-await-in-loop
      matched = await testImage(candidate);
      if (matched) {
        break;
      }
    }

    if (matched) {
      image.src = matched;
      image.addEventListener('error', () => useFallback(image), { once: true });
    } else {
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
