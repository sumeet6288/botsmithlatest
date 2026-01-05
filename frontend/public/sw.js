/* eslint-disable no-restricted-globals */

// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('Push notification received', event);

  let data = {
    title: 'BotSmith Notification',
    body: 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.action_url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BotSmith', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked', event);
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});
