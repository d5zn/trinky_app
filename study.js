document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('gateForm');
  const errorEl = document.getElementById('error');
  const gateEl = document.getElementById('gate');
  const contentEl = document.getElementById('content');
  const logoutEl = document.getElementById('logout');
  const inputEl = document.getElementById('username');
  const topicsEl = document.getElementById('topics');

  const TOPICS = [
    { slug: 'creation', title: 'Создание контента', href: '/instagramboost/creation', minDay: 1 },
    { slug: 'trial_reels', title: 'Тестовые рилсы', href: '/instagramboost/trial_reels', minDay: 4 },
    { slug: 'engagement', title: 'Вовлечённость', href: '/instagramboost/engagement', minDay: 7 },
    { slug: 'reach', title: 'Охват', href: '/instagramboost/reach', minDay: 14 },
    { slug: 'monetization_ads', title: 'Монетизация и реклама', href: '/instagramboost/monetization_ads', minDay: 21 },
    { slug: 'guidelines', title: 'Где искать знания', href: '/instagramboost/guidelines', minDay: 28 },
  ];

  function sanitize(value) {
    return String(value).trim().replace(/@+/g, '').replace(/\s+/g, '');
  }

  async function getCurrentDay(username) {
    try {
      const res = await fetch('/api/get-current-day', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Ошибка');
      return data.current_day || 0;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  function renderTopics(currentDay) {
    topicsEl.innerHTML = '';
    TOPICS.forEach(t => {
      const open = currentDay >= t.minDay;
      const item = document.createElement(open ? 'a' : 'div');
      if (open) item.href = t.href + `?username=${encodeURIComponent(inputEl.value)}`;
      item.className = `topic${open ? '' : ' locked'}`;
      item.innerHTML = `
        <div>
          <h3>${t.title}</h3>
          <div class="meta">Доступ с дня: ${t.minDay}</div>
        </div>
        <span class="${open ? 'badge-open' : 'badge-locked'}">${open ? 'Открыто' : 'Закрыто'}</span>
      `;
      topicsEl.appendChild(item);
    });
  }

  function showContent() { gateEl.hidden = true; contentEl.hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function showGate(message) { if (message) { errorEl.textContent = message; errorEl.style.display = 'block'; } gateEl.hidden = false; contentEl.hidden = true; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = sanitize(inputEl.value).toLowerCase();
    if (!username) { errorEl.textContent = 'Введите ник без @'; return; }
    const day = await getCurrentDay(username);
    localStorage.setItem('trinky_user', username);
    renderTopics(day);
    showContent();
  });

  logoutEl?.addEventListener('click', () => { localStorage.removeItem('trinky_user'); showGate(''); });

  // Prefill and autologin
  const params = new URLSearchParams(window.location.search);
  const qUser = sanitize(params.get('username') || '');
  if (qUser) inputEl.value = qUser;
  const candidate = qUser || localStorage.getItem('trinky_user') || '';
  (async () => {
    if (!candidate) return;
    inputEl.value = candidate;
    const day = await getCurrentDay(candidate);
    renderTopics(day);
    showContent();
  })();
});


