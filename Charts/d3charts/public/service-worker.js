const CACHE_STATIC = 'static-assets-v2';  
const CACHE_API = 'api-cache-v2';         
self.addEventListener('install', (event) => {
  console.log('Service Worker Installed');
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll([
        '/',  
        '/index.html', 
        '/static/js/main.chunk.js',  
        '/static/css/main.chunk.css',  
        '/favicon.ico', 
      ]);
    })
  );
  self.skipWaiting();  
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const networkResponseClone = networkResponse.clone();
            caches.open(CACHE_API).then((cache) => {
              cache.put(event.request, networkResponseClone);
            });
          }
          return networkResponse;  
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse; 
              } else {
                return new Response('API data not available offline.', { status: 404 });
              }
            });
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const networkResponseClone = networkResponse.clone();
        return caches.open(CACHE_STATIC).then((cache) => {
          cache.put(event.request, networkResponseClone);
          return networkResponse;  
        });
      })
      .catch(() => caches.match(event.request)) 
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_STATIC, CACHE_API];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName).then((deleted) => {
              if (deleted) {
                console.log(`Cache ${cacheName} deleted`);
              }
            });
          }
        })
      );
    })
  );
  return self.clients.claim();  
});
//push notifications
self.addEventListener("push", event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "logo192.png"
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});