const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Обработка всех остальных маршрутов - возвращаем 404
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Main site available at: http://localhost:${PORT}/`);
  console.log(`Instagram Challenge available at: http://localhost:${PORT}/instagramboost`);
});
