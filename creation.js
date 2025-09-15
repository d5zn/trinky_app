async function checkAccess(username) {
  const res = await fetch('/api/check-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!res.ok) {
    return { ok: false, message: 'Сервис недоступен. Попробуйте позже.' };
  }
  return res.json();
}

const form = document.getElementById('gateForm');
const errorEl = document.getElementById('error');
const gateEl = document.getElementById('gate');
const contentEl = document.getElementById('content');
const logoutEl = document.getElementById('logout');

function showContent() {
  gateEl.hidden = true;
  contentEl.hidden = false;
}
function showGate(message) {
  errorEl.textContent = message || '';
  gateEl.hidden = false;
  contentEl.hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const raw = new FormData(form).get('username') || '';
  const username = String(raw).trim().replace(/^@+/, '');
  if (!username) {
    errorEl.textContent = 'Введите ник без @';
    return;
  }
  form.querySelector('button').disabled = true;
  const result = await checkAccess(username);
  form.querySelector('button').disabled = false;
  if (result.ok) {
    localStorage.setItem('trinky_user', username);
    showContent();
  } else {
    showGate(result.message || 'Доступ запрещен');
  }
});

logoutEl?.addEventListener('click', () => {
  localStorage.removeItem('trinky_user');
  showGate('');
});

// Auto-login if stored
const stored = localStorage.getItem('trinky_user');
if (stored) {
  checkAccess(stored).then((r) => {
    if (r.ok) showContent();
  });
}
