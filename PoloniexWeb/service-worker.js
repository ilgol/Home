(function () {
    'use strict';

    var filesToCache = [
        'Images/logo-apple.jpg',
        'Images/logo-windows.jpg',
        'Images/logo-google.jpg',
        'Images/Logo.jpg',
        'Images/down-arrow.png',
        'Images/up-arrow.png',
        'favicon.ico'
    ];

    var staticCacheName = 'pages-cache-v1';

    self.addEventListener('install', function (event) {
        console.log('Attempting to install service worker and cache static assets');
        event.waitUntil(
          caches.open(staticCacheName)
          .then(function (cache) {
              return cache.addAll(filesToCache);
          })
        );
    });

    self.addEventListener('fetch', function (event) {
        event.respondWith(
          caches.match(event.request).then(function (response) {
              if (response) {
                  return response;
              }
              return fetch(event.request).then(function (response) {
                  if (response.status === 404) {
                      return caches.match('pages/404.html');
                  }
                  return caches.open(staticCacheName).then(function (cache) {
                      if (event.request.url.indexOf('test') < 0) {
                          cache.put(event.request.url, response.clone());
                      }
                      return response;
                  });
              });
          }).catch(function (error) {
              return caches.match('pages/offline.html');
          })
        );
    });

    self.addEventListener('activate', function (event) {
        console.log('Activating new service worker...');

        var cacheWhitelist = [staticCacheName];

        event.waitUntil(
          caches.keys().then(function (cacheNames) {
              return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
              );
          })
        );
    });
})();
