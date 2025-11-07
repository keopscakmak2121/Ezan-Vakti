/* eslint-disable no-restricted-globals */
// public/service-worker.js (Create React App uyumlu)

const CACHE_NAME = 'kuran-app-v1';
const RUNTIME_CACHE = 'kuran-runtime-v1';

// Önbelleğe alınacak statik dosyalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Kurulum başladı');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache açıldı');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.log('⚠️ Bazı dosyalar cache\'lenemedi:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Aktif edildi');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('🗑️ Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Network isteklerini yakala
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini cache'le
  if (event.request.method !== 'GET') {
    return;
  }

  // Chrome extension isteklerini atla
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // API istekleri için Network First stratejisi
  if (event.request.url.includes('aladhan.com') ||
      event.request.url.includes('everyayah.com') ||
      event.request.url.includes('alquran.cloud')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Statik dosyalar için Cache First stratejisi
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Offline ise ve cache'de de yoksa
          return new Response('Offline - İçerik bulunamadı', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// ========================================
// BİLDİRİM SİSTEMİ
// ========================================

let scheduledNotifications = [];

// Ana uygulamadan mesaj al
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker mesaj aldı:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications(event.data.notifications);
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }

  if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    clearAllScheduledNotifications();
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }

  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    showNotification('🕌 Test Bildirimi', {
      body: 'Bildirimler çalışıyor! ✅',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'test'
    });
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }
});

// Bildirimleri zamanla
function scheduleNotifications(notifications) {
  clearAllScheduledNotifications();

  const now = Date.now();

  notifications.forEach((notification) => {
    const delay = new Date(notification.notificationTime).getTime() - now;

    if (delay > 0 && delay <= 2147483647) {
      const timeoutId = setTimeout(() => {
        showPrayerNotification(notification);
      }, delay);

      scheduledNotifications.push({
        id: timeoutId,
        notification: notification
      });

      console.log(`✅ Bildirim zamanlandı: ${notification.prayerName} - ${new Date(notification.notificationTime).toLocaleString('tr-TR')}`);
    }
  });

  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATIONS_SCHEDULED',
        count: scheduledNotifications.length
      });
    });
  });
}

// Tüm zamanlanmış bildirimleri temizle
function clearAllScheduledNotifications() {
  scheduledNotifications.forEach(item => {
    clearTimeout(item.id);
  });
  scheduledNotifications = [];
  console.log('🗑️ Tüm bildirimler temizlendi');
}

// Namaz vakti bildirimi göster
function showPrayerNotification(notification) {
  const prayerNames = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const title = `🕌 ${prayerNames[notification.prayerName] || notification.prayerName} Vakti`;

  showNotification(title, {
    body: notification.message,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: `prayer-${notification.prayerName}`,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      type: 'prayer',
      prayerName: notification.prayerName,
      url: '/?view=prayerTimes'
    }
  });
}

// Bildirim göster
function showNotification(title, options) {
  return self.registration.showNotification(title, {
    icon: '/logo192.png',
    badge: '/logo192.png',
    ...options
  });
}

// Bildirime tıklanma
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Bildirime tıklandı:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url.includes(urlToOpen.replace('/?view=', '')) && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Bildirim kapatılma
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Bildirim kapatıldı:', event.notification.tag);
});

console.log('🚀 Service Worker yüklendi!');