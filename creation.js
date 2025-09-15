document.addEventListener('DOMContentLoaded', () => {
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
  const inputEl = document.getElementById('username');

  function showContent() {
    gateEl.hidden = true;
    contentEl.hidden = false;
  }
  function showGate(message) {
    errorEl.textContent = message || '';
    gateEl.hidden = false;
    contentEl.hidden = true;
  }

  function sanitize(value) {
    return String(value).trim().replace(/^@+/, '').replace(/\s+/g, '');
  }

  function validateLocal(value) {
    if (!value) return 'Введите ник без @';
    if (/[@\s]/.test(value)) return 'Только латиница, без пробелов и без @';
    if (!/^[a-zA-Z0-9._]+$/.test(value)) return 'Допустимы символы: a-z, 0-9, точка и подчёркивание';
    if (value.length > 64) return 'Слишком длинный ник';
    return '';
  }

  if (!form || !inputEl) return; // без формы скрипт завершает работу

  inputEl.addEventListener('input', () => {
    const raw = inputEl.value;
    const v = sanitize(raw);
    if (v !== raw) inputEl.value = v;
    const msg = validateLocal(v);
    if (msg) {
      inputEl.classList.add('input-invalid');
      errorEl.textContent = msg;
    } else {
      inputEl.classList.remove('input-invalid');
      errorEl.textContent = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const username = sanitize(inputEl.value);
    const msg = validateLocal(username);
    if (msg) {
      inputEl.classList.add('input-invalid');
      errorEl.textContent = msg;
      return;
    }
    form.querySelector('button').disabled = true;
    const result = await checkAccess(username.toLowerCase());
    form.querySelector('button').disabled = false;
    if (result.ok) {
      localStorage.setItem('trinky_user', username);
      inputEl.classList.remove('input-invalid');
      showContent();
    } else {
      inputEl.classList.add('input-invalid');
      showGate(result.message || 'Неверный ник или нет доступа');
    }
  });

  logoutEl?.addEventListener('click', () => {
    localStorage.removeItem('trinky_user');
    showGate('');
  });

  // Prefill from query ?username=
  const params = new URLSearchParams(window.location.search);
  const qUser = sanitize(params.get('username') || '');
  if (qUser) {
    inputEl.value = qUser;
  }

  // Auto-login if stored or from query
  const candidate = qUser || localStorage.getItem('trinky_user') || '';
  if (candidate) {
    checkAccess(candidate.toLowerCase()).then((r) => {
      if (r.ok) showContent();
    });
  }
});
