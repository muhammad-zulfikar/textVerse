self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('google-api-cache').then((cache) => {
      return cache.add('https://apis.google.com/js/api.js');
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('apis.google.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});