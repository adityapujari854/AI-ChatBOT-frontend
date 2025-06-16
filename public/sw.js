// public/sw.js

self.addEventListener('install', (event) => {
    console.log('✅ Nimbus Service Worker installed');
    self.skipWaiting(); // Force SW to become active immediately
  });
  
  self.addEventListener('activate', (event) => {
    console.log('✅ Nimbus Service Worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  });
  