// service-worker.js

const CACHE_NAME = 'mi-cache';
const DYNAMIC_CACHE_NAME = 'dynamic-cache';
const MAX_DYNAMIC_FILES = 5;

const archivosAAlmacenarEnCache = [
  '/',
  'index.html',
  'css/bootstrap.min.css',
  'css/londinium-theme.css',
  'css/styles.css',
  'css/icons.css',
  'http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&amp;subset=latin,cyrillic-ext',
  'manifest.json',
  'js/bootstrap.min.js',
  'js/application.js',
  'js/app.js',
  'offline.html',
  'images/not-found.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(archivosAAlmacenarEnCache);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request).then(function (dynamicResponse) {
          return caches.open(DYNAMIC_CACHE_NAME).then(function (dynamicCache) {
            dynamicCache.keys().then(function (keys) {
              if (keys.length >= MAX_DYNAMIC_FILES) {
                dynamicCache.delete(keys[0]);
              }
            });

            dynamicCache.put(event.request.url, dynamicResponse.clone());
            return dynamicResponse;
          });
        }).catch(function () {
          return caches.match('offline.html');
        });
      }
    })
  );
});

//Cache Estática (mi-cache):
//Almacena archivos estáticos durante la instalación del service worker.
//Contiene recursos esenciales como HTML, CSS, JS y otros archivos estáticos.
//No se actualiza automáticamente, requiere intervención para cambios.

//Cache Dinámica (dynamic-cache):
//Almacena archivos dinámicos generados en tiempo de ejecución.
//Limita la cantidad de archivos mediante MAX_DYNAMIC_FILES.
//Permite una experiencia offline al proporcionar una página almacenada en mi-cache si la red no está disponible.

//Ventajas:
//Mejora la velocidad de carga al reducir la dependencia de la red.
//Proporciona una experiencia offline con una página almacenada.

//Desventajas:
//Posible obsolescencia de la caché estática en cambios.
//Limitación en el número de archivos en dynamic-cache.