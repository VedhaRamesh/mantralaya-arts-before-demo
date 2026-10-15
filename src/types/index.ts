export type Role = 'ADMIN' | 'SUPPLIER' | 'CUSTOMER';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // In Indian Rupees (₹), > 0
  stockQuantity: number; // >= 0
  category: string; // Matches Category name
  status: ProductStatus;
  imageUrl: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'PENDING_SUPPLIER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PARTIALLY_ACCEPTED'
  | 'AWAITING_CUSTOMER_CONFIRMATION'
  | 'CONFIRMED_BY_CUSTOMER'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  requestedQuantity: number;
  approvedQuantity: number;
  itemTotal: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  actorRole: Role;
  actorName: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  customerNotes?: string;
  items: OrderItem[];
  originalTotal: number;
  revisedTotal: number;
  currentStatus: OrderStatus;
  supplierId?: string;
  supplierName?: string;
  rejectionReason?: string;
  supplierDecisionNotes?: string;
  decisionTimestamp?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  accessPin?: string; // Admin-created access PIN for customer/user login
  password?: string; // Secure password for user authentication
  deliveryAddress?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  fcmToken?: string; // Active Firebase Cloud Messaging token for push notifications
  fcmTokens?: string[]; // Multiple devices supported
  fcmNotificationEnabled?: boolean;
  fcmTokenUpdatedAt?: string;
  savedProductIds?: string[]; // Saved for later / wishlist products
  createdAt: string;
}

export type NotificationType =
  | 'ORDER_SUBMITTED'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'PARTIALLY_ACCEPTED'
  | 'REVISED_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'FCM_PUSH'
  | 'GENERAL';

export interface AppNotification {
  id: string;
  recipientRole: Role;
  recipientUserId?: string;
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
}

export interface FCMDispatchLog {
  id: string;
  orderId: string;
  orderNumber: string;
  stage: OrderStatus;
  title: string;
  body: string;
  recipientUserId: string;
  recipientName: string;
  recipientPhone?: string;
  fcmToken?: string;
  dispatchedAt: string;
  status: 'DELIVERED' | 'SENT' | 'SIMULATED';
}

export interface ShopSettings {
  storeName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  upiId?: string;
  dispatchNote?: string;
  staffAdminPin?: string;
  staffAdminPassword?: string;
  staffSupplierPin?: string;
  fcmServerKey?: string;
  fcmVapidPublicKey?: string;
}
