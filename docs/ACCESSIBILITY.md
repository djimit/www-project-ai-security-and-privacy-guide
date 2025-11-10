# Accessibility Guide

Comprehensive accessibility documentation for OWASP AI Security Exchange platform achieving **WCAG AAA** compliance.

## 🎯 Accessibility Standards

### WCAG 2.1 AAA Compliance

| Level | Requirement | Status |
|-------|-------------|--------|
| **A** | Basic accessibility | ✅ Achieved |
| **AA** | Industry standard | ✅ Achieved |
| **AAA** | Enhanced accessibility | ✅ Achieved |

### Key Metrics

- **Color Contrast**: 7:1 minimum (AAA standard)
- **Keyboard Navigation**: 100% keyboard accessible
- **Screen Reader**: Full ARIA support
- **Focus Indicators**: Enhanced 4px outlines
- **Text Size**: Resizable up to 200%
- **Motion**: Respects `prefers-reduced-motion`

---

## ⌨️ Keyboard Navigation

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| **Alt+1** / **Option+1** | Skip to main content |
| **Alt+2** / **Option+2** | Skip to navigation |
| **Alt+A** / **Option+A** | Open accessibility menu |
| **Escape** | Close modals/menus |
| **Tab** / **Shift+Tab** | Navigate forward/backward |
| **Arrow Keys** | Navigate lists/menus |
| **Home** / **End** | Jump to first/last item |
| **Enter** / **Space** | Activate buttons/links |

### Component-Specific Navigation

**Learning Paths:**
- Arrow keys navigate between paths
- Enter/Space to select path
- Tab to navigate within path card

**Threat Modeler:**
- Arrow keys move components
- Tab to cycle through palette
- Delete key removes component
- Escape closes modals

**Quizzes:**
- Arrow keys navigate questions
- Space to select option
- Enter to submit
- Tab to navigate controls

---

## 🔊 Screen Reader Support

### ARIA Live Regions

Automatic announcements for:
- ✅ XP gained
- ✅ Level up
- ✅ Achievement unlocked
- ✅ Module completed
- ✅ Quiz results
- ✅ Error messages
- ✅ Loading states

### ARIA Labels

All interactive elements have:
- `aria-label` for context
- `aria-labelledby` for associations
- `aria-describedby` for descriptions
- `role` attributes for semantics

### Screen Reader Testing

Tested with:
- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS/iOS)
- **TalkBack** (Android)

---

## 🎨 Visual Accessibility

### High Contrast Mode

**Activation:**
- System preference detected automatically
- Manual toggle in Accessibility Menu (Alt+A)

**Features:**
- Pure black (#000) background
- Pure white (#FFF) text
- High-contrast borders (2px solid)
- Enhanced focus indicators
- No background images
- Increased icon contrast

### Color Contrast (WCAG AAA)

**Text Contrast Ratios:**
- Normal text: 7:1 minimum
- Large text (18pt+): 4.5:1 minimum
- UI components: 3:1 minimum

**Color Palette:**

Light Mode:
- Text: #000000 on #FFFFFF (21:1)
- Links: #005A9C on #FFFFFF (8.6:1)
- Muted: #595959 on #FFFFFF (7.1:1)

Dark Mode:
- Text: #FFFFFF on #121212 (19.4:1)
- Links: #66B3FF on #121212 (9.2:1)
- Muted: #B0B0B0 on #121212 (8.3:1)

### Large Text Mode

**Activation:** Accessibility Menu → Large Text

**Effects:**
- Base font size: +25%
- Headings: +50%
- Line height: 1.8
- Button padding: +40%

---

## 🎯 Focus Management

### Focus Indicators

**Default (WCAG AAA):**
- 3px solid #2196F3 outline
- 2px offset
- High contrast blue

**Keyboard Mode:**
- 4px solid outline
- 3px offset
- Additional box shadow

**Enhanced Mode:**
- 5px solid #FFD54F outline
- 5px offset
- Pulsing animation
- Extra visual prominence

### Focus Trapping

**Modal Dialogs:**
- Focus trapped within modal
- Tab cycles through modal elements
- Shift+Tab cycles backward
- Escape closes and restores focus

**Dropdown Menus:**
- Arrow keys navigate options
- Home/End jump to first/last
- Type-ahead search
- Escape closes menu

---

## 🏃 Motion & Animation

### Reduced Motion

**System Preference:**
Automatically detects `prefers-reduced-motion: reduce`

**Manual Override:**
Accessibility Menu → Reduce Motion

**Effects:**
- All animations: 0.01ms duration
- No infinite animations
- No parallax effects
- Smooth scroll disabled
- Crossfade transitions only

### Animation Guidelines

- **Duration**: < 200ms for UI feedback
- **Purpose**: Only purposeful animations
- **Alternatives**: Instant state changes available
- **User Control**: Can be disabled globally

---

## 📱 Responsive & Mobile

### Touch Targets

**Minimum Sizes (WCAG AAA):**
- Buttons: 44x44px
- Links: 44x44px
- Form controls: 44x44px
- Interactive cards: 48x48px minimum

### Mobile Accessibility

- Pinch-to-zoom enabled
- Portrait/landscape support
- Screen reader gestures
- Voice control compatible

---

## 📋 Forms & Input

### Form Accessibility

**Every Input Has:**
- Associated `<label>` element
- `for` attribute linking label to input
- `aria-required` for required fields
- `aria-invalid` for validation errors
- `aria-describedby` for help text

**Validation:**
- Real-time validation
- Clear error messages
- `role="alert"` for errors
- Focus on first error
- Screen reader announcements

**Example:**
```html
<label for="email">
  Email Address <span class="required" aria-label="required">*</span>
</label>
<input
  type="email"
  id="email"
  required
  aria-required="true"
  aria-describedby="email-error"
>
<div id="email-error" role="alert" class="error-message"></div>
```

---

## 🛠️ Accessibility API

### JavaScript API

**Global Instance:**
```javascript
// Available globally as window.a11y
const a11y = window.a11y;
```

**Common Methods:**

```javascript
// Announce to screen readers
a11y.announce('Achievement unlocked!', false); // polite
a11y.announce('Error occurred!', true);       // assertive

// Enable keyboard navigation
a11y.enableKeyboardNavigation(element, {
  role: 'button',
  onActivate: () => console.log('Activated'),
  onEscape: () => console.log('Escaped')
});

// Arrow key navigation for lists
a11y.enableArrowNavigation(listContainer, {
  orientation: 'vertical',
  wrap: true
});

// Focus management
const savedFocus = a11y.saveFocus();
a11y.restoreFocus(savedFocus);

// Focus trap for modals
const releaseTrap = a11y.trapFocus(modalElement);
// Later: releaseTrap();

// Open accessible modal
const closeModal = a11y.openModal(modalElement, {
  title: 'Dialog Title',
  closeButton: true
});

// Create tooltip
a11y.createTooltip(trigger, 'Tooltip content');

// Make form accessible
a11y.makeFormAccessible(formElement);

// Set ARIA attributes
a11y.setAria(element, {
  'label': 'Button label',
  'expanded': 'false',
  'controls': 'menu-id'
});
```

---

## 🎛️ Accessibility Menu

### Features

**Toggle Options:**
- High Contrast Mode
- Large Text
- Reduce Motion
- Enhanced Focus Indicators
- Debug Mode

**Keyboard Shortcuts Reference:**
Complete list of all keyboard shortcuts

**Persistent Preferences:**
Settings saved to localStorage

**Activation:**
- Keyboard: Alt+A / Option+A
- Programmatic: `window.a11y.openAccessibilityMenu()`

---

## ✅ Testing & Validation

### Automated Testing

**Tools:**
- axe DevTools
- WAVE Browser Extension
- Lighthouse Accessibility Audit
- pa11y-ci in CI/CD

**Coverage:**
- WCAG 2.1 AAA
- Section 508
- EN 301 549
- ADA compliance

### Manual Testing

**Keyboard Navigation:**
- Unplug mouse, navigate entire site
- All functionality accessible via keyboard
- Logical tab order
- Visible focus at all times

**Screen Reader:**
- Navigate with screen reader only
- All content announced correctly
- Landmarks used properly
- ARIA labels meaningful

**Visual:**
- Zoom to 200%
- High contrast mode
- Color blindness simulation
- Reduced motion

### Testing Checklist

- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Headings in logical order
- [ ] Color not sole indicator
- [ ] Focus visible
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Contrast ratios met
- [ ] Text resizable
- [ ] Motion can be disabled

---

## 🐛 Common Issues & Fixes

### Missing Alt Text

**Problem:** Images without alt attributes
**Solution:**
```html
<!-- Meaningful images -->
<img src="chart.png" alt="User progress chart showing 85% completion">

<!-- Decorative images -->
<img src="decoration.svg" alt="" role="presentation">
```

### Poor Color Contrast

**Problem:** Text hard to read
**Solution:** Use AAA contrast checker, adjust colors

### Keyboard Trap

**Problem:** Can't escape element with keyboard
**Solution:** Implement proper focus management

```javascript
element.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeElement();
    restoreFocus();
  }
});
```

### Missing Focus Indicator

**Problem:** Can't see keyboard focus
**Solution:** Never use `outline: none` without replacement

```css
button:focus {
  outline: 3px solid #2196F3;
  outline-offset: 2px;
}
```

---

## 📚 Resources

### WCAG Guidelines
- [WCAG 2.1 AAA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [Understanding WCAG](https://www.w3.org/WAI/WCAG21/Understanding/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [Screen Reader Testing](https://www.nvaccess.org/)

### Learning
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## 🤝 Contributing

When adding new features:

1. **Test with keyboard** - Navigate without mouse
2. **Add ARIA labels** - Meaningful labels for all interactive elements
3. **Check contrast** - Use contrast checker
4. **Test with screen reader** - NVDA, JAWS, or VoiceOver
5. **Document** - Update this guide with new patterns
6. **Automate** - Add pa11y tests

---

**Version:** 1.0
**WCAG Level:** AAA
**Last Updated:** January 2025
**Maintainers:** OWASP AI Security Team
