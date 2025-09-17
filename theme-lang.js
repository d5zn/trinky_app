// Theme and Language Management
class ThemeLangManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.language = localStorage.getItem('language') || 'ru';
    this.translations = {};
    
    this.init();
  }

  init() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', this.theme);
    
    // Create controls
    this.createControls();
    
    // Load translations
    this.loadTranslations();
    
    // Apply language
    this.applyLanguage();
  }

  createControls() {
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    // Theme switcher
    const themeBtn = document.createElement('button');
    themeBtn.className = 'control-btn';
    themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
    themeBtn.title = 'Переключить тему';
    themeBtn.onclick = () => this.toggleTheme();
    
    // Language switcher
    const langBtn = document.createElement('button');
    langBtn.className = 'control-btn';
    langBtn.innerHTML = this.language === 'en' ? 'RU' : 'EN';
    langBtn.title = 'Switch language / Переключить язык';
    langBtn.onclick = () => this.toggleLanguage();
    
    controls.appendChild(themeBtn);
    controls.appendChild(langBtn);
    
    document.body.appendChild(controls);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    
    // Update button icon
    const themeBtn = document.querySelector('.controls .control-btn');
    themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
  }

  toggleLanguage() {
    this.language = this.language === 'ru' ? 'en' : 'ru';
    localStorage.setItem('language', this.language);
    
    // Update button text
    const langBtn = document.querySelectorAll('.controls .control-btn')[1];
    langBtn.innerHTML = this.language === 'en' ? 'RU' : 'EN';
    
    this.applyLanguage();
  }

  loadTranslations() {
    this.translations = {
      ru: {
        // Main page
        'Instagram-челлендж на 31 день': 'Instagram-челлендж на 31 день',
        'Этот бот — твой проводник в 31-дневном Instagram-челлендже 🚀': 'Этот бот — твой проводник в 31-дневном Instagram-челлендже 🚀',
        'Каждый день ты получаешь задание, теорию и вдохновение, чтобы прокачать свой блог.': 'Каждый день ты получаешь задание, теорию и вдохновение, чтобы прокачать свой блог.',
        'Начать челлендж': 'Начать челлендж',
        'Как это работает': 'Как это работает',
        'О боте': 'О боте',
        'Обучение': 'Обучение',
        'Теория и лайфхаки': 'Теория и лайфхаки',
      },
      en: {
        // Main page
        'Instagram-челлендж на 31 день': '31-Day Instagram Challenge',
        'Этот бот — твой проводник в 31-дневном Instagram-челлендже 🚀': 'This bot is your guide through the 31-day Instagram challenge 🚀',
        'Каждый день ты получаешь задание, теорию и вдохновение, чтобы прокачать свой блог.': 'Every day you get tasks, theory and inspiration to boost your blog.',
        'Начать челлендж': 'Start Challenge',
        'Как это работает': 'How It Works',
        'О боте': 'About Bot',
        'Обучение': 'Learning',
        'Теория и лайфхаки': 'Theory & Tips',
      }
    };
  }

  applyLanguage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.translations[this.language]?.[key];
      if (translation) {
        element.textContent = translation;
      }
    });

    // Update document language
    document.documentElement.lang = this.language;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeLangManager();
});
