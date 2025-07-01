// Service Worker para gerenciar notificações push
const CACHE_NAME = "financeai-pro-v1";

// Lista de recursos para cache offline
const urlsToCache = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições para cache offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Recebimento de notificações push
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.actionUrl || "/",
      ...data.metadata,
    },
    actions: [
      {
        action: "view",
        title: "Ver detalhes",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
    tag: data.type,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clique em notificações
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url;

      // Se já houver uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      // Se não houver janela aberta, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Sincronização em background
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(
      // Aqui você implementaria a lógica para sincronizar notificações
      // quando o usuário voltar a ficar online
      Promise.resolve()
    );
  }
});
