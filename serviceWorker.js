const staticJiten = "Static-Jiten";

const assets = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json",
  "./images/icons/logo-144x144.png",
  "./images/icons/logo-16x16.png",
  "styles/styles.css",
  "sitios/guardados.html",
  "images/icons/bookmark.png",
  "images/icons/house.png",
  "images/icons/search.png",
  "images/icons/facebook.png",
  "images/icons/instagram.png",
  "images/icons/twitter.png",
  "images/icons/logo-icono.png",
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticJiten).then((cache) => {
      cache.addAll(assets);
    })
  );
});
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
