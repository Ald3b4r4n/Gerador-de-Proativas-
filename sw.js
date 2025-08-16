// Define um nome e versão para o cache
const CACHE_NAME = 'proativas-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline do app
// Incluindo os arquivos do CDN do Bootstrap
const URLS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './logo-192.png',
  './logo-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Evento 'install': é acionado quando o service worker é instalado
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  // Aguarda até que o cache seja aberto e todos os arquivos sejam armazenados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto. Adicionando arquivos essenciais.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Força o novo service worker a se tornar ativo
  );
});

// Evento 'activate': é acionado quando o service worker é ativado
// Usado para limpar caches antigos
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Ativado.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});


// Evento 'fetch': intercepta todas as requisições de rede da página
self.addEventListener('fetch', (event) => {
  // Responde à requisição com uma estratégia "Cache-first"
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se a requisição estiver no cache, retorna a resposta do cache
        if (response) {
          // console.log('Service Worker: Encontrado no cache:', event.request.url);
          return response;
        }
        // Se não estiver no cache, busca na rede
        // console.log('Service Worker: Não encontrado no cache, buscando na rede:', event.request.url);
        return fetch(event.request);
      })
  );
});


