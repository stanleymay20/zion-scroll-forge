// ScrollUniversity Service Worker
// Version 1.0.0

const CACHE_VERSION = 'scrolluniversity-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('scrolluniversity-') && 
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests from being cached (handle separately)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle images with cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default: cache-first for static assets
  event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE));
});

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.log('[Service Worker] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      limitCacheSize(cacheName, maxSize);
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    console.log('[Service Worker] Network-first fetch:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const staticCache = await caches.open(STATIC_CACHE);
      return staticCache.match('/offline.html');
    }
    
    throw error;
  }
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    console.log(`[Service Worker] Cache ${cacheName} exceeds max size, cleaning up`);
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxSize);
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('[Service Worker] Syncing offline data...');
    
    // Get all pending sync requests from IndexedDB
    const db = await openDatabase();
    const pendingRequests = await getPendingRequests(db);
    
    // Process each pending request
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        // Remove from pending queue on success
        await removePendingRequest(db, request.id);
        console.log('[Service Worker] Synced request:', request.url);
      } catch (error) {
        console.error('[Service Worker] Failed to sync request:', error);
      }
    }
    
    console.log('[Service Worker] Offline data sync complete');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from ScrollUniversity',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'scrolluniversity-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open', icon: '/icons/icon-96x96.png' },
      { action: 'close', title: 'Close', icon: '/icons/icon-96x96.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ScrollUniversity', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        ))
    );
  }
});

// Helper functions for IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ScrollUniversityDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingRequests(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingRequests'], 'readonly');
    const store = transaction.objectStore('pendingRequests');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingRequest(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

console.log('[Service Worker] Loaded successfully');
