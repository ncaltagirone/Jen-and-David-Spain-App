// Jen & David Go To Spain - Service Worker
// Caches all app assets on first load for offline use

const CACHE_NAME = 'spain-app-v2';

// All files to cache for offline use
const FILES_TO_CACHE = [
  '/Jen-and-David-Spain-App/',
  '/Jen-and-David-Spain-App/index.html',
  '/Jen-and-David-Spain-App/manifest.json',
  '/Jen-and-David-Spain-App/icon-192.svg',
  '/Jen-and-David-Spain-App/icon-512.svg',
  '/Jen-and-David-Spain-App/velazquez.jpg',
  '/Jen-and-David-Spain-App/goya.jpg',
  '/Jen-and-David-Spain-App/bosch.jpg',
  '/Jen-and-David-Spain-App/royal-palace.jpg',
  '/Jen-and-David-Spain-App/alcazar-seville.jpg',
  '/Jen-and-David-Spain-App/cathedral-seville.jpg'
];

// Install: cache everything on first load
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Spain app: caching files for offline use');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches if app is updated
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('Spain app: removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache when offline, network when online
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Return cached version if available
      if (response) {
        return response;
      }
      // Otherwise try network
      return fetch(event.request).then(function(networkResponse) {
        // Cache any new successful responses
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // If both cache and network fail, return the main page
        return caches.match('/Jen-and-David-Spain-App/index.html');
      });
    })
  );
});