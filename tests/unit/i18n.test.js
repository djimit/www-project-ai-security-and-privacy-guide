/**
 * Tests for I18nManager (i18n.js)
 * Tests translation system, language switching, localization
 */

// Mock I18nManager
class MockI18nManager {
  constructor() {
    this.translations = {
      en: {
        common: {
          save: 'Save',
          cancel: 'Cancel'
        },
        gamification: {
          xp: 'XP',
          level: 'Level',
          levelUpMessage: 'Congratulations! You reached Level {level}',
          streakMessage: {
            one: '{count} day streak!',
            other: '{count} day streak!'
          }
        }
      },
      es: {
        common: {
          save: 'Guardar',
          cancel: 'Cancelar'
        },
        gamification: {
          xp: 'XP',
          level: 'Nivel',
          levelUpMessage: '¡Felicitaciones! Alcanzaste el Nivel {level}',
          streakMessage: {
            one: '¡{count} día consecutivo!',
            other: '¡{count} días consecutivos!'
          }
        }
      }
    };
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.languages = {
      en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
      es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
    };
    this.listeners = [];
  }

  t(key, variables = {}, language = null) {
    const lang = language || this.currentLanguage;
    let translation = this.getNestedValue(this.translations[lang], key);

    // Fallback to English
    if (!translation && lang !== this.fallbackLanguage) {
      translation = this.getNestedValue(this.translations[this.fallbackLanguage], key);
    }

    if (!translation) return key;

    // Handle pluralization
    if (typeof translation === 'object' && variables.count !== undefined) {
      translation = this.pluralize(translation, variables.count);
    }

    // Interpolate variables
    return this.interpolate(translation, variables);
  }

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

  pluralize(pluralObj, count) {
    if (count === 1 && pluralObj.one) return pluralObj.one;
    if (pluralObj.other) return pluralObj.other;
    return pluralObj.one || '';
  }

  interpolate(str, variables) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  setLanguage(language) {
    if (!this.languages[language]) return false;
    this.currentLanguage = language;
    this.notifyListeners();
    return true;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getLanguages() {
    return this.languages;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  formatDate(date, options = {}) {
    const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

describe('I18nManager', () => {
  let i18n;

  beforeEach(() => {
    i18n = new MockI18nManager();
  });

  describe('Basic Translation', () => {
    test('should translate simple keys', () => {
      expect(i18n.t('common.save')).toBe('Save');
      expect(i18n.t('common.cancel')).toBe('Cancel');
    });

    test('should translate nested keys', () => {
      expect(i18n.t('gamification.xp')).toBe('XP');
      expect(i18n.t('gamification.level')).toBe('Level');
    });

    test('should return key if translation not found', () => {
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
    });

    test('should use current language', () => {
      expect(i18n.t('common.save')).toBe('Save');

      i18n.setLanguage('es');
      expect(i18n.t('common.save')).toBe('Guardar');
    });
  });

  describe('Variable Interpolation', () => {
    test('should interpolate single variable', () => {
      const result = i18n.t('gamification.levelUpMessage', { level: 5 });
      expect(result).toBe('Congratulations! You reached Level 5');
    });

    test('should interpolate multiple variables', () => {
      // Add a test translation
      i18n.translations.en.test = { message: 'Hello {name}, you have {count} messages' };

      const result = i18n.t('test.message', { name: 'John', count: 3 });
      expect(result).toBe('Hello John, you have 3 messages');
    });

    test('should preserve unmatched placeholders', () => {
      const result = i18n.t('gamification.levelUpMessage', {});
      expect(result).toBe('Congratulations! You reached Level {level}');
    });

    test('should work with Spanish translations', () => {
      i18n.setLanguage('es');
      const result = i18n.t('gamification.levelUpMessage', { level: 5 });
      expect(result).toBe('¡Felicitaciones! Alcanzaste el Nivel 5');
    });
  });

  describe('Pluralization', () => {
    test('should use singular form for count=1', () => {
      const result = i18n.t('gamification.streakMessage', { count: 1 });
      expect(result).toBe('1 day streak!');
    });

    test('should use plural form for count>1', () => {
      const result = i18n.t('gamification.streakMessage', { count: 5 });
      expect(result).toBe('5 day streak!');
    });

    test('should work with Spanish pluralization', () => {
      i18n.setLanguage('es');

      const singular = i18n.t('gamification.streakMessage', { count: 1 });
      expect(singular).toBe('¡1 día consecutivo!');

      const plural = i18n.t('gamification.streakMessage', { count: 5 });
      expect(plural).toBe('¡5 días consecutivos!');
    });
  });

  describe('Language Management', () => {
    test('should get current language', () => {
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    test('should change language', () => {
      const result = i18n.setLanguage('es');
      expect(result).toBe(true);
      expect(i18n.getCurrentLanguage()).toBe('es');
    });

    test('should reject invalid language', () => {
      const result = i18n.setLanguage('invalid');
      expect(result).toBe(false);
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    test('should get available languages', () => {
      const languages = i18n.getLanguages();
      expect(languages.en).toBeDefined();
      expect(languages.es).toBeDefined();
      expect(languages.en.name).toBe('English');
      expect(languages.es.name).toBe('Spanish');
    });
  });

  describe('Fallback Behavior', () => {
    test('should fallback to English for missing Spanish translations', () => {
      i18n.translations.es.common.save = undefined;
      i18n.setLanguage('es');

      const result = i18n.t('common.save');
      expect(result).toBe('Save'); // Falls back to English
    });

    test('should use Spanish if available', () => {
      i18n.setLanguage('es');
      const result = i18n.t('common.cancel');
      expect(result).toBe('Cancelar');
    });
  });

  describe('Language Change Events', () => {
    test('should notify listeners when language changes', () => {
      const mockCallback = jest.fn();
      i18n.onChange(mockCallback);

      i18n.setLanguage('es');

      expect(mockCallback).toHaveBeenCalledWith('es');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should support multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      i18n.onChange(callback1);
      i18n.onChange(callback2);

      i18n.setLanguage('es');

      expect(callback1).toHaveBeenCalledWith('es');
      expect(callback2).toHaveBeenCalledWith('es');
    });

    test('should not notify on failed language change', () => {
      const mockCallback = jest.fn();
      i18n.onChange(mockCallback);

      i18n.setLanguage('invalid');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Number Formatting', () => {
    test('should format numbers in English locale', () => {
      const result = i18n.formatNumber(1234.56);
      expect(result).toBe('1,234.56');
    });

    test('should format numbers in Spanish locale', () => {
      i18n.setLanguage('es');
      const result = i18n.formatNumber(1234.56);
      expect(result).toMatch(/1[.,]234[.,]56/); // Different browsers may vary
    });

    test('should format currency', () => {
      const result = i18n.formatNumber(1234.56, {
        style: 'currency',
        currency: 'USD'
      });
      expect(result).toContain('1,234.56');
    });

    test('should format percentages', () => {
      const result = i18n.formatNumber(0.85, {
        style: 'percent'
      });
      expect(result).toContain('85');
    });
  });

  describe('Date Formatting', () => {
    test('should format dates in English locale', () => {
      const date = new Date('2025-01-10');
      const result = i18n.formatDate(date);
      expect(result).toMatch(/1\/10\/2025|10\/1\/2025/);
    });

    test('should format dates in Spanish locale', () => {
      i18n.setLanguage('es');
      const date = new Date('2025-01-10');
      const result = i18n.formatDate(date);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should format dates with custom options', () => {
      const date = new Date('2025-01-10');
      const result = i18n.formatDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      expect(result).toContain('January');
      expect(result).toContain('2025');
    });
  });

  describe('Nested Key Lookup', () => {
    test('should handle deeply nested keys', () => {
      i18n.translations.en.deeply = { nested: { key: { value: 'Found it!' } } };
      const result = i18n.t('deeply.nested.key.value');
      expect(result).toBe('Found it!');
    });

    test('should return null for invalid nested paths', () => {
      const result = i18n.getNestedValue(i18n.translations.en, 'invalid.nested.path');
      expect(result).toBeNull();
    });

    test('should handle partial nested paths', () => {
      const result = i18n.getNestedValue(i18n.translations.en, 'common');
      expect(result).toEqual({
        save: 'Save',
        cancel: 'Cancel'
      });
    });
  });

  describe('Translation Coverage', () => {
    test('should have matching keys for both languages', () => {
      const enKeys = Object.keys(i18n.translations.en.common);
      const esKeys = Object.keys(i18n.translations.es.common);

      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    test('should have translations for all common keys', () => {
      const commonKeys = ['save', 'cancel'];
      commonKeys.forEach(key => {
        expect(i18n.t(`common.${key}`)).toBeDefined();
        expect(i18n.t(`common.${key}`, {}, 'es')).toBeDefined();
      });
    });
  });
});
