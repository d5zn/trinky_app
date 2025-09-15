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

// Маршрут для Instagram Challenge
app.get('/instagramboost', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для страницы теории Creation
app.get('/instagramboost/creation', (req, res) => {
  res.sendFile(path.join(__dirname, 'creation.html'));
});

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

// Обработка всех остальных маршрутов - возвращаем 404
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Main site available at: http://localhost:${PORT}/main`);
  console.log(`Instagram Challenge available at: http://localhost:${PORT}/instagramboost`);
  console.log(`Creation theory available at: http://localhost:${PORT}/instagramboost/creation`);
});
