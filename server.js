const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname)));

// Маршрут для главной страницы trinky.app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
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
    const username = String(usernameRaw).trim().replace(/^@+/, '');
    if (!username || /\s/.test(username) || username.length > 64) {
      return res.status(400).json({ ok: false, message: 'Некорректный ник' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const usersDbId = process.env.NOTION_USERS_DB_ID;

    if (!notionToken || !usersDbId) {
      return res.status(500).json({ ok: false, message: 'Конфигурация сервера не настроена' });
    }

    // Lazy import to avoid requiring when not configured
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: notionToken });

    const query = await notion.databases.query({
      database_id: usersDbId,
      filter: {
        and: [
          {
            property: 'instagram',
            rich_text: { equals: username }
          },
          {
            property: 'current_day',
            number: { greater_than_or_equal_to: 1 }
          }
        ]
      },
      page_size: 1
    });

    const ok = Array.isArray(query.results) && query.results.length > 0;
    if (ok) {
      return res.json({ ok: true });
    }

    // Fallback: try case-insensitive contains
    const fallback = await notion.databases.query({
      database_id: usersDbId,
      filter: {
        and: [
          { property: 'instagram', rich_text: { contains: username } },
          { property: 'current_day', number: { greater_than_or_equal_to: 1 } }
        ]
      },
      page_size: 1
    });

    const ok2 = Array.isArray(fallback.results) && fallback.results.length > 0;
    return res.json({ ok: ok2, message: ok2 ? undefined : 'Пользователь не найден или нет доступа' });
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
  console.log(`Main site available at: http://localhost:${PORT}/`);
  console.log(`Instagram Challenge available at: http://localhost:${PORT}/instagramboost`);
  console.log(`Creation theory available at: http://localhost:${PORT}/instagramboost/creation`);
});
