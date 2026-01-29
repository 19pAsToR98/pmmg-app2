const CACHE_NAME = 'pmmg-operacional-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/index.css',
  '/manifest.json',
  // Adicione aqui os caminhos para seus ícones PWA
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Adicione aqui os caminhos para os arquivos JS/CSS externos que não são importados via importmap (Tailwind, Material Symbols, Leaflet)
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Instalação: Cacheia os assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.filter(url => url.indexOf('undefined') === -1));
      })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Serve assets do cache, voltando à rede se necessário
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna o recurso do cache se encontrado
        if (response) {
          return response;
        }
        // Se não estiver no cache, busca na rede
        return fetch(event.request);
      }
    )
  );
});