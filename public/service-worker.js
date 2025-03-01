const CACHE_NAME = 'spin-the-wheel-v1';
const ASSETS_TO_CACHE = [
  '/app.html',
  '/manifest.json',
  '/icons/wheel.png'  
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching ressurser');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Fjerner gammel cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});