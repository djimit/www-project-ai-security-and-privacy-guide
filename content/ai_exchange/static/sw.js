/**
 * Service Worker for OWASP AI Security Exchange
 * Provides offline support and caching for better performance
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `owasp-ai-security-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/learning-paths/',
  '/threat-modeler/',
  '/css/dist/gamification.min.css',
  '/css/dist/threat-modeler.min.css',
  '/js/dist/gamification.min.js',
  '/js/dist/threat-modeler.min.js',
  '/data/learning-paths.json',
  '/data/achievements.json',
  '/data/quizzes.json',
];

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',     // For static assets
  NETWORK_FIRST: 'network-first', // For dynamic content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate', // For data files
};

// Install event - cache initial assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('owasp-ai-security-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Determine strategy based on request type
  let strategy = STRATEGIES.NETWORK_FIRST;

  if (isStaticAsset(url.pathname)) {
    strategy = STRATEGIES.CACHE_FIRST;
  } else if (isDataFile(url.pathname)) {
    strategy = STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Request handlers
async function handleRequest(request, strategy) {
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

// Cache First strategy - for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network First strategy - for dynamic content
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url);

    const cached = await caches.match(request);

    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }

    // Return offline page if available
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Stale While Revalidate - for data files
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  // Return cached version immediately
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version if available, otherwise wait for network
  return cached || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

function isDataFile(pathname) {
  return pathname.includes('/data/') && pathname.endsWith('.json');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Sync gamification progress when back online
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_PROGRESS',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New achievement unlocked!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'OWASP AI Security', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('[SW] Service worker loaded');
