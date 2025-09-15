const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname)));

// Главная страница теперь доступна по /main, а корень редиректит
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/', (req, res) => {
  res.redirect(302, '/main');
});

// Хост-бейз роутинг для поддомена instagram-boost.trinky.app
function isBoostHost(req) {
  const host = (req.headers.host || '').toLowerCase();
  return host.startsWith('instagram-boost.') || host.includes('instagram-boost.trinky.app');
}

// На поддомене: корень = лендинг челленджа, /study = кабинет
app.get('/', (req, res, next) => {
  if (!isBoostHost(req)) return next();
  return res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/study', (req, res, next) => {
  if (!isBoostHost(req)) return next();
  return res.sendFile(path.join(__dirname, 'study.html'));
});
app.get('/study/creation', (req, res, next) => {
  if (!isBoostHost(req)) return next();
  return res.sendFile(path.join(__dirname, 'creation.html'));
});
app.get('/study/trial_reels', (req, res, next) => {
  if (!isBoostHost(req)) return next();
  return res.sendFile(path.join(__dirname, 'trial_reels.html'));
});

// (Старые пути /instagramboost* удалены)

// API: проверка пользователя в Notion
app.post('/api/check-user', async (req, res) => {
  try {
    const usernameRaw = (req.body && req.body.username) || '';
    const normalize = (s) => String(s).trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    const username = normalize(usernameRaw);
    if (!username || username.length > 64) {
      return res.status(400).json({ ok: false, message: 'Введите ник без @' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    // Поддерживаем оба названия переменной: NOTION_USERS_DB_ID и NOTION_USERS_DB
    const usersDbId = process.env.NOTION_USERS_DB_ID || process.env.NOTION_USERS_DB;

    if (!notionToken || !usersDbId) {
      return res.status(500).json({ ok: false, message: 'Конфигурация сервера не настроена' });
    }

    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: notionToken });

    // Сначала узкий точный фильтр
    const exact = await notion.databases.query({
      database_id: usersDbId,
      filter: {
        and: [
          { property: 'instagram', rich_text: { equals: username } },
          { property: 'current_day', number: { greater_than_or_equal_to: 1 } }
        ]
      },
      page_size: 1
    });
    if (Array.isArray(exact.results) && exact.results.length) {
      return res.json({ ok: true });
    }

    // Затем широкий поиск и ручная нормализация
    const wide = await notion.databases.query({
      database_id: usersDbId,
      filter: { property: 'current_day', number: { greater_than_or_equal_to: 1 } },
      page_size: 10,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    });

    const getInstagramValue = (page) => {
      const prop = page.properties && page.properties.instagram;
      if (!prop) return '';
      if (prop.type === 'title' || prop.type === 'rich_text') {
        const arr = prop[prop.type] || [];
        return normalize(arr.map((t) => t.plain_text || '').join(''));
      }
      if (prop.type === 'url' && prop.url) return normalize(prop.url);
      if (prop.type === 'people' && Array.isArray(prop.people) && prop.people[0]?.name) return normalize(prop.people[0].name);
      return '';
    };

    const matched = (wide.results || []).some((p) => getInstagramValue(p) === username);
    return res.json({ ok: matched, message: matched ? undefined : 'Пользователь не найден или нет доступа' });
  } catch (e) {
    console.error('check-user error', e);
    return res.status(500).json({ ok: false, message: 'Ошибка сервера' });
  }
});

// API: проверка пользователя в Notion для trial (требуется current_day >= 3)
app.post('/api/check-user-trial', async (req, res) => {
  try {
    const usernameRaw = (req.body && req.body.username) || '';
    const normalize = (s) => String(s).trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    const username = normalize(usernameRaw);
    if (!username || username.length > 64) {
      return res.status(400).json({ ok: false, message: 'Введите ник без @' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const usersDbId = process.env.NOTION_USERS_DB_ID || process.env.NOTION_USERS_DB;

    if (!notionToken || !usersDbId) {
      return res.status(500).json({ ok: false, message: 'Конфигурация сервера не настроена' });
    }

    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: notionToken });

    // Узкий точный фильтр с current_day >= 3
    const exact = await notion.databases.query({
      database_id: usersDbId,
      filter: {
        and: [
          { property: 'instagram', rich_text: { equals: username } },
          { property: 'current_day', number: { greater_than_or_equal_to: 3 } }
        ]
      },
      page_size: 1
    });
    if (Array.isArray(exact.results) && exact.results.length) {
      return res.json({ ok: true });
    }

    // Широкий поиск и ручная нормализация
    const wide = await notion.databases.query({
      database_id: usersDbId,
      filter: { property: 'current_day', number: { greater_than_or_equal_to: 3 } },
      page_size: 10,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    });

    const getInstagramValue = (page) => {
      const prop = page.properties && page.properties.instagram;
      if (!prop) return '';
      if (prop.type === 'title' || prop.type === 'rich_text') {
        const arr = prop[prop.type] || [];
        return normalize(arr.map((t) => t.plain_text || '').join(''));
      }
      if (prop.type === 'url' && prop.url) return normalize(prop.url);
      if (prop.type === 'people' && Array.isArray(prop.people) && prop.people[0]?.name) return normalize(prop.people[0].name);
      return '';
    };

    const matched = (wide.results || []).some((p) => getInstagramValue(p) === username);
    return res.json({ ok: matched, message: matched ? undefined : 'Доступ к разделу открыт с 3-го дня' });
  } catch (e) {
    console.error('check-user-trial error', e);
    return res.status(500).json({ ok: false, message: 'Ошибка сервера' });
  }
});

// API: проверка на произвольный минимальный день current_day >= minDay
app.post('/api/check-user-min', async (req, res) => {
  try {
    const usernameRaw = (req.body && req.body.username) || '';
    const minDayRaw = req.body && req.body.minDay;
    const normalize = (s) => String(s).trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    const username = normalize(usernameRaw);
    const minDay = Number(minDayRaw);
    if (!username || username.length > 64) {
      return res.status(400).json({ ok: false, message: 'Введите ник без @' });
    }
    if (!Number.isFinite(minDay) || minDay < 0) {
      return res.status(400).json({ ok: false, message: 'Некорректный параметр minDay' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const usersDbId = process.env.NOTION_USERS_DB_ID || process.env.NOTION_USERS_DB;
    if (!notionToken || !usersDbId) {
      return res.status(500).json({ ok: false, message: 'Конфигурация сервера не настроена' });
    }

    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: notionToken });

    const exact = await notion.databases.query({
      database_id: usersDbId,
      filter: {
        and: [
          { property: 'instagram', rich_text: { equals: username } },
          { property: 'current_day', number: { greater_than_or_equal_to: minDay } }
        ]
      },
      page_size: 1
    });
    if (Array.isArray(exact.results) && exact.results.length) {
      return res.json({ ok: true });
    }

    const wide = await notion.databases.query({
      database_id: usersDbId,
      filter: { property: 'current_day', number: { greater_than_or_equal_to: minDay } },
      page_size: 10,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    });

    const getInstagramValue = (page) => {
      const prop = page.properties && page.properties.instagram;
      if (!prop) return '';
      if (prop.type === 'title' || prop.type === 'rich_text') {
        const arr = prop[prop.type] || [];
        return normalize(arr.map((t) => t.plain_text || '').join(''));
      }
      if (prop.type === 'url' && prop.url) return normalize(prop.url);
      if (prop.type === 'people' && Array.isArray(prop.people) && prop.people[0]?.name) return normalize(prop.people[0].name);
      return '';
    };

    const matched = (wide.results || []).some((p) => getInstagramValue(p) === username);
    return res.json({ ok: matched });
  } catch (e) {
    console.error('check-user-min error', e);
    return res.status(500).json({ ok: false, message: 'Ошибка сервера' });
  }
});

// API: получить текущий день пользователя current_day
app.post('/api/get-current-day', async (req, res) => {
  try {
    const usernameRaw = (req.body && req.body.username) || '';
    const normalize = (s) => String(s).trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    const username = normalize(usernameRaw);
    if (!username || username.length > 64) {
      return res.status(400).json({ ok: false, message: 'Введите ник без @' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const usersDbId = process.env.NOTION_USERS_DB_ID || process.env.NOTION_USERS_DB;
    if (!notionToken || !usersDbId) {
      return res.status(500).json({ ok: false, message: 'Конфигурация сервера не настроена' });
    }

    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: notionToken });

    const resp = await notion.databases.query({
      database_id: usersDbId,
      filter: { property: 'instagram', rich_text: { equals: username } },
      page_size: 1
    });
    const page = Array.isArray(resp.results) && resp.results[0];
    if (!page) return res.json({ ok: false, message: 'Пользователь не найден' });

    const prop = page.properties && page.properties.current_day;
    let currentDay = 0;
    if (prop && prop.type === 'number' && typeof prop.number === 'number') currentDay = prop.number;
    return res.json({ ok: true, current_day: currentDay });
  } catch (e) {
    console.error('get-current-day error', e);
    return res.status(500).json({ ok: false, message: 'Ошибка сервера' });
  }
});

// Обработка всех остальных маршрутов - возвращаем 404
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Main site available at: http://localhost:${PORT}/main`);
  console.log(`Boost landing at (host-bound): https://instagram-boost.trinky.app/`);
  console.log(`Study hub at (host-bound): https://instagram-boost.trinky.app/study`);
  console.log(`Creation at (host-bound): https://instagram-boost.trinky.app/study/creation`);
  console.log(`Trial Reels at (host-bound): https://instagram-boost.trinky.app/study/trial_reels`);
});
