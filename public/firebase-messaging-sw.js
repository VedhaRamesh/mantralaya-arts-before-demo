// Firebase Cloud Messaging Service Worker for Mantralaya Arts
// Handles background push notifications when app is closed or in background

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBF589n-5SYamISY-Ie6qCOupuCLDB6Cmw",
  authDomain: "watchful-artwork-f8f9p.firebaseapp.com",
  projectId: "watchful-artwork-f8f9p",
  storageBucket: "watchful-artwork-f8f9p.firebasestorage.app",
  messagingSenderId: "253533122716",
  appId: "1:253533122716:web:645e32910aa8d3b7f4fd59"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background notification payload:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Mantralaya Arts — Order Status Update';
  const body = payload.notification?.body || payload.data?.message || payload.data?.body || 'Your order workflow stage has been updated.';
  const orderNumber = payload.data?.orderNumber || '';
  const orderId = payload.data?.orderId || '';
  const stage = payload.data?.stage || '';

  const notificationOptions = {
    body: body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: orderId ? `order-${orderId}` : `mantralaya-order-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: '/?tab=orders',
      orderId: orderId,
      orderNumber: orderNumber,
      stage: stage,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_order', title: '👁️ View Order Details' },
      { action: 'dismiss', title: 'Close' }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/?tab=orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'FCM_NOTIFICATION_CLICKED',
            orderId: event.notification.data?.orderId,
            orderNumber: event.notification.data?.orderNumber
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
