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
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', evt => {
    evt.preventDefault();
    alert('Thanks for reaching out! We will respond within one business day.');
    form.reset();
  });
}
