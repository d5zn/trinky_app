// Motion One: lightweight animations by Framer team
import { animate, timeline, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@10.16.4/dist/motion.mjs";

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Headline intro: split letters and animate in
const headline = document.getElementById('headline');
const text = headline.textContent;
headline.setAttribute('aria-label', text);
headline.textContent = '';

const frag = document.createDocumentFragment();
text.split('').forEach((ch) => {
  const span = document.createElement('span');
  span.textContent = ch;
  span.style.display = 'inline-block';
  span.style.willChange = 'transform, opacity, filter';
  frag.appendChild(span);
});
headline.appendChild(frag);

timeline([
  [headline.querySelectorAll('span'),
    { opacity: [0, 1], y: [20, 0], filter: ['blur(6px)', 'blur(0px)'] },
    { duration: 0.8, delay: stagger(0.03), easing: 'cubic-bezier(.2,.8,.2,1)' }],
]);

// Cards: subtle scale on enter
inView('.card', (entry) => {
  const el = entry.target;
  animate(el, { opacity: [0, 1], y: [20, 0], scale: [0.98, 1] }, { duration: 0.6, easing: 'ease-out' });
});

// Feature items stagger
inView('.feature-item', (entry) => {
  const items = document.querySelectorAll('.feature-item');
  animate(items, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, delay: stagger(0.08), easing: 'ease-out' });
});

// Timeline items
inView('.timeline-item', (entry) => {
  const items = document.querySelectorAll('.timeline-item');
  animate(items, { opacity: [0, 1], x: [-20, 0] }, { duration: 0.6, delay: stagger(0.1), easing: 'ease-out' });
});

// Parallax tilt for phone mockups
const mockups = document.querySelector('.hero__mockups');
const phones = Array.from(document.querySelectorAll('.phone'));
if (mockups && phones.length) {
  let bounds = mockups.getBoundingClientRect();
  const onMove = (e) => {
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    phones.forEach((p, i) => {
      const depth = i === 1 ? 1 : 0.6; // center strongest
      animate(p, { transform: `translate3d(${x * 14 * depth}px, ${y * 10 * depth}px, 0) rotate(${getComputedStyle(p).getPropertyValue('--rot') || '0deg'})` }, { duration: 0.4 });
    });
  };
  const onResize = () => { bounds = mockups.getBoundingClientRect(); };
  mockups.addEventListener('mousemove', onMove);
  window.addEventListener('resize', onResize);
}

// Sticky header reveal on scroll direction
let lastY = window.scrollY;
const header = document.querySelector('.site-header');
const reveal = () => {
  const y = window.scrollY;
  const goingUp = y < lastY;
  header.style.transform = goingUp ? 'translateY(0)' : 'translateY(-100%)';
  header.style.transition = 'transform .35s ease';
  lastY = y;
};
window.addEventListener('scroll', reveal, { passive: true });

// Notify form handling
function showNotify() {
  const notifySection = document.getElementById('notify');
  notifySection.scrollIntoView({ behavior: 'smooth' });
}

// Form submission
const notifyForm = document.getElementById('notifyForm');
if (notifyForm) {
  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simple validation
    if (email && email.includes('@')) {
      // Here you would typically send the email to your backend
      alert('Спасибо! Мы уведомим вас о запуске приложения.');
      e.target.reset();
    } else {
      alert('Пожалуйста, введите корректный email адрес.');
    }
  });
}
