const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname)));

// Маршрут для /instagramboost
app.get('/instagramboost', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для корневого пути (опционально)
app.get('/', (req, res) => {
  res.redirect('/instagramboost');
});

// Обработка всех остальных маршрутов - возвращаем 404
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Landing page available at: http://localhost:${PORT}/instagramboost`);
});
