import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Product,
  Category,
  CartItem,
  Order,
  UserProfile,
  AppNotification,
  OrderStatus,
  ShopSettings,
  FCMDispatchLog,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { db, testFirestoreConnection } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  syncOrderToCloud,
  syncProductToCloud,
  syncUserToCloud,
  syncNotificationToCloud,
  syncSettingsToCloud,
  handleFirestoreError,
  OperationType,
} from '../services/firestoreSync';
import {
  requestFCMToken,
  sendCustomerOrderStageFCMNotification,
  getNotificationPermissionStatus,
  setupFCMForegroundListener,
  getOrderStageNotificationContent,
} from '../services/fcmService';

interface AppContextType {
  // Cloud & connection state
  isCloudConnected: boolean;

  // Roles & Auth
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  addUserProfile: (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: UserProfile };
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => { success: boolean; error?: string };
  toggleUserStatus: (id: string) => void;
  resetUserCredential: (identifier: string, newCredentials: { pin?: string; password?: string }) => { success: boolean; error?: string; user?: UserProfile };

  // Customer Authentication (Mandatory)
  customerUser: UserProfile | null;
  isCustomerLoggedIn: boolean;
  customerLogin: (identifier: string, credential: string, method?: 'PIN' | 'PASSWORD') => { success: boolean; error?: string; user?: UserProfile };
  customerLogout: () => void;

  // Catalog & Inventory
  categories: Category[];
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => { success: boolean; error?: string; product?: Product };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  addCategory: (categoryData: Omit<Category, 'id'>) => { success: boolean; error?: string };
  updateCategory: (id: string, updates: Partial<Category>) => { success: boolean; error?: string };
  toggleCategoryStatus: (id: string) => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; error?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Saved for Later / Wishlist
  savedProductIds: string[];
  toggleSavedProduct: (productId: string) => void;
  isProductSaved: (productId: string) => boolean;
  clearSavedProducts: () => void;

  // Orders
  orders: Order[];
  submitOrder: (customerData: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    notes?: string;
  }) => { success: boolean; error?: string; order?: Order };
  supplierAcceptOrder: (orderId: string, supplierNotes?: string) => { success: boolean; error?: string };
  supplierRejectOrder: (orderId: string, reason: string) => { success: boolean; error?: string };
  supplierPartiallyAcceptOrder: (
    orderId: string,
    itemApprovals: { productId: string; approvedQuantity: number }[],
    notes: string
  ) => { success: boolean; error?: string };
  customerConfirmRevisedOrder: (orderId: string) => { success: boolean; error?: string };
  customerCancelOrder: (orderId: string, reason?: string) => { success: boolean; error?: string };

  supplierUpdateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => { success: boolean; error?: string };

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadCount: number;

  // Firebase Cloud Messaging (FCM)
  fcmPermissionStatus: NotificationPermission | 'unsupported';
  fcmDeviceToken: string | null;
  fcmDispatchLogs: FCMDispatchLog[];
  enableFCMNotifications: () => Promise<{ success: boolean; token?: string; error?: string }>;
  sendTestFCMNotification: (targetUserId?: string) => Promise<{ success: boolean; log?: FCMDispatchLog; error?: string }>;

  // Shop Settings
  shopSettings: ShopSettings;
  updateShopSettings: (settings: ShopSettings) => void;

  // Persistence utilities
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const INITIAL_SETTINGS: ShopSettings = {
  storeName: 'Mantralaya Arts',
  phone: '+91 98450 12345',
  whatsappNumber: '919845012345',
  email: 'contact@mantralayaarts.com',
  address: 'Temple Ring Road, Opposite Moola Brindavana Complex, Mantralayam, Andhra Pradesh - 518345',
  upiId: 'mantralayaarts@upi',
  dispatchNote: 'All sacred items packed in consecrated boxes with prasadam and care.',
  staffAdminPin: '1008',
  staffAdminPassword: 'Admin@1008',
  staffSupplierPin: '1234',
};

const STORAGE_KEYS = {
  USERS: 'mantralaya_users_v2',
  PRODUCTS: 'mantralaya_products_v2',
  CATEGORIES: 'mantralaya_categories_v2',
  ORDERS: 'mantralaya_orders_v2',
  NOTIFICATIONS: 'mantralaya_notifications_v2',
  CURRENT_USER_ID: 'mantralaya_current_user_id_v2',
  CURRENT_ROLE: 'mantralaya_current_role_v2',
  CART: 'mantralaya_cart_v2',
  SETTINGS: 'mantralaya_settings_v2',
  CUSTOMER_USER: 'mantralaya_customer_user_v2',
  FCM_LOGS: 'mantralaya_fcm_logs_v2',
  SAVED_PRODUCTS: 'mantralaya_saved_products_v2',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return fallback;
  }
}

function saveStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // 1. Users state
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const loaded = loadStored<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure Ravi Kumar is categorized as CUSTOMER and only 1 admin exists
    return loaded.map((u) => {
      if (u.fullName === 'Ravi Kumar' && u.role !== 'CUSTOMER') {
        return {
          ...u,
          role: 'CUSTOMER' as Role,
          notes: 'Devotee customer & brass artisan patron',
          password: u.password || 'Ravi@123',
        };
      }
      return u;
    });
  });

  const [currentRole, setCurrentRoleState] = useState<Role>(() =>
    loadStored(STORAGE_KEYS.CURRENT_ROLE, 'CUSTOMER')
  );

  const [customerUser, setCustomerUserState] = useState<UserProfile | null>(() => {
    return loadStored<UserProfile | null>(STORAGE_KEYS.CUSTOMER_USER, null);
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const storedCust = loadStored<UserProfile | null>(STORAGE_KEYS.CUSTOMER_USER, null);
    if (storedCust?.id) return storedCust.id;
    return loadStored<string>(STORAGE_KEYS.CURRENT_USER_ID, 'USR-CUST-1');
  });

  // Verify that the logged-in customer is present in allUsers and is ACTIVE
  const activeCustomerUser = customerUser
    ? allUsers.find((u) => u.id === customerUser.id && u.role === 'CUSTOMER' && u.status === 'ACTIVE') || null
    : null;

  const isCustomerLoggedIn = Boolean(activeCustomerUser);

  const currentUser =
    (currentRole === 'CUSTOMER' && activeCustomerUser ? activeCustomerUser : null) ||
    allUsers.find((u) => u.id === currentUserId && u.role === currentRole) ||
    allUsers.find((u) => u.role === currentRole) ||
    allUsers.find((u) => u.id === currentUserId) ||
    allUsers[0];

  // 2. Categories & Products
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    loadStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );

  // 3. Cart
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStored(STORAGE_KEYS.CART, [])
  );

  // 3b. Saved for Later Products (Wishlist)
  const [savedProductIds, setSavedProductIds] = useState<string[]>(() => {
    const stored = loadStored<string[]>(STORAGE_KEYS.SAVED_PRODUCTS, []);
    const storedCust = loadStored<UserProfile | null>(STORAGE_KEYS.CUSTOMER_USER, null);
    if (storedCust?.savedProductIds && storedCust.savedProductIds.length > 0) {
      return Array.from(new Set([...stored, ...storedCust.savedProductIds]));
    }
    return stored;
  });

  // 4. Orders
  const [orders, setOrders] = useState<Order[]>(() =>
    loadStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );

  // 5. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // 6. Shop Settings
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() =>
    loadStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  const updateShopSettings = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
    saveStored(STORAGE_KEYS.SETTINGS, newSettings);
    syncSettingsToCloud(newSettings);
  };

  // 7. Firebase Cloud Messaging (FCM) State
  const [fcmPermissionStatus, setFcmPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermissionStatus()
  );
  const [fcmDeviceToken, setFcmDeviceToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('mantralaya_fcm_device_token');
  });
  const [fcmDispatchLogs, setFcmDispatchLogs] = useState<FCMDispatchLog[]>(() =>
    loadStored(STORAGE_KEYS.FCM_LOGS, [])
  );

  // Initial Firestore Bootstrapping & Real-time Listeners
  useEffect(() => {
    let unsubscribeOrders = () => {};
    let unsubscribeProducts = () => {};
    let unsubscribeUsers = () => {};
    let unsubscribeNotifications = () => {};
    let unsubscribeSettings = () => {};
    let unsubscribeFCM = () => {};
    let cleanupForegroundFCM = () => {};

    const setupFirestore = async () => {
      try {
        const connected = await testFirestoreConnection();
        setIsCloudConnected(connected);

        if (!connected) return;

        // 1. Check if orders collection is initialized
        const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
        if (ordersSnapshot.empty) {
          // Seed initial orders to cloud
          for (const ord of INITIAL_ORDERS) {
            await syncOrderToCloud(ord);
          }
        }

        // 2. Check if products collection is initialized
        const productsSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
        if (productsSnapshot.empty) {
          for (const prod of INITIAL_PRODUCTS) {
            await syncProductToCloud(prod);
          }
        }

        // 3. Check users
        const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        if (usersSnapshot.empty) {
          for (const u of INITIAL_USERS) {
            await syncUserToCloud(u);
          }
        }

        // Real-time listener: Orders (Multi-device order sync!)
        unsubscribeOrders = onSnapshot(
          collection(db, COLLECTIONS.ORDERS),
          (snapshot) => {
            if (!snapshot.empty) {
              const cloudOrders: Order[] = [];
              snapshot.forEach((docSnap) => {
                cloudOrders.push(docSnap.data() as Order);
              });
              // Sort by createdAt descending
              cloudOrders.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setOrders(cloudOrders);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'orders');
          }
        );

        // Real-time listener: Products
        unsubscribeProducts = onSnapshot(
          collection(db, COLLECTIONS.PRODUCTS),
          (snapshot) => {
            if (!snapshot.empty) {
              const cloudProducts: Product[] = [];
              snapshot.forEach((docSnap) => {
                cloudProducts.push(docSnap.data() as Product);
              });
              setProducts(cloudProducts);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'products');
          }
        );

        // Real-time listener: Users
        unsubscribeUsers = onSnapshot(
          collection(db, COLLECTIONS.USERS),
          (snapshot) => {
            if (!snapshot.empty) {
              const cloudUsers: UserProfile[] = [];
              snapshot.forEach((docSnap) => {
                cloudUsers.push(docSnap.data() as UserProfile);
              });
              setAllUsers(cloudUsers);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'users');
          }
        );

        // Real-time listener: Notifications
        unsubscribeNotifications = onSnapshot(
          collection(db, COLLECTIONS.NOTIFICATIONS),
          (snapshot) => {
            if (!snapshot.empty) {
              const cloudNotifs: AppNotification[] = [];
              snapshot.forEach((docSnap) => {
                cloudNotifs.push(docSnap.data() as AppNotification);
              });
              cloudNotifs.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              setNotifications(cloudNotifs);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'notifications');
          }
        );

        // Real-time listener: Shop Settings (for synced WhatsApp number, UPI ID, etc.)
        const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, 'shop_config');
        try {
          const settingsSnap = await getDoc(settingsDocRef);
          if (!settingsSnap.exists()) {
            await syncSettingsToCloud(shopSettings);
          } else {
            const cloudSettings = settingsSnap.data() as ShopSettings;
            if (cloudSettings && cloudSettings.whatsappNumber) {
              setShopSettings(cloudSettings);
              saveStored(STORAGE_KEYS.SETTINGS, cloudSettings);
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'settings/shop_config');
        }

        unsubscribeSettings = onSnapshot(
          settingsDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const updated = docSnap.data() as ShopSettings;
              if (updated && updated.whatsappNumber) {
                setShopSettings(updated);
                saveStored(STORAGE_KEYS.SETTINGS, updated);
              }
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, 'settings/shop_config');
          }
        );

        // Real-time listener: Firebase Cloud Messaging Push Dispatches
        unsubscribeFCM = onSnapshot(
          collection(db, COLLECTIONS.FCM_DISPATCHES),
          (snapshot) => {
            if (!snapshot.empty) {
              const logs: FCMDispatchLog[] = [];
              snapshot.forEach((docSnap) => {
                logs.push(docSnap.data() as FCMDispatchLog);
              });
              logs.sort(
                (a, b) => new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime()
              );
              setFcmDispatchLogs(logs);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'fcm_dispatches');
          }
        );

        // Setup Foreground FCM message handler
        cleanupForegroundFCM = setupFCMForegroundListener((msg) => {
          console.log('[FCM Foreground received in AppContext]:', msg);
        });
      } catch (e) {
        console.warn('Firestore initialization notice:', e);
      }
    };

    setupFirestore();

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
      unsubscribeNotifications();
      unsubscribeSettings();
      unsubscribeFCM();
      cleanupForegroundFCM();
    };
  }, []);

  // Persistence local mirror sync
  useEffect(() => {
    saveStored(STORAGE_KEYS.USERS, allUsers);
  }, [allUsers]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.FCM_LOGS, fcmDispatchLogs);
  }, [fcmDispatchLogs]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.CURRENT_ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (activeCustomerUser) {
      saveStored(STORAGE_KEYS.CUSTOMER_USER, activeCustomerUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
    }
  }, [activeCustomerUser]);

  const setCurrentRole = (newRole: Role) => {
    setCurrentRoleState(newRole);
    saveStored(STORAGE_KEYS.CURRENT_ROLE, newRole);
    const targetUser =
      allUsers.find((u) => u.role === newRole && u.status === 'ACTIVE') ||
      (newRole === 'SUPPLIER' ? allUsers.find((u) => u.role === 'ADMIN' && u.status === 'ACTIVE') : undefined);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const switchUser = (userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      setCurrentRoleState(targetUser.role);
    }
  };

  // Mandatory Customer Login (supports PIN & Password)
  const customerLogin = (
    identifier: string,
    credential: string,
    method?: 'PIN' | 'PASSWORD'
  ): { success: boolean; error?: string; user?: UserProfile } => {
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const cleanCred = credential.trim();

    if (!cleanIdent) {
      return { success: false, error: 'Please enter your registered mobile number, email, or customer ID.' };
    }
    if (!cleanCred) {
      return {
        success: false,
        error: method === 'PASSWORD' ? 'Please enter your account password.' : 'Please enter your access PIN.',
      };
    }

    const customer = allUsers.find((u) => {
      if (u.role !== 'CUSTOMER') return false;
      if (u.id.toLowerCase() === cleanIdent) return true;
      if (u.email.toLowerCase() === cleanIdent) return true;
      const userDigits = u.phone.replace(/\D/g, '');
      if (cleanDigits && (userDigits === cleanDigits || userDigits.endsWith(cleanDigits) || cleanDigits.endsWith(userDigits))) {
        return true;
      }
      return false;
    });

    if (!customer) {
      return {
        success: false,
        error: 'No customer account found with these credentials. Customer accounts are created exclusively by the administrator.',
      };
    }

    if (customer.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your customer account is currently inactive. Please contact the administrator.',
      };
    }

    const expectedPin = customer.accessPin || '1234';
    const expectedPassword = customer.password || 'Lakshmi@123';

    if (method === 'PASSWORD') {
      if (cleanCred !== expectedPassword && cleanCred !== expectedPin) {
        return {
          success: false,
          error: 'Incorrect Password. Please check your password or use Forgot Password to reset it.',
        };
      }
    } else if (method === 'PIN') {
      if (cleanCred !== expectedPin && cleanCred !== expectedPassword) {
        return {
          success: false,
          error: 'Incorrect Customer PIN. Please check your 4-digit PIN or use Forgot PIN to reset it.',
        };
      }
    } else {
      // General verification
      if (cleanCred !== expectedPin && cleanCred !== expectedPassword) {
        return {
          success: false,
          error: 'Invalid credentials. Please verify your PIN or password.',
        };
      }
    }

    setCustomerUserState(customer);
    setCurrentUserId(customer.id);
    setCurrentRoleState('CUSTOMER');

    if (customer.savedProductIds && customer.savedProductIds.length > 0) {
      setSavedProductIds((prev) => {
        const merged = Array.from(new Set([...prev, ...customer.savedProductIds!]));
        saveStored(STORAGE_KEYS.SAVED_PRODUCTS, merged);
        return merged;
      });
    }

    return { success: true, user: customer };
  };

  const customerLogout = () => {
    setCustomerUserState(null);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
  };

  // Reset User Credential (OTP / Email flow for Admin, Customer, Supplier)
  const resetUserCredential = (
    identifier: string,
    newCredentials: { pin?: string; password?: string }
  ): { success: boolean; error?: string; user?: UserProfile } => {
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    const targetUser = allUsers.find((u) => {
      if (u.id.toLowerCase() === cleanIdent) return true;
      if (u.email.toLowerCase() === cleanIdent) return true;
      const userDigits = u.phone.replace(/\D/g, '');
      if (cleanDigits && (userDigits === cleanDigits || userDigits.endsWith(cleanDigits) || cleanDigits.endsWith(userDigits))) {
        return true;
      }
      return false;
    });

    if (!targetUser) {
      return { success: false, error: 'No user account found matching this mobile number, email, or user ID.' };
    }

    const updates: Partial<UserProfile> = {};
    if (newCredentials.pin && newCredentials.pin.trim()) {
      updates.accessPin = newCredentials.pin.trim();
    }
    if (newCredentials.password && newCredentials.password.trim()) {
      updates.password = newCredentials.password.trim();
    }

    const updateRes = updateUserProfile(targetUser.id, updates);
    if (!updateRes.success) {
      return { success: false, error: updateRes.error };
    }

    // If target was admin, also sync store settings
    if (targetUser.role === 'ADMIN') {
      const updatedSettings: ShopSettings = {
        ...shopSettings,
        ...(newCredentials.pin ? { staffAdminPin: newCredentials.pin.trim() } : {}),
        ...(newCredentials.password ? { staffAdminPassword: newCredentials.password.trim() } : {}),
      };
      setShopSettings(updatedSettings);
      syncSettingsToCloud(updatedSettings);
    }

    const refreshedUser = { ...targetUser, ...updates };
    return { success: true, user: refreshedUser };
  };

  // Add User Profile
  const addUserProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const cleanName = profileData.fullName?.trim();
    const cleanPhone = profileData.phone?.replace(/[\s-]/g, '');
    const cleanEmail = profileData.email?.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Full name is required (at least 2 characters).' };
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, error: 'Valid mobile number is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }

    const existingWithEmail = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existingWithEmail) {
      return {
        success: false,
        error: `A user profile with email "${cleanEmail}" already exists (${existingWithEmail.fullName} - ${existingWithEmail.role}).`,
      };
    }

    const existingWithPhone = allUsers.find(
      (u) => u.phone.replace(/[\s-]/g, '') === cleanPhone
    );
    if (existingWithPhone) {
      return {
        success: false,
        error: `A user profile with mobile "${cleanPhone}" already exists (${existingWithPhone.fullName}).`,
      };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const rolePrefix = profileData.role === 'SUPPLIER' ? 'SUPP' : profileData.role === 'ADMIN' ? 'ADMIN' : 'CUST';
    const newId = `USR-${rolePrefix}-${randomSuffix}`;

    const newProfile: UserProfile = {
      id: newId,
      fullName: cleanName,
      email: cleanEmail,
      phone: profileData.phone.trim(),
      role: profileData.role,
      accessPin: profileData.accessPin?.trim() || (profileData.role === 'CUSTOMER' ? '1234' : '1008'),
      password: profileData.password?.trim() || (profileData.role === 'ADMIN' ? 'Admin@1008' : 'Devotee@123'),
      deliveryAddress: profileData.deliveryAddress?.trim() || '',
      notes: profileData.notes?.trim() || '',
      status: profileData.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [newProfile, ...prev]);
    syncUserToCloud(newProfile);

    return { success: true, user: newProfile };
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    const userIndex = allUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return { success: false, error: 'User profile not found.' };
    }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const duplicate = allUsers.find(
        (u) => u.id !== id && u.email.toLowerCase() === cleanEmail
      );
      if (duplicate) {
        return { success: false, error: `Email "${cleanEmail}" is already registered by another profile.` };
      }
    }

    if (updates.phone) {
      const cleanPhone = updates.phone.replace(/[\s-]/g, '');
      const duplicate = allUsers.find(
        (u) => u.id !== id && u.phone.replace(/[\s-]/g, '') === cleanPhone
      );
      if (duplicate) {
        return { success: false, error: `Mobile number "${updates.phone}" is already registered by another profile.` };
      }
    }

    let updatedUserObj: UserProfile | null = null;

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated: UserProfile = {
            ...u,
            ...updates,
            fullName: updates.fullName !== undefined ? updates.fullName.trim() : u.fullName,
            email: updates.email !== undefined ? updates.email.trim().toLowerCase() : u.email,
            phone: updates.phone !== undefined ? updates.phone.trim() : u.phone,
            accessPin: updates.accessPin !== undefined ? updates.accessPin.trim() : u.accessPin,
            password: updates.password !== undefined ? updates.password.trim() : u.password,
          };
          updatedUserObj = updated;
          return updated;
        }
        return u;
      })
    );

    if (updatedUserObj) {
      syncUserToCloud(updatedUserObj);
      if (customerUser && customerUser.id === id) {
        setCustomerUserState(updatedUserObj);
      }
    }

    return { success: true };
  };

  const toggleUserStatus = (id: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated: UserProfile = { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
          syncUserToCloud(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // Products
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!productData.name?.trim()) {
      return { success: false, error: 'Product name is required.' };
    }
    if (productData.price <= 0) {
      return { success: false, error: 'Price must be greater than zero.' };
    }
    if (productData.stockQuantity < 0) {
      return { success: false, error: 'Stock quantity cannot be negative.' };
    }

    const uniqueId = `prod-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const newProduct: Product = {
      ...productData,
      id: uniqueId,
      name: productData.name.trim(),
      description: productData.description.trim(),
      status: productData.stockQuantity === 0 ? 'OUT_OF_STOCK' : productData.status,
      imageUrl: productData.imageUrl?.trim() || 'https://images.unsplash.com/photo-1609137144822-2613b5220c4a?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    syncProductToCloud(newProduct);
    return { success: true, product: newProduct };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (updates.price !== undefined && updates.price <= 0) {
      return { success: false, error: 'Price must be greater than zero.' };
    }
    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) {
      return { success: false, error: 'Stock quantity cannot be negative.' };
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedStock = updates.stockQuantity !== undefined ? updates.stockQuantity : p.stockQuantity;
          let updatedStatus = updates.status !== undefined ? updates.status : p.status;
          if (updatedStock === 0) {
            updatedStatus = 'OUT_OF_STOCK';
          }
          const updatedProduct: Product = {
            ...p,
            ...updates,
            status: updatedStatus,
          };
          syncProductToCloud(updatedProduct);
          return updatedProduct;
        }
        return p;
      })
    );

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    if (!categoryData.name?.trim()) {
      return { success: false, error: 'Category name is required.' };
    }
    const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${slug}-${Date.now().toString(36)}`,
      name: categoryData.name.trim(),
      slug,
      isActive: categoryData.isActive ?? true,
    };

    setCategories((prev) => [...prev, newCategory]);
    return { success: true };
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    return { success: true };
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Cart
  const addToCart = (product: Product, quantity = 1) => {
    if (product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0) {
      return { success: false, error: 'This item is currently out of stock.' };
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedQty = currentQtyInCart + quantity;

    if (requestedQty > product.stockQuantity) {
      return {
        success: false,
        error: `Only ${product.stockQuantity} units available in stock.`,
      };
    }

    if (existingIndex > -1) {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: requestedQty } : item
        )
      );
    } else {
      setCart((prev) => [...prev, { product, quantity }]);
    }

    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const targetProduct = products.find((p) => p.id === productId);
    if (targetProduct && quantity > targetProduct.stockQuantity) {
      return {
        success: false,
        error: `Cannot exceed available stock of ${targetProduct.stockQuantity}.`,
      };
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Saved for Later / Wishlist Actions
  const toggleSavedProduct = (productId: string) => {
    setSavedProductIds((prev) => {
      const isAlreadySaved = prev.includes(productId);
      const next = isAlreadySaved
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      saveStored(STORAGE_KEYS.SAVED_PRODUCTS, next);

      // If customer is logged in, sync with their profile
      if (customerUser) {
        const updatedCust: UserProfile = {
          ...customerUser,
          savedProductIds: next,
        };
        setCustomerUserState(updatedCust);
        saveStored(STORAGE_KEYS.CUSTOMER_USER, updatedCust);
        setAllUsers((users) =>
          users.map((u) => (u.id === customerUser.id ? updatedCust : u))
        );
        syncUserToCloud(updatedCust);
      }

      return next;
    });
  };

  const isProductSaved = (productId: string): boolean => {
    return savedProductIds.includes(productId);
  };

  const clearSavedProducts = () => {
    setSavedProductIds([]);
    saveStored(STORAGE_KEYS.SAVED_PRODUCTS, []);
    if (customerUser) {
      const updatedCust: UserProfile = {
        ...customerUser,
        savedProductIds: [],
      };
      setCustomerUserState(updatedCust);
      saveStored(STORAGE_KEYS.CUSTOMER_USER, updatedCust);
      syncUserToCloud(updatedCust);
    }
  };

  // Submit Order (Real-time Cloud Sync to Firestore!)
  const submitOrder = (customerData: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    notes?: string;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    if (!customerData.fullName?.trim()) {
      return { success: false, error: 'Customer full name is required.' };
    }
    if (!customerData.phone?.trim()) {
      return { success: false, error: 'Mobile number is required for delivery coordination.' };
    }
    if (!customerData.address?.trim()) {
      return { success: false, error: 'Delivery address is required.' };
    }

    for (const item of cart) {
      const currentProd = products.find((p) => p.id === item.product.id);
      if (!currentProd || currentProd.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.name}". Only ${currentProd?.stockQuantity ?? 0} left.`,
        };
      }
    }

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.product.price,
      requestedQuantity: item.quantity,
      approvedQuantity: item.quantity,
      itemTotal: item.product.price * item.quantity,
      imageUrl: item.product.imageUrl,
      isAvailable: true,
    }));

    const total = orderItems.reduce((sum, i) => sum + i.itemTotal, 0);
    const nowIso = new Date().toISOString();
    const dateNum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MA-${randNum}`;
    const orderId = `ORD-${dateNum}-${randNum}`;

    const primarySupplier = allUsers.find((u) => u.role === 'SUPPLIER' && u.status === 'ACTIVE') || allUsers.find((u) => u.role === 'SUPPLIER');

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: currentUser.id,
      customerName: customerData.fullName.trim(),
      customerPhone: customerData.phone.trim(),
      customerEmail: customerData.email?.trim() || currentUser.email,
      deliveryAddress: customerData.address.trim(),
      customerNotes: customerData.notes?.trim() || '',
      items: orderItems,
      originalTotal: total,
      revisedTotal: total,
      currentStatus: 'PENDING_SUPPLIER_REVIEW',
      supplierId: primarySupplier?.id,
      supplierName: primarySupplier?.fullName,
      statusHistory: [
        {
          status: 'PENDING_SUPPLIER_REVIEW',
          timestamp: nowIso,
          actorRole: 'CUSTOMER',
          actorName: customerData.fullName.trim(),
          notes: 'Order submitted by customer and queued for supplier verification.',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Sync to Firestore Cloud immediately
    syncOrderToCloud(newOrder);

    // Notifications
    const supplierNotification: AppNotification = {
      id: `notif-${Date.now()}-supp`,
      recipientRole: 'SUPPLIER',
      recipientUserId: primarySupplier?.id,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      title: 'New Order Received',
      message: `Order #${newOrder.orderNumber} placed by ${customerData.fullName} for ₹${total.toLocaleString('en-IN')}. Awaiting your review.`,
      type: 'ORDER_SUBMITTED',
      isRead: false,
      timestamp: nowIso,
    };

    const customerNotification: AppNotification = {
      id: `notif-${Date.now()}-cust`,
      recipientRole: 'CUSTOMER',
      recipientUserId: currentUser.id,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      title: 'Order Submitted Successfully',
      message: `Your order #${newOrder.orderNumber} has been received. Our artisan supplier is reviewing availability.`,
      type: 'ORDER_SUBMITTED',
      isRead: false,
      timestamp: nowIso,
    };

    setNotifications((prev) => [supplierNotification, customerNotification, ...prev]);
    syncNotificationToCloud(supplierNotification);
    syncNotificationToCloud(customerNotification);

    // Dispatch FCM push notification to customer device
    sendCustomerOrderStageFCMNotification(newOrder, 'PENDING_SUPPLIER_REVIEW', currentUser);

    return { success: true, order: newOrder };
  };

  // Supplier Actions with Real-time Cloud Sync
  const supplierAcceptOrder = (orderId: string, supplierNotes?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();

    // Deduct stock safely
    setProducts((prev) =>
      prev.map((prod) => {
        const orderItem = targetOrder.items.find((i) => i.productId === prod.id);
        if (orderItem) {
          const newQty = Math.max(0, prod.stockQuantity - orderItem.requestedQuantity);
          const updated = {
            ...prod,
            stockQuantity: newQty,
            status: (newQty === 0 ? 'OUT_OF_STOCK' : prod.status) as any,
          };
          syncProductToCloud(updated);
          return updated;
        }
        return prod;
      })
    );

    const updatedOrder: Order = {
      ...targetOrder,
      currentStatus: 'ACCEPTED',
      supplierDecisionNotes: supplierNotes || 'All items approved and reserved in inventory.',
      decisionTimestamp: nowIso,
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status: 'ACCEPTED',
          timestamp: nowIso,
          actorRole: 'SUPPLIER',
          actorName: currentUser.fullName,
          notes: supplierNotes || 'Entire order approved by supplier.',
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    const notif: AppNotification = {
      id: `notif-${Date.now()}-acc`,
      recipientRole: 'CUSTOMER',
      recipientUserId: targetOrder.customerId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: 'Order Confirmed by Supplier!',
      message: `Great news! Supplier ${currentUser.fullName} accepted your order #${targetOrder.orderNumber} in full.`,
      type: 'ORDER_ACCEPTED',
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    // Dispatch Firebase Cloud Messaging (FCM) push notification to customer
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, 'ACCEPTED', targetCustomer);

    return { success: true };
  };

  const supplierRejectOrder = (orderId: string, reason: string) => {
    if (!reason?.trim()) {
      return { success: false, error: 'Please provide a reason for rejecting the order.' };
    }

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();

    const updatedOrder: Order = {
      ...targetOrder,
      currentStatus: 'REJECTED',
      rejectionReason: reason.trim(),
      decisionTimestamp: nowIso,
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status: 'REJECTED',
          timestamp: nowIso,
          actorRole: 'SUPPLIER',
          actorName: currentUser.fullName,
          notes: `Rejected: ${reason.trim()}`,
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    const notif: AppNotification = {
      id: `notif-${Date.now()}-rej`,
      recipientRole: 'CUSTOMER',
      recipientUserId: targetOrder.customerId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: 'Order Declined by Supplier',
      message: `Your order #${targetOrder.orderNumber} could not be fulfilled. Reason: ${reason.trim()}`,
      type: 'ORDER_REJECTED',
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    // Dispatch Firebase Cloud Messaging (FCM) push notification to customer
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, 'REJECTED', targetCustomer);

    return { success: true };
  };

  const supplierPartiallyAcceptOrder = (
    orderId: string,
    itemApprovals: { productId: string; approvedQuantity: number }[],
    notes: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();

    const updatedItems = targetOrder.items.map((item) => {
      const match = itemApprovals.find((a) => a.productId === item.productId);
      const approvedQty = match !== undefined ? Math.max(0, match.approvedQuantity) : item.approvedQuantity;
      return {
        ...item,
        approvedQuantity: approvedQty,
        itemTotal: approvedQty * item.unitPrice,
        isAvailable: approvedQty > 0,
      };
    });

    const revisedTotal = updatedItems.reduce((sum, i) => sum + i.itemTotal, 0);

    const updatedOrder: Order = {
      ...targetOrder,
      items: updatedItems,
      revisedTotal,
      currentStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
      supplierDecisionNotes: notes?.trim() || 'Supplier partially approved items based on current workshop inventory.',
      decisionTimestamp: nowIso,
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status: 'PARTIALLY_ACCEPTED',
          timestamp: nowIso,
          actorRole: 'SUPPLIER',
          actorName: currentUser.fullName,
          notes: `Supplier adjusted item quantities. Revised total: ₹${revisedTotal.toLocaleString('en-IN')}. ${notes?.trim() || ''}`,
        },
        {
          status: 'AWAITING_CUSTOMER_CONFIRMATION',
          timestamp: nowIso,
          actorRole: 'SUPPLIER',
          actorName: currentUser.fullName,
          notes: 'Awaiting customer review and confirmation of revised order.',
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    const notif: AppNotification = {
      id: `notif-${Date.now()}-part`,
      recipientRole: 'CUSTOMER',
      recipientUserId: targetOrder.customerId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: 'Action Required: Order Adjusted by Supplier',
      message: `Order #${targetOrder.orderNumber} was partially approved. Revised total is ₹${revisedTotal.toLocaleString('en-IN')}. Please confirm or cancel.`,
      type: 'PARTIALLY_ACCEPTED',
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    // Dispatch Firebase Cloud Messaging (FCM) push notification to customer
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, 'AWAITING_CUSTOMER_CONFIRMATION', targetCustomer);

    return { success: true };
  };

  const customerConfirmRevisedOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();

    setProducts((prev) =>
      prev.map((prod) => {
        const orderItem = targetOrder.items.find((i) => i.productId === prod.id);
        if (orderItem && orderItem.approvedQuantity > 0) {
          const newQty = Math.max(0, prod.stockQuantity - orderItem.approvedQuantity);
          const updated = {
            ...prod,
            stockQuantity: newQty,
            status: (newQty === 0 ? 'OUT_OF_STOCK' : prod.status) as any,
          };
          syncProductToCloud(updated);
          return updated;
        }
        return prod;
      })
    );

    const updatedOrder: Order = {
      ...targetOrder,
      currentStatus: 'CONFIRMED_BY_CUSTOMER',
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status: 'CONFIRMED_BY_CUSTOMER',
          timestamp: nowIso,
          actorRole: 'CUSTOMER',
          actorName: currentUser.fullName,
          notes: 'Customer accepted the revised order quantities and new total.',
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    const notif: AppNotification = {
      id: `notif-${Date.now()}-revconf`,
      recipientRole: 'SUPPLIER',
      recipientUserId: targetOrder.supplierId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: 'Revised Order Confirmed!',
      message: `Customer ${targetOrder.customerName} confirmed revised order #${targetOrder.orderNumber} (₹${targetOrder.revisedTotal.toLocaleString('en-IN')}).`,
      type: 'REVISED_CONFIRMED',
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    // Dispatch FCM push to notify customer confirmation
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, 'CONFIRMED_BY_CUSTOMER', targetCustomer);

    return { success: true };
  };

  const customerCancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();

    const updatedOrder: Order = {
      ...targetOrder,
      currentStatus: 'CANCELLED',
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status: 'CANCELLED',
          timestamp: nowIso,
          actorRole: 'CUSTOMER',
          actorName: currentUser.fullName,
          notes: reason || 'Order cancelled by customer.',
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    const notif: AppNotification = {
      id: `notif-${Date.now()}-canc`,
      recipientRole: 'SUPPLIER',
      recipientUserId: targetOrder.supplierId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: 'Order Cancelled by Customer',
      message: `Customer cancelled order #${targetOrder.orderNumber}.`,
      type: 'ORDER_CANCELLED',
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    // Dispatch FCM notification
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, 'CANCELLED', targetCustomer);

    return { success: true };
  };

  // Supplier / Admin general status update (e.g. SHIPPED, DELIVERED) with FCM notification
  const supplierUpdateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const nowIso = new Date().toISOString();
    const updatedOrder: Order = {
      ...targetOrder,
      currentStatus: status,
      updatedAt: nowIso,
      statusHistory: [
        ...targetOrder.statusHistory,
        {
          status,
          timestamp: nowIso,
          actorRole: currentRole,
          actorName: currentUser.fullName,
          notes: notes || `Order stage transitioned to ${status.replace(/_/g, ' ')}.`,
        },
      ],
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    syncOrderToCloud(updatedOrder);

    // Target customer lookup for FCM dispatch
    const targetCustomer = allUsers.find((u) => u.id === targetOrder.customerId);
    sendCustomerOrderStageFCMNotification(updatedOrder, status, targetCustomer);

    const stageContent = getOrderStageNotificationContent(updatedOrder, status);
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${status.toLowerCase()}`,
      recipientRole: 'CUSTOMER',
      recipientUserId: targetOrder.customerId,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      title: stageContent.title,
      message: stageContent.body,
      type: (status === 'SHIPPED' ? 'ORDER_SHIPPED' : status === 'DELIVERED' ? 'ORDER_DELIVERED' : 'FCM_PUSH') as any,
      isRead: false,
      timestamp: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncNotificationToCloud(notif);

    return { success: true };
  };

  // FCM Enablement and Device Token Registration
  const enableFCMNotifications = async () => {
    try {
      const res = await requestFCMToken(currentUser);
      if (res.success && res.token) {
        setFcmDeviceToken(res.token);
        setFcmPermissionStatus('granted');
        if (currentUser?.id) {
          updateUserProfile(currentUser.id, {
            fcmToken: res.token,
            fcmNotificationEnabled: true,
            fcmTokenUpdatedAt: new Date().toISOString(),
          });
        }
        return { success: true, token: res.token };
      }
      setFcmPermissionStatus(res.permission);
      return { success: false, error: res.error || 'Permission not granted' };
    } catch (e: any) {
      return { success: false, error: e.message || 'FCM activation failed' };
    }
  };

  // Test FCM Push Notification to Customer
  const sendTestFCMNotification = async (targetUserId?: string) => {
    const cust = targetUserId
      ? allUsers.find((u) => u.id === targetUserId)
      : currentUser;

    const sampleOrder: Order = orders[0] || {
      id: 'test-order-sample',
      orderNumber: 'ORD-TEST-001',
      customerId: cust?.id || 'USR-CUST-1',
      customerName: cust?.fullName || 'Devotee Customer',
      customerPhone: cust?.phone || '+91 98450 12345',
      deliveryAddress: 'Temple Ring Road, Mantralayam',
      items: [],
      originalTotal: 1550,
      revisedTotal: 1550,
      currentStatus: 'ACCEPTED',
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dispatchLog = await sendCustomerOrderStageFCMNotification(
      sampleOrder,
      'ACCEPTED',
      cust,
      '🔔 Mantralaya Arts FCM Test Notification',
      'Sri Raghavendra Swami Blessings! Your Firebase Cloud Messaging push notification for customer order workflow changes is active and working.'
    );

    setFcmDispatchLogs((prev) => [dispatchLog, ...prev]);
    return { success: true, log: dispatchLog };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, isRead: true };
          syncNotificationToCloud(updated);
          return updated;
        }
        return n;
      })
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.recipientRole === currentRole) {
          const updated = { ...n, isRead: true };
          syncNotificationToCloud(updated);
          return updated;
        }
        return n;
      })
    );
  };

  const unreadCount = notifications.filter(
    (n) => n.recipientRole === currentRole && !n.isRead
  ).length;

  const resetToSeedData = () => {
    setAllUsers(INITIAL_USERS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCart([]);
    setCurrentRoleState('CUSTOMER');
    setCurrentUserId('USR-CUST-1');
    localStorage.clear();

    // Re-seed cloud if connected
    if (isCloudConnected) {
      INITIAL_ORDERS.forEach(syncOrderToCloud);
      INITIAL_PRODUCTS.forEach(syncProductToCloud);
      INITIAL_USERS.forEach(syncUserToCloud);
      INITIAL_NOTIFICATIONS.forEach(syncNotificationToCloud);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isCloudConnected,
        currentRole,
        setCurrentRole,
        currentUser,
        allUsers,
        switchUser,
        addUserProfile,
        updateUserProfile,
        toggleUserStatus,
        resetUserCredential,
        customerUser,
        isCustomerLoggedIn,
        customerLogin,
        customerLogout,
        categories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        savedProductIds,
        toggleSavedProduct,
        isProductSaved,
        clearSavedProducts,
        orders,
        submitOrder,
        supplierAcceptOrder,
        supplierRejectOrder,
        supplierPartiallyAcceptOrder,
        customerConfirmRevisedOrder,
        customerCancelOrder,
        supplierUpdateOrderStatus,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadCount,
        fcmPermissionStatus,
        fcmDeviceToken,
        fcmDispatchLogs,
        enableFCMNotifications,
        sendTestFCMNotification,
        shopSettings,
        updateShopSettings,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
