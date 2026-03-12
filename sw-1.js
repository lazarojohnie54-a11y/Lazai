const CACHE = 'lazai-pro-v4';
const OFFLINE_URLS = [
  '/Lazai/LazAI-Pro.html',
  '/Lazai/manifest.json',
  '/Lazai/icon-192.png',
  '/Lazai/icon-512.png',
];

// ══ INSTALL — Hifadhi faili offline ══
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(OFFLINE_URLS).catch(err => {
        console.log('Cache partial:', err);
      });
    })
  );
  self.skipWaiting();
});

// ══ ACTIVATE — Futa cache za zamani ══
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ══ FETCH — Onyesha kutoka cache au mtandao ══
self.addEventListener('fetch', e => {
  // Skip non-GET and external API calls (Groq, Pollinations)
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('groq.com') || 
      url.hostname.includes('pollinations.ai') ||
      url.hostname.includes('fonts.googleapis.com')) {
    return; // Ruhusu kupita moja kwa moja
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Hifadhi responses mpya
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Hakuna mtandao — rudisha HTML kuu
        if (e.request.destination === 'document') {
          return caches.match('/Lazai/LazAI-Pro.html');
        }
      });
    })
  );
});
