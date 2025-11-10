/**
 * Accessibility Utilities for OWASP AI Security Exchange
 * Provides comprehensive a11y support: keyboard navigation, screen readers, ARIA
 */

class AccessibilityManager {
  constructor() {
    this.focusableElements = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.trapStack = [];
    this.announcer = null;

    this.init();
  }

  init() {
    this.createScreenReaderAnnouncer();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupReducedMotion();
    this.setupHighContrast();
    this.addSkipLinks();
  }

  // ==================== Screen Reader Support ====================

  createScreenReaderAnnouncer() {
    // Create ARIA live region for announcements
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('role', 'status');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);

    // Create assertive announcer for urgent messages
    this.assertiveAnnouncer = document.createElement('div');
    this.assertiveAnnouncer.setAttribute('role', 'alert');
    this.assertiveAnnouncer.setAttribute('aria-live', 'assertive');
    this.assertiveAnnouncer.setAttribute('aria-atomic', 'true');
    this.assertiveAnnouncer.className = 'sr-only';
    document.body.appendChild(this.assertiveAnnouncer);
  }

  announce(message, assertive = false) {
    const announcer = assertive ? this.assertiveAnnouncer : this.announcer;

    // Clear previous message
    announcer.textContent = '';

    // Announce new message (timeout ensures screen reader picks up change)
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }

  // ==================== Keyboard Navigation ====================

  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt+1 or Option+1)
      if ((e.altKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        this.skipToMain();
      }

      // Skip to navigation (Alt+2)
      if ((e.altKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        this.skipToNavigation();
      }

      // Open accessibility menu (Alt+A)
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.openAccessibilityMenu();
      }

      // Escape key - close modals/menus
      if (e.key === 'Escape') {
        this.handleEscape();
      }
    });
  }

  // Enable keyboard navigation for custom components
  enableKeyboardNavigation(element, options = {}) {
    const {
      role = 'button',
      onActivate,
      onEscape,
      customKeys = {}
    } = options;

    element.setAttribute('role', role);

    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    element.addEventListener('keydown', (e) => {
      // Enter or Space activates
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onActivate) onActivate(e);
      }

      // Escape key
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape(e);
      }

      // Custom key handlers
      if (customKeys[e.key]) {
        customKeys[e.key](e);
      }
    });
  }

  // Arrow key navigation for lists/grids
  enableArrowNavigation(container, options = {}) {
    const {
      orientation = 'vertical', // 'vertical', 'horizontal', 'both'
      wrap = true,
      role = 'list'
    } = options;

    container.setAttribute('role', role);

    const items = Array.from(container.querySelectorAll('[role="listitem"], [role="gridcell"], [role="option"]'));

    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');

      item.addEventListener('keydown', (e) => {
        let targetIndex = index;

        // Vertical navigation
        if (orientation === 'vertical' || orientation === 'both') {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            targetIndex = wrap ? (index + 1) % items.length : Math.min(index + 1, items.length - 1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            targetIndex = wrap ? (index - 1 + items.length) % items.length : Math.max(index - 1, 0);
          }
        }

        // Horizontal navigation
        if (orientation === 'horizontal' || orientation === 'both') {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            targetIndex = wrap ? (index + 1) % items.length : Math.min(index + 1, items.length - 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            targetIndex = wrap ? (index - 1 + items.length) % items.length : Math.max(index - 1, 0);
          }
        }

        // Home/End keys
        if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = items.length - 1;
        }

        if (targetIndex !== index) {
          this.moveFocus(items[index], items[targetIndex]);
        }
      });
    });
  }

  moveFocus(from, to) {
    from.setAttribute('tabindex', '-1');
    to.setAttribute('tabindex', '0');
    to.focus();
  }

  // ==================== Focus Management ====================

  setupFocusManagement() {
    // Track focus for debugging
    if (localStorage.getItem('a11y-debug') === 'true') {
      document.addEventListener('focusin', (e) => {
        console.log('Focus:', e.target);
      });
    }

    // Ensure visible focus indicators
    document.addEventListener('mousedown', () => {
      document.body.classList.add('using-mouse');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('using-mouse');
      }
    });
  }

  // Focus trap for modals/dialogs
  trapFocus(element) {
    const focusable = element.querySelectorAll(this.focusableElements);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    const trap = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', trap);

    this.trapStack.push({ element, trap });

    // Focus first element
    setTimeout(() => firstFocusable?.focus(), 0);

    return () => this.releaseFocus(element);
  }

  releaseFocus(element) {
    const index = this.trapStack.findIndex(t => t.element === element);
    if (index > -1) {
      const { trap } = this.trapStack[index];
      element.removeEventListener('keydown', trap);
      this.trapStack.splice(index, 1);
    }
  }

  // Save and restore focus
  saveFocus() {
    return document.activeElement;
  }

  restoreFocus(element) {
    if (element && element.focus) {
      element.focus();
    }
  }

  // ==================== Skip Links ====================

  addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#search" class="skip-link">Skip to search</a>
    `;
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  skipToMain() {
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      this.announce('Skipped to main content');
    }
  }

  skipToNavigation() {
    const nav = document.getElementById('navigation') || document.querySelector('nav');
    if (nav) {
      nav.setAttribute('tabindex', '-1');
      nav.focus();
      this.announce('Skipped to navigation');
    }
  }

  // ==================== Reduced Motion ====================

  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotion = () => {
      if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduce-motion');
        this.announce('Animations reduced for accessibility');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    updateMotion();
    prefersReducedMotion.addEventListener('change', updateMotion);
  }

  // ==================== High Contrast ====================

  setupHighContrast() {
    // Detect high contrast mode
    const highContrast = window.matchMedia('(prefers-contrast: high)');

    const updateContrast = () => {
      if (highContrast.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    updateContrast();
    highContrast.addEventListener('change', updateContrast);
  }

  // ==================== ARIA Helpers ====================

  // Update ARIA attributes dynamically
  setAria(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      const attr = key.startsWith('aria-') ? key : `aria-${key}`;
      element.setAttribute(attr, value);
    });
  }

  // Create accessible tooltips
  createTooltip(trigger, content) {
    const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

    const tooltip = document.createElement('div');
    tooltip.id = id;
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = content;
    document.body.appendChild(tooltip);

    trigger.setAttribute('aria-describedby', id);

    trigger.addEventListener('mouseenter', () => this.showTooltip(tooltip, trigger));
    trigger.addEventListener('mouseleave', () => this.hideTooltip(tooltip));
    trigger.addEventListener('focus', () => this.showTooltip(tooltip, trigger));
    trigger.addEventListener('blur', () => this.hideTooltip(tooltip));

    return tooltip;
  }

  showTooltip(tooltip, trigger) {
    const rect = trigger.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 8}px`;
    tooltip.style.left = `${rect.left}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip(tooltip) {
    tooltip.classList.remove('visible');
  }

  // ==================== Form Accessibility ====================

  makeFormAccessible(form) {
    // Add labels to all inputs
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const id = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
      input.id = id;

      // Find or create label
      let label = form.querySelector(`label[for="${id}"]`);
      if (!label) {
        label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = input.getAttribute('placeholder') || input.name || 'Input field';
        input.parentNode.insertBefore(label, input);
      }

      // Add required indicator
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
        label.innerHTML += ' <span class="required" aria-label="required">*</span>';
      }

      // Add error support
      const errorId = `${id}-error`;
      input.setAttribute('aria-describedby', errorId);

      const error = document.createElement('div');
      error.id = errorId;
      error.className = 'error-message';
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');
      input.parentNode.appendChild(error);
    });

    // Form validation with accessibility
    form.addEventListener('submit', (e) => {
      const invalid = form.querySelectorAll(':invalid');
      if (invalid.length > 0) {
        e.preventDefault();
        invalid[0].focus();
        this.announce(`Form has ${invalid.length} error${invalid.length > 1 ? 's' : ''}. Please correct them.`, true);
      }
    });
  }

  // ==================== Modal/Dialog Accessibility ====================

  openModal(modal, options = {}) {
    const { title, closeButton = true } = options;

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    if (title) {
      const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
      const titleElement = modal.querySelector('h1, h2, h3');
      if (titleElement) {
        titleElement.id = titleId;
        modal.setAttribute('aria-labelledby', titleId);
      }
    }

    // Save current focus
    const previousFocus = this.saveFocus();

    // Show modal
    modal.classList.add('open');
    modal.removeAttribute('hidden');

    // Trap focus
    const releaseFocus = this.trapFocus(modal);

    // Close handlers
    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('hidden', '');
      releaseFocus();
      this.restoreFocus(previousFocus);
      this.announce('Dialog closed');
    };

    if (closeButton) {
      const closeBtn = modal.querySelector('[data-close], .close-button');
      if (closeBtn) {
        closeBtn.addEventListener('click', close, { once: true });
      }
    }

    this.announce(`Dialog opened: ${title || 'Dialog'}`);

    return close;
  }

  // ==================== Accessibility Menu ====================

  openAccessibilityMenu() {
    // Create or show accessibility options menu
    let menu = document.getElementById('accessibility-menu');

    if (!menu) {
      menu = this.createAccessibilityMenu();
    }

    this.openModal(menu, { title: 'Accessibility Options' });
  }

  createAccessibilityMenu() {
    const menu = document.createElement('div');
    menu.id = 'accessibility-menu';
    menu.className = 'accessibility-menu modal';
    menu.setAttribute('hidden', '');
    menu.innerHTML = `
      <div class="modal-content">
        <h2>Accessibility Options</h2>
        <button class="close-button" data-close aria-label="Close accessibility menu">×</button>

        <div class="options">
          <label>
            <input type="checkbox" id="a11y-high-contrast">
            <span>High Contrast Mode</span>
          </label>

          <label>
            <input type="checkbox" id="a11y-large-text">
            <span>Larger Text</span>
          </label>

          <label>
            <input type="checkbox" id="a11y-reduce-motion">
            <span>Reduce Motion</span>
          </label>

          <label>
            <input type="checkbox" id="a11y-focus-highlight">
            <span>Enhanced Focus Indicators</span>
          </label>

          <label>
            <input type="checkbox" id="a11y-debug">
            <span>Accessibility Debug Mode</span>
          </label>
        </div>

        <div class="shortcuts">
          <h3>Keyboard Shortcuts</h3>
          <dl>
            <dt>Alt+1 / Option+1</dt>
            <dd>Skip to main content</dd>

            <dt>Alt+2 / Option+2</dt>
            <dd>Skip to navigation</dd>

            <dt>Alt+A / Option+A</dt>
            <dd>Open this menu</dd>

            <dt>Escape</dt>
            <dd>Close dialogs and menus</dd>

            <dt>Tab / Shift+Tab</dt>
            <dd>Navigate forward / backward</dd>

            <dt>Arrow keys</dt>
            <dd>Navigate within lists and menus</dd>
          </dl>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    // Wire up options
    menu.querySelector('#a11y-high-contrast').addEventListener('change', (e) => {
      document.documentElement.classList.toggle('high-contrast', e.target.checked);
      localStorage.setItem('a11y-high-contrast', e.target.checked);
    });

    menu.querySelector('#a11y-large-text').addEventListener('change', (e) => {
      document.documentElement.classList.toggle('large-text', e.target.checked);
      localStorage.setItem('a11y-large-text', e.target.checked);
    });

    menu.querySelector('#a11y-reduce-motion').addEventListener('change', (e) => {
      document.documentElement.classList.toggle('reduce-motion', e.target.checked);
      localStorage.setItem('a11y-reduce-motion', e.target.checked);
    });

    menu.querySelector('#a11y-focus-highlight').addEventListener('change', (e) => {
      document.documentElement.classList.toggle('focus-highlight', e.target.checked);
      localStorage.setItem('a11y-focus-highlight', e.target.checked);
    });

    menu.querySelector('#a11y-debug').addEventListener('change', (e) => {
      localStorage.setItem('a11y-debug', e.target.checked);
    });

    // Load saved preferences
    this.loadAccessibilityPreferences(menu);

    return menu;
  }

  loadAccessibilityPreferences(menu) {
    const prefs = {
      'a11y-high-contrast': document.documentElement.classList.contains('high-contrast'),
      'a11y-large-text': localStorage.getItem('a11y-large-text') === 'true',
      'a11y-reduce-motion': document.documentElement.classList.contains('reduce-motion'),
      'a11y-focus-highlight': localStorage.getItem('a11y-focus-highlight') === 'true',
      'a11y-debug': localStorage.getItem('a11y-debug') === 'true'
    };

    Object.entries(prefs).forEach(([id, checked]) => {
      const checkbox = menu.querySelector(`#${id}`);
      if (checkbox) {
        checkbox.checked = checked;
        if (checked) {
          const className = id.replace('a11y-', '');
          document.documentElement.classList.add(className);
        }
      }
    });
  }

  // ==================== Utilities ====================

  handleEscape() {
    // Close top modal/menu
    const modal = document.querySelector('.modal.open');
    if (modal) {
      const closeButton = modal.querySelector('[data-close]');
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  // Check if element is visible
  isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  // Get accessible name of element
  getAccessibleName(element) {
    // Check aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent.trim();
    }

    // Check associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Check title
    const title = element.getAttribute('title');
    if (title) return title;

    // Check alt (for images)
    const alt = element.getAttribute('alt');
    if (alt) return alt;

    // Return text content as fallback
    return element.textContent.trim();
  }
}

// Initialize global accessibility manager
window.a11y = new AccessibilityManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}
