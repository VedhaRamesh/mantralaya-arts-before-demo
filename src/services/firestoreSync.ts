import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Product,
  Category,
  Order,
  UserProfile,
  AppNotification,
  ShopSettings,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

// Collections
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  FCM_DISPATCHES: 'fcm_dispatches',
  FCM_TOKENS: 'fcm_tokens',
};

// Cloud Sync Helpers
export async function syncOrderToCloud(order: Order) {
  try {
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function syncProductToCloud(product: Product) {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function syncUserToCloud(user: UserProfile) {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function syncNotificationToCloud(notif: AppNotification) {
  try {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
  }
}

export async function syncSettingsToCloud(settings: ShopSettings) {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'shop_config'), settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `settings/shop_config`);
  }
}
