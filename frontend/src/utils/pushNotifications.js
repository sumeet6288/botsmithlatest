/**
 * Push Notifications Utility
 * Handles service worker registration and push notification subscriptions
 */

// Note: This is a placeholder VAPID key. In production, generate your own using:
// npx web-push generate-vapid-keys
const PUBLIC_VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nqm_mU';

/**
 * Convert base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('❌ Service Worker not supported in this browser');
    throw new Error('Service Worker not supported in this browser');
  }

  try {
    // Check if there's already a registration
    let registration = await navigator.serviceWorker.getRegistration('/');
    
    if (registration) {
      console.log('✅ Service Worker already registered');
      await navigator.serviceWorker.ready;
      return registration;
    }
    
    // Register new service worker
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('✅ Service Worker registered successfully');
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker is ready');
    
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    throw new Error('Service Worker registration failed: ' + error.message);
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported() {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current notification permission
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

/**
 * Subscribe to push notifications
 * Returns: { success: boolean, subscription: object|null, mode: 'full'|'basic', error: string|null }
 */
export async function subscribeToPushNotifications() {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported in this browser. Please use Chrome, Firefox, or Edge.');
  }

  // Check permission
  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permission denied by user. Please check your browser settings and allow notifications for this site.');
    }
  }

  // Register service worker
  let registration;
  try {
    registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker registration failed');
    }
  } catch (swError) {
    console.error('❌ Service Worker registration failed:', swError);
    // Even if SW fails, basic notifications can work
    return {
      success: true,
      subscription: null,
      mode: 'basic',
      error: 'Service Worker failed, using basic notifications only'
    };
  }

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Try to create new subscription with VAPID key
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      console.log('✅ New push subscription created with VAPID');
      return {
        success: true,
        subscription: subscription,
        mode: 'full',
        error: null
      };
    } catch (vapidError) {
      console.warn('⚠️ VAPID subscription failed:', vapidError.message);
      // VAPID keys not configured - this is OK for basic notifications
      // We can still use regular browser notifications without push subscription
      console.log('✅ Using basic browser notifications (without server push)');
      return {
        success: true,
        subscription: null,
        mode: 'basic',
        error: null
      };
    }
  } else {
    console.log('✅ Existing push subscription found');
    return {
      success: true,
      subscription: subscription,
      mode: 'full',
      error: null
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Successfully unsubscribed from push notifications');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}

/**
 * Send subscription to backend
 */
export async function sendSubscriptionToBackend(subscription, api) {
  // If no subscription (VAPID keys not configured), skip backend save
  if (!subscription) {
    console.log('ℹ️ No push subscription to save (VAPID keys not configured - this is OK for basic notifications)');
    return null;
  }

  try {
    const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      },
      browser: getBrowserInfo()
    };

    const response = await api.post('/notifications/push-subscription', subscriptionObject);
    console.log('✅ Subscription saved to backend');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to save subscription to backend:', error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Get browser information
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
  }
  
  return browserName;
}

/**
 * Test push notification
 */
export async function testPushNotification() {
  if (!('Notification' in window)) {
    const error = 'Notifications API not supported in this browser';
    console.error('❌', error);
    throw new Error(error);
  }

  if (Notification.permission !== 'granted') {
    const error = 'Notification permission not granted. Current permission: ' + Notification.permission;
    console.error('❌', error);
    throw new Error(error);
  }

  try {
    const notification = new Notification('🎉 BotSmith Notifications Active!', {
      body: 'You\'ll now receive notifications from BotSmith. Click to visit the app.',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      tag: 'botsmith-test'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    console.log('✅ Test notification displayed successfully');
    return notification;
  } catch (error) {
    console.error('❌ Failed to show test notification:', error);
    throw error;
  }
}
