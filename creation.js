document.addEventListener('DOMContentLoaded', () => {
  async function checkAccess(username) {
    try {
      const res = await fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) return { ok: false, message: data.message || 'Ошибка доступа' };
        return data;
      } catch (_) {
        console.error('Non-JSON response:', text);
        return { ok: false, message: 'Неожиданный ответ сервера' };
      }
    } catch (e) {
      console.error('Network error:', e);
      return { ok: false, message: 'Сеть недоступна. Попробуйте позже.' };
    }
  }

  const form = document.getElementById('gateForm');
  const errorEl = document.getElementById('error');
  const gateEl = document.getElementById('gate');
  const contentEl = document.getElementById('content');
  const logoutEl = document.getElementById('logout');
  const inputEl = document.getElementById('username');
  const submitBtn = form?.querySelector('button');

  function showContent() {
    gateEl.hidden = true;
    contentEl.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showGate(message) {
    if (message) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    gateEl.hidden = false;
    contentEl.hidden = true;
  }

  function sanitize(value) {
    return String(value).trim().replace(/@+/g, '').replace(/\s+/g, '');
  }

  function validateLocal(value) {
    if (!value) return 'Введите ник без @';
    if (/[@\s]/.test(value)) return 'Только латиница, без пробелов и без @';
    if (!/^[a-zA-Z0-9._]+$/.test(value)) return 'Допустимы символы: a-z, 0-9, точка и подчёркивание';
    if (value.length > 64) return 'Слишком длинный ник';
    return '';
  }

  if (!form || !inputEl) return;

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

  async function handleSubmit(username) {
    const msg = validateLocal(username);
    if (msg) {
      inputEl.classList.add('input-invalid');
      errorEl.textContent = msg;
      return;
    }
    submitBtn.disabled = true;
    const oldText = submitBtn.textContent;
    submitBtn.textContent = 'Проверяем...';
    const result = await checkAccess(username.toLowerCase());
    submitBtn.textContent = oldText;
    submitBtn.disabled = false;
    console.log('Access result:', result);
    if (result.ok) {
      localStorage.setItem('trinky_user', username);
      inputEl.classList.remove('input-invalid');
      // После успешной проверки переходим на страницу-хаб study
      const target = `/instagramboost/study?username=${encodeURIComponent(username)}`;
      window.location.assign(target);
      return;
    } else {
      inputEl.classList.add('input-invalid');
      showGate(result.message || 'Неверный ник или нет доступа');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const username = sanitize(inputEl.value);
    handleSubmit(username);
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
    handleSubmit(candidate);
  }
});
