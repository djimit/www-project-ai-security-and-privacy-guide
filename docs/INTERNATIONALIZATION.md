# Internationalization (i18n) Guide

Comprehensive internationalization documentation for OWASP AI Security Exchange platform supporting **English** and **Spanish**, with an extensible architecture for additional languages.

## 🌍 Supported Languages

| Language | Code | Native Name | Status | Coverage |
|----------|------|-------------|--------|----------|
| **English** | `en` | English | ✅ Complete | 100% |
| **Spanish** | `es` | Español | ✅ Complete | 100% |

### Adding New Languages

To add support for additional languages:

1. Create translation file: `static/i18n/{language_code}.json`
2. Add language to `I18nManager.languages` in `static/js/i18n.js`
3. Translate all keys from `en.json`
4. Test with `i18n.setLanguage('{language_code}')`

## 📁 File Structure

```
content/ai_exchange/
├── static/
│   ├── js/
│   │   └── i18n.js              # i18n library (350+ lines)
│   ├── css/
│   │   └── i18n.css             # Language switcher styles
│   └── i18n/
│       ├── en.json              # English translations
│       └── es.json              # Spanish translations
└── docs/
    └── INTERNATIONALIZATION.md   # This file
```

---

## 🚀 Quick Start

### Basic Usage

```html
<!-- Include i18n library -->
<script src="/js/i18n.js"></script>

<!-- Language switcher in your header -->
<div id="language-switcher"></div>

<script>
  // i18n automatically initializes on page load
  // Create language switcher UI
  const container = document.getElementById('language-switcher');
  i18n.createLanguageSwitcher(container);
</script>
```

### Using Translations in JavaScript

```javascript
// Simple translation
const greeting = i18n.t('common.hello');
// → "Hello" (en) or "Hola" (es)

// With variable interpolation
const message = i18n.t('gamification.xpGainedMessage', {
  xp: 50,
  reason: 'completing module'
});
// → "You earned 50 XP for completing module"

// With pluralization
const threats = i18n.t('threatModeler.threatsDetected', { count: 3 });
// → "3 threats detected" (en) or "3 amenazas detectadas" (es)

// Nested keys
const levelName = i18n.t('gamification.ranks.5');
// → "Expert" (en) or "Experto" (es)
```

### Using Translations in HTML

```html
<!-- Translate text content -->
<h1 data-i18n="learning.title"></h1>
<!-- Auto-translates to "Learning Paths" or "Rutas de Aprendizaje" -->

<!-- Translate placeholder -->
<input type="text" data-i18n-placeholder="common.search">
<!-- Placeholder becomes "Search" or "Buscar" -->

<!-- Translate aria-label -->
<button data-i18n-aria="common.close"></button>
<!-- aria-label becomes "Close" or "Cerrar" -->

<!-- Translate specific attribute -->
<img data-i18n="about.title" data-i18n-attr="alt">
<!-- alt attribute translated -->
```

---

## 🎨 Language Switcher UI

### Automatic Creation

```javascript
// Create switcher in any container
const container = document.getElementById('header');
i18n.createLanguageSwitcher(container);
```

### Custom Styling

```html
<link rel="stylesheet" href="/css/i18n.css">

<!-- Default style -->
<div id="switcher-default"></div>

<!-- Compact style -->
<div id="switcher-compact" class="compact"></div>

<!-- Floating style (bottom-right corner) -->
<div id="switcher-floating" class="floating"></div>
```

### Manual Implementation

```html
<div class="language-switcher">
  <span class="language-label">Language:</span>
  <select class="language-select" onchange="i18n.setLanguage(this.value)">
    <option value="en">🇺🇸 English</option>
    <option value="es">🇪🇸 Español</option>
  </select>
</div>
```

---

## 📚 Translation Keys Reference

### Common UI Elements

```javascript
i18n.t('common.loading')      // → "Loading..." / "Cargando..."
i18n.t('common.save')         // → "Save" / "Guardar"
i18n.t('common.cancel')       // → "Cancel" / "Cancelar"
i18n.t('common.delete')       // → "Delete" / "Eliminar"
i18n.t('common.error')        // → "Error" / "Error"
i18n.t('common.success')      // → "Success" / "Éxito"
```

### Navigation

```javascript
i18n.t('nav.home')            // → "Home" / "Inicio"
i18n.t('nav.learningPaths')   // → "Learning Paths" / "Rutas de Aprendizaje"
i18n.t('nav.threatModeler')   // → "Threat Modeler" / "Modelador de Amenazas"
i18n.t('nav.skipToMain')      // → "Skip to main content" / "Saltar al contenido principal"
```

### Gamification

```javascript
i18n.t('gamification.xp')              // → "XP" / "XP"
i18n.t('gamification.level')           // → "Level" / "Nivel"
i18n.t('gamification.levelUp')         // → "Level Up!" / "¡Subiste de Nivel!"
i18n.t('gamification.achievementUnlocked')  // → "Achievement Unlocked!" / "¡Logro Desbloqueado!"

// With variables
i18n.t('gamification.levelUpMessage', { level: 5 })
// → "Congratulations! You reached Level 5"
// → "¡Felicitaciones! Alcanzaste el Nivel 5"

// Ranks
i18n.t('gamification.ranks.1')   // → "Novice" / "Novato"
i18n.t('gamification.ranks.5')   // → "Expert" / "Experto"
i18n.t('gamification.ranks.11')  // → "Legend" / "Leyenda"
```

### Learning Paths

```javascript
i18n.t('learning.title')          // → "Learning Paths" / "Rutas de Aprendizaje"
i18n.t('learning.startLearning')  // → "Start Learning" / "Comenzar a Aprender"
i18n.t('learning.completed')      // → "Completed" / "Completado"
i18n.t('learning.difficulty')     // → "Difficulty" / "Dificultad"
i18n.t('learning.beginner')       // → "Beginner" / "Principiante"
i18n.t('learning.intermediate')   // → "Intermediate" / "Intermedio"
i18n.t('learning.advanced')       // → "Advanced" / "Avanzado"

// Quiz messages
i18n.t('learning.quizPassed')     // → "Quiz Passed!" / "¡Cuestionario Aprobado!"
i18n.t('learning.quizPassedMessage', { score: 85 })
// → "Congratulations! You scored 85% and passed!"
// → "¡Felicitaciones! Obtuviste 85% y aprobaste!"
```

### Threat Modeler

```javascript
i18n.t('threatModeler.title')        // → "AI Threat Modeler" / "Modelador de Amenazas IA"
i18n.t('threatModeler.newModel')     // → "New Model" / "Nuevo Modelo"
i18n.t('threatModeler.severity')     // → "Severity" / "Severidad"
i18n.t('threatModeler.critical')     // → "Critical" / "Crítico"
i18n.t('threatModeler.exportJSON')   // → "Export as JSON" / "Exportar como JSON"

// With pluralization
i18n.t('threatModeler.threatsDetected', { count: 0 })
// → "No threats detected" / "No se detectaron amenazas"

i18n.t('threatModeler.threatsDetected', { count: 1 })
// → "1 threat detected" / "1 amenaza detectada"

i18n.t('threatModeler.threatsDetected', { count: 5 })
// → "5 threats detected" / "5 amenazas detectadas"
```

### Accessibility

```javascript
i18n.t('accessibility.menu')          // → "Accessibility Menu" / "Menú de Accesibilidad"
i18n.t('accessibility.highContrast')  // → "High Contrast Mode" / "Modo de Alto Contraste"
i18n.t('accessibility.largeText')     // → "Large Text Mode" / "Modo de Texto Grande"

// Screen reader announcements
i18n.t('accessibility.announcements.xpGained', { xp: 50 })
// → "Earned 50 experience points"
// → "Ganaste 50 puntos de experiencia"

i18n.t('accessibility.announcements.levelUp', { level: 5 })
// → "Level up! Now level 5"
// → "¡Subiste de nivel! Ahora nivel 5"
```

### Errors & Success

```javascript
i18n.t('errors.generic')          // → "An error occurred. Please try again."
i18n.t('errors.networkError')     // → "Network error. Please check your connection."
i18n.t('errors.notFound')         // → "Resource not found."

i18n.t('success.saved')           // → "Saved successfully!" / "¡Guardado exitosamente!"
i18n.t('success.exported')        // → "Exported successfully!" / "¡Exportado exitosamente!"
```

---

## 🔧 API Reference

### I18nManager Class

```javascript
const i18n = window.i18n; // Global instance
```

#### Methods

##### `t(key, variables, language)`

Get translation for a key.

```javascript
// Basic
i18n.t('common.hello')

// With variables
i18n.t('gamification.xpGained', { xp: 50 })

// With pluralization
i18n.t('threatModeler.threatsDetected', { count: 3 })

// Specific language
i18n.t('common.hello', {}, 'es')  // → "Hola"
```

**Parameters:**
- `key` (string): Translation key (supports dot notation)
- `variables` (object): Variables for interpolation
- `language` (string): Language code (optional, defaults to current)

**Returns:** Translated string

---

##### `setLanguage(language)`

Change current language.

```javascript
await i18n.setLanguage('es');
// → Switches to Spanish, updates all UI elements
```

**Parameters:**
- `language` (string): Language code ('en', 'es', etc.)

**Returns:** Promise<boolean>

---

##### `getCurrentLanguage()`

Get current language code.

```javascript
const lang = i18n.getCurrentLanguage();
// → "en" or "es"
```

**Returns:** string

---

##### `getLanguages()`

Get all available languages.

```javascript
const languages = i18n.getLanguages();
// → { en: { name: 'English', nativeName: 'English', flag: '🇺🇸' }, ... }
```

**Returns:** object

---

##### `translatePage()`

Translate all elements with `data-i18n` attributes.

```javascript
i18n.translatePage();
// → Updates all [data-i18n] elements on the page
```

---

##### `onChange(callback)`

Listen for language changes.

```javascript
i18n.onChange((language) => {
  console.log(`Language changed to: ${language}`);
  // Update dynamic content
  updateMyComponent();
});
```

**Parameters:**
- `callback` (function): Function called when language changes

---

##### `formatNumber(number, options)`

Format number according to current locale.

```javascript
i18n.formatNumber(1234.56)
// → "1,234.56" (en) or "1.234,56" (es)

i18n.formatNumber(0.85, { style: 'percent' })
// → "85%" (en) or "85 %" (es)

i18n.formatNumber(1234.56, { style: 'currency', currency: 'USD' })
// → "$1,234.56" (en) or "1.234,56 US$" (es)
```

---

##### `formatDate(date, options)`

Format date according to current locale.

```javascript
const date = new Date('2025-01-10');

i18n.formatDate(date)
// → "1/10/2025" (en) or "10/1/2025" (es)

i18n.formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })
// → "January 10, 2025" (en) or "10 de enero de 2025" (es)

i18n.formatDate(date, { weekday: 'long' })
// → "Friday" (en) or "viernes" (es)
```

---

##### `formatRelativeTime(value, unit)`

Format relative time (e.g., "2 days ago").

```javascript
i18n.formatRelativeTime(-2, 'day')
// → "2 days ago" (en) or "hace 2 días" (es)

i18n.formatRelativeTime(3, 'hour')
// → "in 3 hours" (en) or "dentro de 3 horas" (es)

i18n.formatRelativeTime(-1, 'week')
// → "last week" (en) or "la semana pasada" (es)
```

---

##### `createLanguageSwitcher(container)`

Create language switcher UI.

```javascript
const container = document.getElementById('header');
const switcher = i18n.createLanguageSwitcher(container);
```

**Parameters:**
- `container` (HTMLElement): Container element (optional)

**Returns:** HTMLElement (language switcher)

---

## 🔌 Integration Examples

### Gamification Engine

```javascript
class GamificationEngine {
  addXP(amount, reason) {
    this.data.xp += amount;

    // Translate XP message
    const message = i18n.t('gamification.xpGainedMessage', {
      xp: amount,
      reason: i18n.t(reason) // Translate reason key
    });

    // Screen reader announcement
    window.a11y?.announce(
      i18n.t('accessibility.announcements.xpGained', { xp: amount })
    );

    this.showToast(message);
  }

  levelUp(newLevel) {
    const rankName = i18n.t(`gamification.ranks.${newLevel}`);
    const message = i18n.t('gamification.levelUpMessage', { level: newLevel });

    // Announce to screen reader
    window.a11y?.announce(
      i18n.t('accessibility.announcements.levelUp', { level: newLevel })
    );

    this.showToast(`${i18n.t('gamification.levelUp')} - ${rankName}`, message);
  }
}

// Listen for language changes
i18n.onChange(() => {
  // Re-render UI with new translations
  gamificationEngine.render();
});
```

### Threat Modeler

```javascript
class ThreatModeler {
  exportSARIF() {
    const threats = this.detectThreats();
    const message = i18n.t('threatModeler.threatsDetected', { count: threats.length });

    console.log(message);

    // ... export logic

    // Success message
    alert(i18n.t('success.exported'));
  }

  updateRiskScore() {
    const score = this.calculateRisk();
    const label = i18n.t('threatModeler.riskScore');

    document.getElementById('risk-score').textContent = `${label}: ${score}`;
  }
}
```

### Quiz System

```javascript
function showQuizResult(score, passing) {
  const passed = score >= passing;
  const title = i18n.t(passed ? 'learning.quizPassed' : 'learning.quizFailed');
  const message = i18n.t(
    passed ? 'learning.quizPassedMessage' : 'learning.quizFailedMessage',
    { score, passing }
  );

  // Announce to screen reader
  window.a11y?.announce(
    i18n.t(
      passed ? 'accessibility.announcements.quizPassed' : 'accessibility.announcements.quizFailed',
      { score }
    )
  );

  showModal(title, message);
}
```

---

## 🎯 Best Practices

### 1. Use Translation Keys

❌ **Don't hardcode strings:**
```javascript
alert('Error: Could not save');
```

✅ **Use translation keys:**
```javascript
alert(i18n.t('errors.saveError'));
```

### 2. Provide Context with Variables

❌ **Don't concatenate:**
```javascript
const message = 'You earned ' + xp + ' XP';
```

✅ **Use variable interpolation:**
```javascript
const message = i18n.t('gamification.xpGainedMessage', { xp, reason });
```

### 3. Handle Pluralization

❌ **Don't use conditionals:**
```javascript
const text = count === 1 ? '1 threat detected' : `${count} threats detected`;
```

✅ **Use plural translations:**
```javascript
const text = i18n.t('threatModeler.threatsDetected', { count });
```

### 4. Update on Language Change

✅ **Listen for changes:**
```javascript
i18n.onChange((language) => {
  // Re-render dynamic content
  updateDashboard();
  updateCharts();
});
```

### 5. Use data-i18n for Static Content

✅ **HTML attributes:**
```html
<h1 data-i18n="learning.title"></h1>
<button data-i18n="common.save"></button>
<input data-i18n-placeholder="common.search">
```

### 6. Format Numbers and Dates

✅ **Use locale formatting:**
```javascript
// Numbers
const formatted = i18n.formatNumber(1234.56);

// Dates
const dateStr = i18n.formatDate(new Date(), { dateStyle: 'long' });

// Relative time
const relativeTime = i18n.formatRelativeTime(-2, 'day');
```

---

## 🧪 Testing Translations

### Manual Testing

1. **Switch languages:**
   ```javascript
   i18n.setLanguage('en');  // English
   i18n.setLanguage('es');  // Spanish
   ```

2. **Test all pages:**
   - Navigate through all pages
   - Verify all text is translated
   - Check for layout issues (Spanish text is typically 20-30% longer)

3. **Test dynamic content:**
   - XP notifications
   - Achievement unlocks
   - Quiz results
   - Error messages

### Automated Testing

```javascript
// Test translation key exists
describe('i18n', () => {
  test('should have translation for all keys', () => {
    const keys = [
      'common.save',
      'gamification.levelUp',
      'learning.startLearning'
    ];

    keys.forEach(key => {
      expect(i18n.t(key)).not.toBe(key);
      expect(i18n.t(key, {}, 'es')).not.toBe(key);
    });
  });

  test('should handle pluralization', () => {
    expect(i18n.t('threatModeler.threatsDetected', { count: 0 }))
      .toBe('No threats detected');
    expect(i18n.t('threatModeler.threatsDetected', { count: 1 }))
      .toBe('1 threat detected');
    expect(i18n.t('threatModeler.threatsDetected', { count: 5 }))
      .toBe('5 threats detected');
  });

  test('should interpolate variables', () => {
    const result = i18n.t('gamification.xpGainedMessage', {
      xp: 50,
      reason: 'testing'
    });
    expect(result).toContain('50');
    expect(result).toContain('testing');
  });
});
```

---

## 📊 Translation Coverage

| Category | Keys | English | Spanish | Coverage |
|----------|------|---------|---------|----------|
| **Common** | 20 | ✅ 20 | ✅ 20 | 100% |
| **Navigation** | 6 | ✅ 6 | ✅ 6 | 100% |
| **Gamification** | 25 | ✅ 25 | ✅ 25 | 100% |
| **Learning** | 30 | ✅ 30 | ✅ 30 | 100% |
| **Threat Modeler** | 25 | ✅ 25 | ✅ 25 | 100% |
| **Accessibility** | 20 | ✅ 20 | ✅ 20 | 100% |
| **Errors** | 12 | ✅ 12 | ✅ 12 | 100% |
| **Success** | 7 | ✅ 7 | ✅ 7 | 100% |
| **Settings** | 15 | ✅ 15 | ✅ 15 | 100% |
| **About** | 10 | ✅ 10 | ✅ 10 | 100% |
| **Time** | 14 | ✅ 14 | ✅ 14 | 100% |
| **Total** | **184** | **184** | **184** | **100%** |

---

## 🌐 Browser Language Detection

The i18n system automatically detects the browser's language preference:

```javascript
// Browser language detection
const browserLang = navigator.language || navigator.userLanguage;
// → "en-US", "es-ES", "es-MX", etc.

// Extract language code
const langCode = browserLang.split('-')[0];
// → "en", "es"

// Use if supported, otherwise fallback to English
const initialLanguage = supportedLanguages.includes(langCode) ? langCode : 'en';
```

### Override Detection

Users can always override the detected language:
1. Using the language switcher UI
2. Preference saved to localStorage
3. Persists across sessions

---

## 📱 Responsive Design

Translation UI is fully responsive:

- **Desktop:** Full language name with flag
- **Tablet:** Abbreviated name with flag
- **Mobile:** Flag only or compact select

```css
@media (max-width: 768px) {
  .language-switcher {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .language-label {
    display: none;
  }
}
```

---

## ♿ Accessibility Integration

i18n works seamlessly with our accessibility system:

```javascript
// Screen reader announcements in user's language
window.a11y?.announce(i18n.t('accessibility.announcements.xpGained', { xp: 50 }));

// Translated ARIA labels
<button data-i18n-aria="common.close"></button>

// Translated keyboard shortcuts
window.a11y?.setShortcuts({
  'Alt+A': i18n.t('accessibility.openMenu')
});
```

---

## 🔮 Future Enhancements

Planned features for future releases:

1. **Additional Languages:**
   - French (Français)
   - German (Deutsch)
   - Portuguese (Português)
   - Chinese (中文)
   - Japanese (日本語)

2. **RTL Support:**
   - Arabic (العربية)
   - Hebrew (עברית)
   - Automatic layout mirroring

3. **Translation Management:**
   - Translation completion dashboard
   - Missing key detection
   - Automated translation suggestions

4. **Performance:**
   - Lazy loading of translation files
   - Translation caching
   - Preloading likely next language

---

## 🤝 Contributing Translations

To contribute translations:

1. **Fork the repository**
2. **Create translation file:** `static/i18n/{lang}.json`
3. **Translate all keys from `en.json`**
4. **Test thoroughly**
5. **Submit pull request**

### Translation Guidelines:

- ✅ Maintain context and tone
- ✅ Use native idioms when appropriate
- ✅ Keep technical terms consistent
- ✅ Test for text length issues
- ✅ Verify pluralization rules
- ✅ Check number/date formatting

---

**Version:** 1.0
**Languages:** English (en), Spanish (es)
**Last Updated:** January 2025
**Maintainers:** OWASP AI Security Team
