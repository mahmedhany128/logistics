// 📄 service-worker.js
const CACHE_NAME = 'logistics-pro-v1';

// ✅ تم تعديل المسارات لتكون مطلقة وتطابق مسار الـ Repository على GitHub Pages
const urlsToCache = [
  '/logistics/',           // المسار الرئيسي للتطبيق
  '/logistics/index.html', // ملف الواجهة
  '/logistics/manifest.json', // ملف الـ PWA
  // '/logistics/data.json' // لو محتاج تخزن البيانات مبدئياً (اختياري)
];

// 1️⃣ مرحلة التثبيت: تخزين الملفات
self.addEventListener('install', event => {
  console.log('🔄 [SW] Installing...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 [SW] Caching assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [SW] Install successful');
        return self.skipWaiting(); // تفعيل الـ SW الجديد فوراً
      })
      .catch(err => {
        console.error('❌ [SW] Install failed:', err);
      })
  );
});

// 2️⃣ مرحلة التفعيل: تنظيف الكاش القديمة
self.addEventListener('activate', event => {
  console.log('🚀 [SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✨ [SW] Claiming clients');
      return self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
    })
  );
});

// 3️⃣ اعتراض الطلبات: استراتيجية Network First then Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // لو النت شغال: نرجع الريسبونس ونحدث الكاش في الخلفية
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // لو النت مفصول: نجيب من الكاش
        console.log('📡 [SW] Offline mode: Serving from cache', event.request.url);
        return caches.match(event.request);
      })
  );
});
