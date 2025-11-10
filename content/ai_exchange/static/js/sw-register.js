/**
 * Service Worker Registration
 * Registers the service worker for offline support and PWA functionality
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          showUpdateNotification();
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Register for background sync (if supported)
    if ('sync' in registration) {
      console.log('📱 Background sync supported');
    }

    // Check if app is installable
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      showInstallPrompt();
    });

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

function handleServiceWorkerMessage(event) {
  const { type, data } = event.data;

  switch (type) {
    case 'SYNC_PROGRESS':
      console.log('🔄 Syncing progress...');
      if (window.owaspGamification) {
        window.owaspGamification.emit('sync', data);
      }
      break;

    case 'CACHE_UPDATED':
      console.log('📦 Cache updated');
      break;

    default:
      console.log('📨 Service Worker message:', type, data);
  }
}

function showUpdateNotification() {
  // Create update notification
  const notification = document.createElement('div');
  notification.className = 'sw-update-notification';
  notification.innerHTML = `
    <div class="sw-update-content">
      <span>🎉 New version available!</span>
      <button onclick="window.location.reload()">Update Now</button>
      <button onclick="this.parentElement.parentElement.remove()">Later</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    notification.remove();
  }, 10000);
}

function showInstallPrompt() {
  // Create install prompt
  const prompt = document.createElement('div');
  prompt.className = 'pwa-install-prompt';
  prompt.innerHTML = `
    <div class="pwa-install-content">
      <span>📱 Install OWASP AI Security as an app?</span>
      <button onclick="installPWA()">Install</button>
      <button onclick="this.parentElement.parentElement.remove()">Not Now</button>
    </div>
  `;

  document.body.appendChild(prompt);
}

async function installPWA() {
  if (!window.deferredPrompt) {
    return;
  }

  // Show install prompt
  window.deferredPrompt.prompt();

  // Wait for user response
  const { outcome } = await window.deferredPrompt.userChoice;

  console.log('PWA install outcome:', outcome);

  // Clear the deferred prompt
  window.deferredPrompt = null;

  // Remove prompt UI
  const prompt = document.querySelector('.pwa-install-prompt');
  if (prompt) {
    prompt.remove();
  }
}

// Offline/Online detection
window.addEventListener('online', () => {
  console.log('🌐 Back online');
  showNotification('You are back online!', 'success');

  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('sync-progress');
    });
  }
});

window.addEventListener('offline', () => {
  console.log('📴 Offline mode');
  showNotification('You are offline. Some features may be limited.', 'warning');
});

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `network-notification network-notification--${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { registerServiceWorker, installPWA };
}
