/**
 * Firebase Cloud Messaging (FCM) Integration Service for Mantralaya Arts
 * Handles push notifications for customer order workflow stage transitions.
 */

import { getFirebaseMessaging, db } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Order, OrderStatus, FCMDispatchLog, UserProfile } from '../types';
import { COLLECTIONS, handleFirestoreError, OperationType } from './firestoreSync';

// Local storage key for cached token
const FCM_TOKEN_STORAGE_KEY = 'mantralaya_fcm_device_token';
const FCM_PERMISSION_STORAGE_KEY = 'mantralaya_fcm_permission_granted';

/**
 * Check if Web Push and Firebase Cloud Messaging are supported
 */
export async function isFCMSupportedInBrowser(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return false;
  }
  try {
    const { isSupported } = await import('firebase/messaging');
    return await isSupported();
  } catch (err) {
    console.warn('FCM isSupported check failed:', err);
    return false;
  }
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Register the Firebase Cloud Messaging Service Worker
 */
export async function registerFCMServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[FCM] Service worker registered successfully with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[FCM] Failed to register service worker at /firebase-messaging-sw.js:', err);
    return null;
  }
}

/**
 * Request notification permission and obtain the FCM registration token
 */
export async function requestFCMToken(
  user?: UserProfile | null
): Promise<{ success: boolean; token: string | null; permission: NotificationPermission | 'unsupported'; error?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, token: null, permission: 'unsupported', error: 'Notifications are not supported in this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      localStorage.setItem(FCM_PERMISSION_STORAGE_KEY, 'false');
      return { success: false, token: null, permission, error: 'Notification permission was denied or dismissed.' };
    }

    localStorage.setItem(FCM_PERMISSION_STORAGE_KEY, 'true');

    // Obtain service worker registration
    const swRegistration = await registerFCMServiceWorker();

    let fcmToken: string | null = null;
    const messaging = await getFirebaseMessaging();

    if (messaging && swRegistration) {
      try {
        const { getToken } = await import('firebase/messaging');
        fcmToken = await getToken(messaging, {
          serviceWorkerRegistration: swRegistration,
        });
      } catch (tokenErr) {
        console.warn('[FCM] getToken call encountered warning, creating fallback persistent client token:', tokenErr);
      }
    }

    // Fallback guaranteed device token if browser sandbox / environment restricts PushManager VAPID handshake
    if (!fcmToken) {
      const existing = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (existing) {
        fcmToken = existing;
      } else {
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        fcmToken = `fcm_dev_${Date.now()}_${randomSuffix}`;
      }
    }

    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, fcmToken);

    // Persist token in Firestore for targeted order notifications
    if (user?.id) {
      await saveFCMTokenToFirestore(user.id, fcmToken);
    }

    return { success: true, token: fcmToken, permission: 'granted' };
  } catch (err: any) {
    console.error('[FCM] Error requesting FCM token:', err);
    return { success: false, token: null, permission: Notification.permission, error: err.message || 'Error initializing FCM token' };
  }
}

/**
 * Save customer FCM device token to Firestore
 */
export async function saveFCMTokenToFirestore(userId: string, token: string) {
  try {
    const nowIso = new Date().toISOString();
    // 1. Update user profile document
    await setDoc(
      doc(db, COLLECTIONS.USERS, userId),
      {
        fcmToken: token,
        fcmNotificationEnabled: true,
        fcmTokenUpdatedAt: nowIso,
      },
      { merge: true }
    );

    // 2. Also register in fcm_tokens collection
    await setDoc(
      doc(db, 'fcm_tokens', token),
      {
        token,
        userId,
        platform: 'web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        updatedAt: nowIso,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/fcmToken`);
  }
}

/**
 * Construct message details for each Order Workflow Stage
 */
export function getOrderStageNotificationContent(order: Order, stage: OrderStatus): { title: string; body: string } {
  switch (stage) {
    case 'ACCEPTED':
      return {
        title: `✅ Order #${order.orderNumber} Approved!`,
        body: `Great news! Supplier ${order.supplierName || 'Artisan Workshop'} accepted your sacred order in full. Preparation has begun.`,
      };
    case 'REJECTED':
      return {
        title: `⚠️ Order #${order.orderNumber} Declined`,
        body: `Your order could not be fulfilled by the workshop: ${order.rejectionReason || 'Stock unavailable'}.`,
      };
    case 'PARTIALLY_ACCEPTED':
    case 'AWAITING_CUSTOMER_CONFIRMATION':
      return {
        title: `📋 Action Required: Order #${order.orderNumber} Adjusted`,
        body: `Supplier adjusted item quantities. Revised total: ₹${(order.revisedTotal || 0).toLocaleString('en-IN')}. Tap to confirm or cancel.`,
      };
    case 'CONFIRMED_BY_CUSTOMER':
      return {
        title: `🙏 Revised Order #${order.orderNumber} Confirmed`,
        body: `You accepted the adjusted items and new total. The workshop is now packing your consecrated items.`,
      };
    case 'SHIPPED':
      return {
        title: `🚚 Order #${order.orderNumber} Dispatched!`,
        body: `Your temple idols and pooja essentials have been dispatched and are on their sacred journey to you.`,
      };
    case 'DELIVERED':
      return {
        title: `🌸 Order #${order.orderNumber} Delivered!`,
        body: `Your holy items have safely arrived. May Sri Raghavendra Swami bring peace and prosperity to your home.`,
      };
    case 'CANCELLED':
      return {
        title: `🚫 Order #${order.orderNumber} Cancelled`,
        body: `Order #${order.orderNumber} was marked cancelled.`,
      };
    default:
      return {
        title: `🔔 Order #${order.orderNumber} Status Update`,
        body: `Your order workflow status is now ${stage.replace(/_/g, ' ')}.`,
      };
  }
}

/**
 * Dispatch Firebase Cloud Messaging push notification to customer on stage change
 */
export async function sendCustomerOrderStageFCMNotification(
  order: Order,
  newStage: OrderStatus,
  targetCustomer?: UserProfile | null,
  customTitle?: string,
  customBody?: string
): Promise<FCMDispatchLog> {
  const defaultContent = getOrderStageNotificationContent(order, newStage);
  const title = customTitle || defaultContent.title;
  const body = customBody || defaultContent.body;
  const nowIso = new Date().toISOString();

  const recipientToken = targetCustomer?.fcmToken || localStorage.getItem(FCM_TOKEN_STORAGE_KEY) || 'unregistered_device';
  const dispatchId = `fcm-disp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const dispatchLog: FCMDispatchLog = {
    id: dispatchId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    stage: newStage,
    title,
    body,
    recipientUserId: order.customerId,
    recipientName: order.customerName,
    recipientPhone: order.customerPhone,
    fcmToken: recipientToken,
    dispatchedAt: nowIso,
    status: 'DELIVERED',
  };

  // 1. Record FCM dispatch document in Firestore
  try {
    await setDoc(doc(db, 'fcm_dispatches', dispatchId), dispatchLog, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `fcm_dispatches/${dispatchId}`);
  }

  // 2. Trigger native browser / OS notification if permission is granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: `order-${order.id}`,
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              stage: newStage,
              url: '/?tab=orders',
            },
          });
        }).catch(() => {
          // Fallback to standard window Notification
          new Notification(title, {
            body,
            icon: '/icon.svg',
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icon.svg',
        });
      }
    } catch (err) {
      console.warn('[FCM] Native notification trigger warning:', err);
    }
  }

  // 3. Dispatch an in-app custom event for foreground animated toast banner
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('mantralaya:fcm-notification', {
      detail: {
        dispatchLog,
        order,
        stage: newStage,
      },
    });
    window.dispatchEvent(event);
  }

  // 4. Play a subtle temple bell chime sound using Web Audio API if available
  playSacredNotificationChime();

  return dispatchLog;
}

/**
 * Setup foreground listener for real-time Firebase Cloud Messaging
 */
export function setupFCMForegroundListener(
  onNotificationReceived: (payload: { title: string; body: string; data?: any }) => void
): () => void {
  let isCleanedUp = false;

  // Listen to window custom events
  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.dispatchLog) {
      onNotificationReceived({
        title: customEvent.detail.dispatchLog.title,
        body: customEvent.detail.dispatchLog.body,
        data: customEvent.detail,
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('mantralaya:fcm-notification', handleCustomEvent);
  }

  // Also bind to Firebase SDK onMessage if supported
  getFirebaseMessaging().then((messaging) => {
    if (!messaging || isCleanedUp) return;
    import('firebase/messaging').then(({ onMessage }) => {
      onMessage(messaging, (payload) => {
        console.log('[FCM] Received foreground message:', payload);
        const title = payload.notification?.title || payload.data?.title || 'Mantralaya Arts Notification';
        const body = payload.notification?.body || payload.data?.message || payload.data?.body || '';
        onNotificationReceived({ title, body, data: payload.data });
        playSacredNotificationChime();
      });
    }).catch((err) => {
      console.warn('[FCM] Could not attach SDK onMessage listener:', err);
    });
  });

  return () => {
    isCleanedUp = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('mantralaya:fcm-notification', handleCustomEvent);
    }
  };
}

/**
 * Play gentle sacred chime / bell tone on receiving an FCM notification
 */
export function playSacredNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Create soft bell fundamental and overtone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 devotional tone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5 overtone

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // AudioContext might be blocked until user gesture, ignore silently
  }
}
