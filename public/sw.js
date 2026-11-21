// DiezMil service worker: makes the scorekeeper installable and playable offline.
// Game state lives in localStorage, so the worker only has to keep the app shell available.
// Bump VERSION to drop every old cache on the next visit.
const VERSION = 'v1';
const CACHE = `diezmil-${VERSION}`;
const SHELL = ['/', '/icons/icon-192.png', '/icons/icon-512.png'];

// Pulls the hashed JS/CSS/font files (and the hero image) out of the home page so the
// very first visit is already fully available offline, not only the second one.
async function precacheShell(cache) {
  await cache.addAll(SHELL);
  const html = await (await cache.match('/')).text();
  const assets = new Set(html.match(/\/_next\/static\/[^"'\\\s)<>]+/g) || []);
  const image = html.match(/\/_next\/image\?[^"'\\\s<>]+/);
  if (image) assets.add(image[0].replace(/&amp;/g, '&'));
  for (const url of [...assets].filter((u) => u.endsWith('.css'))) {
    try {
      const css = await (await fetch(url)).text();
      for (const [, ref] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        if (ref.endsWith('.woff')) continue; // every browser with service workers supports woff2
        assets.add(new URL(ref, new URL(url, self.location.origin)).pathname);
      }
    } catch {
      // A missing font must not block installation.
    }
  }
  await Promise.all([...assets].map((url) => cache.add(url).catch(() => {})));
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(precacheShell).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('diezmil-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isImmutableAsset = (url) =>
  url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: prefer the network so updates arrive, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => caches.match('/').then((cached) => cached || Response.error())),
    );
    return;
  }

  // Hashed/static assets never change under the same URL: serve from cache first.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
