/**
 * Internationalization (i18n) System for OWASP AI Security Exchange
 * Lightweight, client-side translation management with localStorage persistence
 *
 * Features:
 * - Multi-language support (English, Spanish, extensible)
 * - Nested key lookups (e.g., "gamification.levelUp")
 * - Variable interpolation (e.g., "Hello {name}")
 * - Plural handling
 * - Fallback to English if translation missing
 * - LocalStorage persistence
 * - Real-time language switching
 * - Event-driven updates
 */

class I18nManager {
  constructor() {
    this.translations = {};
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.listeners = [];

    // Supported languages
    this.languages = {
      en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
      es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize i18n system
   */
  async init() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && this.languages[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = this.detectBrowserLanguage();
      this.currentLanguage = browserLang;
    }

    // Load translation files
    await this.loadTranslations(this.currentLanguage);

    // If not English, also load English as fallback
    if (this.currentLanguage !== this.fallbackLanguage) {
      await this.loadTranslations(this.fallbackLanguage);
    }

    // Apply translations to page
    this.translatePage();

    console.log(`[i18n] Initialized with language: ${this.currentLanguage}`);
  }

  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // Extract 'en' from 'en-US'

    // Check if we support this language
    if (this.languages[langCode]) {
      return langCode;
    }

    return this.fallbackLanguage;
  }

  /**
   * Load translation file for a language
   */
  async loadTranslations(language) {
    try {
      const response = await fetch(`/i18n/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${language}.json`);
      }

      const translations = await response.json();
      this.translations[language] = translations;

      console.log(`[i18n] Loaded translations for: ${language}`);
      return true;
    } catch (error) {
      console.error(`[i18n] Error loading ${language}.json:`, error);
      return false;
    }
  }

  /**
   * Get translation for a key
   * @param {string} key - Translation key (supports dot notation, e.g., "gamification.xp")
   * @param {object} variables - Variables to interpolate
   * @param {string} language - Language to use (defaults to current)
   */
  t(key, variables = {}, language = null) {
    const lang = language || this.currentLanguage;

    // Try to get translation in requested language
    let translation = this.getNestedValue(this.translations[lang], key);

    // Fallback to English if not found
    if (!translation && lang !== this.fallbackLanguage) {
      translation = this.getNestedValue(this.translations[this.fallbackLanguage], key);
    }

    // If still not found, return key
    if (!translation) {
      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }

    // Handle pluralization
    if (typeof translation === 'object' && variables.count !== undefined) {
      translation = this.pluralize(translation, variables.count);
    }

    // Interpolate variables
    return this.interpolate(translation, variables);
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, key) {
    if (!obj) return null;

    const keys = key.split('.');
    let value = obj;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Handle plural forms
   */
  pluralize(pluralObj, count) {
    if (count === 0 && pluralObj.zero) return pluralObj.zero;
    if (count === 1 && pluralObj.one) return pluralObj.one;
    if (pluralObj.other) return pluralObj.other;
    return pluralObj.one || pluralObj.other || '';
  }

  /**
   * Interpolate variables into translation string
   */
  interpolate(str, variables) {
    if (typeof str !== 'string') return str;

    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Change current language
   */
  async setLanguage(language) {
    if (!this.languages[language]) {
      console.error(`[i18n] Unsupported language: ${language}`);
      return false;
    }

    // Load translations if not already loaded
    if (!this.translations[language]) {
      await this.loadTranslations(language);
    }

    // Update current language
    this.currentLanguage = language;

    // Save preference
    localStorage.setItem('preferred_language', language);

    // Update page
    this.translatePage();

    // Notify listeners
    this.notifyListeners();

    // Update document language attribute
    document.documentElement.lang = language;

    console.log(`[i18n] Language changed to: ${language}`);
    return true;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * Translate all elements on the page with data-i18n attribute
   */
  translatePage() {
    // Translate elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      // Check if we should update text content or specific attribute
      const attr = element.getAttribute('data-i18n-attr');
      if (attr) {
        element.setAttribute(attr, translation);
      } else {
        element.textContent = translation;
      }
    });

    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // Translate aria-labels
    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', this.t(key));
    });
  }

  /**
   * Add listener for language changes
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of language change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentLanguage);
      } catch (error) {
        console.error('[i18n] Error in listener:', error);
      }
    });
  }

  /**
   * Format number according to locale
   */
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Format date according to locale
   */
  formatDate(date, options = {}) {
    const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Format relative time (e.g., "2 days ago")
   */
  formatRelativeTime(value, unit) {
    const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Create language switcher UI
   */
  createLanguageSwitcher(container) {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.setAttribute('role', 'navigation');
    switcher.setAttribute('aria-label', this.t('language.switchLanguage'));

    const label = document.createElement('span');
    label.className = 'language-label';
    label.textContent = this.t('language.language');
    switcher.appendChild(label);

    const select = document.createElement('select');
    select.className = 'language-select';
    select.setAttribute('aria-label', this.t('language.selectLanguage'));

    Object.entries(this.languages).forEach(([code, lang]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${lang.flag} ${lang.nativeName}`;
      if (code === this.currentLanguage) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    switcher.appendChild(select);

    if (container) {
      container.appendChild(switcher);
    }

    return switcher;
  }
}

// Create global instance
const i18n = new I18nManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}
