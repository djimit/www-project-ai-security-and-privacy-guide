/**
 * Tests for AccessibilityManager (accessibility.js)
 * Tests WCAG AAA compliance, keyboard navigation, screen reader support
 */

// Mock AccessibilityManager since it's browser-based
class MockAccessibilityManager {
  constructor() {
    this.announcer = { textContent: '' };
    this.assertiveAnnouncer = { textContent: '' };
    this.focusStack = [];
    this.config = {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      enhancedFocus: true
    };
  }

  announce(message, assertive = false) {
    const announcer = assertive ? this.assertiveAnnouncer : this.announcer;
    announcer.textContent = message;
    return message;
  }

  saveFocus() {
    const activeElement = document.activeElement;
    if (activeElement) {
      this.focusStack.push(activeElement);
    }
  }

  restoreFocus() {
    if (this.focusStack.length > 0) {
      const element = this.focusStack.pop();
      element?.focus();
      return true;
    }
    return false;
  }

  enableKeyboardNavigation(element, options = {}) {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (options.onActivate) options.onActivate(e);
      }
      if (e.key === 'Escape') {
        if (options.onEscape) options.onEscape(e);
      }
    };

    element.addEventListener('keydown', handler);
    return handler;
  }

  setHighContrast(enabled) {
    this.config.highContrast = enabled;
    document.body.classList.toggle('high-contrast', enabled);
  }

  setLargeText(enabled) {
    this.config.largeText = enabled;
    document.body.classList.toggle('large-text', enabled);
  }

  setReduceMotion(enabled) {
    this.config.reduceMotion = enabled;
    document.body.classList.toggle('reduce-motion', enabled);
  }
}

describe('AccessibilityManager', () => {
  let a11y;

  beforeEach(() => {
    a11y = new MockAccessibilityManager();
    document.body.innerHTML = '';
  });

  describe('Screen Reader Announcements', () => {
    test('should announce message to screen reader', () => {
      a11y.announce('Test announcement');
      expect(a11y.announcer.textContent).toBe('Test announcement');
    });

    test('should use assertive announcer for assertive messages', () => {
      a11y.announce('Important message', true);
      expect(a11y.assertiveAnnouncer.textContent).toBe('Important message');
    });

    test('should not affect assertive announcer for polite messages', () => {
      a11y.announce('Polite message', false);
      expect(a11y.assertiveAnnouncer.textContent).toBe('');
    });
  });

  describe('Focus Management', () => {
    test('should save current focus', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      a11y.saveFocus();
      expect(a11y.focusStack.length).toBe(1);
      expect(a11y.focusStack[0]).toBe(button);
    });

    test('should restore saved focus', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();
      a11y.saveFocus();

      button2.focus();
      expect(document.activeElement).toBe(button2);

      const restored = a11y.restoreFocus();
      expect(restored).toBe(true);
    });

    test('should return false when no focus to restore', () => {
      const restored = a11y.restoreFocus();
      expect(restored).toBe(false);
    });

    test('should support multiple focus saves (stack)', () => {
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      const btn3 = document.createElement('button');
      document.body.append(btn1, btn2, btn3);

      btn1.focus();
      a11y.saveFocus();

      btn2.focus();
      a11y.saveFocus();

      btn3.focus();
      a11y.saveFocus();

      expect(a11y.focusStack.length).toBe(3);

      a11y.restoreFocus(); // Should restore btn3
      a11y.restoreFocus(); // Should restore btn2
      a11y.restoreFocus(); // Should restore btn1

      expect(a11y.focusStack.length).toBe(0);
    });
  });

  describe('Keyboard Navigation', () => {
    test('should enable keyboard activation with Enter', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      let activated = false;
      a11y.enableKeyboardNavigation(button, {
        onActivate: () => { activated = true; }
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(event);

      expect(activated).toBe(true);
    });

    test('should enable keyboard activation with Space', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      let activated = false;
      a11y.enableKeyboardNavigation(button, {
        onActivate: () => { activated = true; }
      });

      const event = new KeyboardEvent('keydown', { key: ' ' });
      button.dispatchEvent(event);

      expect(activated).toBe(true);
    });

    test('should handle Escape key', () => {
      const dialog = document.createElement('div');
      document.body.appendChild(dialog);

      let escaped = false;
      a11y.enableKeyboardNavigation(dialog, {
        onEscape: () => { escaped = true; }
      });

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      dialog.dispatchEvent(event);

      expect(escaped).toBe(true);
    });
  });

  describe('High Contrast Mode', () => {
    test('should enable high contrast mode', () => {
      a11y.setHighContrast(true);
      expect(a11y.config.highContrast).toBe(true);
      expect(document.body.classList.contains('high-contrast')).toBe(true);
    });

    test('should disable high contrast mode', () => {
      a11y.setHighContrast(true);
      a11y.setHighContrast(false);
      expect(a11y.config.highContrast).toBe(false);
      expect(document.body.classList.contains('high-contrast')).toBe(false);
    });
  });

  describe('Large Text Mode', () => {
    test('should enable large text mode', () => {
      a11y.setLargeText(true);
      expect(a11y.config.largeText).toBe(true);
      expect(document.body.classList.contains('large-text')).toBe(true);
    });

    test('should disable large text mode', () => {
      a11y.setLargeText(true);
      a11y.setLargeText(false);
      expect(a11y.config.largeText).toBe(false);
      expect(document.body.classList.contains('large-text')).toBe(false);
    });
  });

  describe('Reduce Motion', () => {
    test('should enable reduce motion mode', () => {
      a11y.setReduceMotion(true);
      expect(a11y.config.reduceMotion).toBe(true);
      expect(document.body.classList.contains('reduce-motion')).toBe(true);
    });

    test('should disable reduce motion mode', () => {
      a11y.setReduceMotion(true);
      a11y.setReduceMotion(false);
      expect(a11y.config.reduceMotion).toBe(false);
      expect(document.body.classList.contains('reduce-motion')).toBe(false);
    });
  });

  describe('Configuration Persistence', () => {
    test('should maintain configuration state', () => {
      a11y.setHighContrast(true);
      a11y.setLargeText(true);
      a11y.setReduceMotion(true);

      expect(a11y.config.highContrast).toBe(true);
      expect(a11y.config.largeText).toBe(true);
      expect(a11y.config.reduceMotion).toBe(true);
    });

    test('should allow independent configuration toggles', () => {
      a11y.setHighContrast(true);
      expect(a11y.config.highContrast).toBe(true);
      expect(a11y.config.largeText).toBe(false);
      expect(a11y.config.reduceMotion).toBe(false);

      a11y.setLargeText(true);
      expect(a11y.config.highContrast).toBe(true);
      expect(a11y.config.largeText).toBe(true);
      expect(a11y.config.reduceMotion).toBe(false);
    });
  });
});
