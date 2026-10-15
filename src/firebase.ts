import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Export Authentication
export const auth = getAuth(app);

// Export Firebase app configuration
export { firebaseConfig };

// Safe messaging instance resolver (guards against non-service-worker or restricted iframe contexts)
let messagingInstance: any = null;
export async function getFirebaseMessaging() {
  if (messagingInstance) return messagingInstance;
  if (typeof window === 'undefined') return null;

  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (err) {
    console.warn('Firebase Cloud Messaging is not supported or restricted in this browser context:', err);
  }
  return null;
}

// Connection test utility
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // If the document does not exist, that's still a successful connection to the server
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firestore is running in offline mode:', error.message);
      return false;
    }
    return true;
  }
}
