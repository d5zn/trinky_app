# Инструкции по развертыванию на Railway

## Подготовка проекта

Проект уже настроен для развертывания на Railway. Включает в себя:

- ✅ Express сервер (`server.js`)
- ✅ Маршрутизация для `/instagramboost`
- ✅ Конфигурация Railway (`railway.json`)
- ✅ Package.json с зависимостями
- ✅ .gitignore файл

## Шаги для развертывания

### 1. Инициализация Git репозитория

```bash
# В папке проекта
git init
git add .
git commit -m "Initial commit: Instagram Challenge landing page"
```

### 2. Создание репозитория на GitHub

1. Создайте новый репозиторий на GitHub
2. Подключите локальный репозиторий:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ig-boost-landing.git
git branch -M main
git push -u origin main
```

### 3. Развертывание на Railway

#### Вариант A: Через веб-интерфейс Railway

1. Зайдите на [railway.app](https://railway.app)
2. Войдите в аккаунт (или создайте новый)
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Подключите ваш GitHub аккаунт
6. Выберите репозиторий `ig-boost-landing`
7. Railway автоматически определит Node.js проект и начнет деплой

#### Вариант B: Через Railway CLI

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в аккаунт
railway login

# Инициализируйте проект
railway init

# Деплой
railway up
```

### 4. Настройка домена

1. В папке проекта Railway перейдите в "Settings"
2. Найдите раздел "Domains"
3. Добавьте кастомный домен: `trinky.app`
4. Railway предоставит DNS записи для настройки

### 5. Настройка DNS

В настройках вашего домена `trinky.app` добавьте CNAME запись:

```
Type: CNAME
Name: @ (или оставьте пустым для корневого домена)
Value: [ваш-railway-домен].railway.app
```

### 6. Проверка работы

После завершения деплоя ваш лендинг будет доступен по адресу:
- `https://trinky.app/instagramboost` (после настройки DNS)
- `https://[ваш-railway-домен].railway.app/instagramboost` (временно)

## Структура проекта

```
ig_boost_landing/
├── index.html          # Основная страница лендинга
├── styles.css          # Стили
├── script.js           # JavaScript с анимациями
├── server.js           # Express сервер
├── package.json        # Зависимости Node.js
├── railway.json        # Конфигурация Railway
├── .gitignore          # Git ignore файл
└── DEPLOY.md           # Эта инструкция
```

## Особенности конфигурации

- **Маршрутизация**: Лендинг доступен по пути `/instagramboost`
- **Статические файлы**: CSS, JS и изображения обслуживаются напрямую
- **Healthcheck**: Railway проверяет доступность по `/instagramboost`
- **Автоматический рестарт**: При сбоях сервер перезапускается

## Мониторинг и логи

В панели Railway вы можете:
- Просматривать логи приложения
- Мониторить использование ресурсов
- Настраивать переменные окружения
- Управлять доменами

## Обновление

Для обновления лендинга:

```bash
# Внесите изменения в файлы
git add .
git commit -m "Update landing page"
git push origin main
```

Railway автоматически пересоберет и развернет обновленную версию.

## Поддержка

Если возникнут проблемы:
1. Проверьте логи в панели Railway
2. Убедитесь, что все файлы загружены в репозиторий
3. Проверьте настройки DNS для домена
