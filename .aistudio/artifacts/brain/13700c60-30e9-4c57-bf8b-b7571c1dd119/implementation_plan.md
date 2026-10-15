# Mantralaya Arts — Devotional Shopping Mobile PWA

A production-minded, mobile-first shopping Progressive Web App for **Mantralaya Arts** catering to temple-related gifts, deity idols, pooja essentials, and spiritual accessories, featuring strict role-based workflows for Administrators, Suppliers, and Customers, complete with partial order acceptances, inventory safeguards, user management, and Android PWA installation.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience preferences have been confirmed through Phase 1 clarification:

- **Confirmed Decision 1 (Role Access & Testing)**: A dual-mode access model will be implemented: standard user profile login / account provisioning alongside a dedicated, persistent **Role Switcher** bar at the top/drawer. This allows instantaneous switching between **Administrator**, **Supplier (Ravi Kumar)**, and **Customer (Lakshmi Devi)** without friction during evaluation and daily operations.
- **Confirmed Decision 2 (Storefront Catalog Data)**: The application will boot pre-loaded with an authentic, rich starter catalogue across all 8 pooja categories (Pooja Essentials, Deity Idols, Temple Gift Items, Spiritual Accessories, Brass and Copper, Decorative Items, Festive Gifts, Return Gifts) with realistic Indian Rupee (₹) pricing, stock limits, and descriptions, while allowing Administrators full CRUD and activation controls.
- **Confirmed Decision 3 (Android PWA Experience)**: Configured with `vite-plugin-pwa`, standalone display mode, manifest with high-contrast icons, offline capability, and a prominent in-app **"Install App"** bar tailored for Android and iOS devices.
- **Backend & Persistence Strategy**: The data layer is designed with a unified repository pattern: state persists locally in indexed/local storage with real-time reactivity and transaction guarantees, with ready bindings for Firebase Cloud Firestore and Authentication following the `firebase-integration-rpc` architecture.

---

### 1. Overview & Core Concept

- **What It Does**: Mantralaya Arts is a specialized devotional e-commerce application designed primarily for one-handed mobile use on Android devices. It supports the entire purchase journey: customers browse sacred items, manage carts, submit orders, track live status, and review revised order proposals. Suppliers review incoming orders, approve or reject them with reasons, or partially accept items with revised quantities and automatic price recalculations. Administrators oversee inventory, categories, orders, and user profiles (adding customers/suppliers, managing roles, activation, and order history).
- **Target Audience / Persona**:
  - *Devotees & Temple Patrons (Customers)*: Searching for authentic puja essentials, return gifts, and brass idols with clear stock status and reliable order confirmation.
  - *Fulfillment Suppliers*: Workshop and inventory handlers who verify stock availability, propose item quantity adjustments, and communicate reasons for changes.
  - *Store Administrators*: Business owners managing inventory levels, product catalog, supplier assignments, and customer accounts.
- **Key Value**: Eliminates fulfillment friction for customized or handmade spiritual items by introducing a two-way order review protocol (Supplier partial acceptance $\to$ Customer confirmation) with strict inventory tracking and zero duplicate deductions.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Customer Discovery & Checkout Flow**:
   - Customer opens storefront $\to$ sees featured temple banners and quick category filter tabs.
   - Searches products by name or tags; opens product modal/detail with high-res photography, stock count, and price in ₹.
   - Adds items to cart $\to$ views subtotal and itemized breakdown.
   - Enters delivery info (Full Name, Phone number, Delivery address, Optional puja notes).
   - Validates stock $\to$ submits order $\to$ receives unique order ID (`#MA-XXXXX`), status set to `PENDING_SUPPLIER_REVIEW`, and real-time in-app confirmation notification.

2. **Supplier Order Processing & Partial Acceptance Flow**:
   - Supplier dashboard displays pending orders with customer contact and order items.
   - Supplier options:
     - **Accept Entire Order**: Status $\to$ `ACCEPTED`, inventory reserved.
     - **Reject Order**: Supplier enters reason (e.g., "Artisan out of raw brass stock") $\to$ status $\to$ `REJECTED`, customer notified.
     - **Partially Accept**: Supplier adjusts approved quantities per line item (e.g., 5 requested $\to$ 3 approved; 2 requested $\to$ 0 unavailable). Subtotal recalculates in real-time. Status moves to `PARTIALLY_ACCEPTED` and `AWAITING_CUSTOMER_CONFIRMATION`.
   - Customer receives notification $\to$ reviews revised order $\to$ chooses **"Confirm Revised Order"** (status $\to$ `CONFIRMED_BY_CUSTOMER`) or **"Cancel Order"** (status $\to$ `CANCELLED`).

3. **Administrator Oversight & User Management Flow**:
   - Admin views executive KPI cards (Total Products, Low Stock alerts, Out of Stock, Total Orders, Pending Orders).
   - **Product & Category CRUD**: Add new pooja item with image, category, ₹ price, stock quantity, and status (Active/Inactive/Out of Stock).
   - **User Profile Management**: Add customer or supplier profile with Name, Mobile, Email, Address, and Role. Filter profiles by role and status, edit details, activate/deactivate accounts, and inspect historical orders.

#### Visual Identity & Theme

- **Aesthetic Direction**: Sacred Heritage & Temple Elegance. Avoid generic startup looks. Evoke the reverence and warmth of South Indian temple arts and Mantralaya craftsmanship.
- **Color Palette**:
  - Dominant Neutral Canvas (60%): Warm Temple Ivory (`#FDFBF7`) with soft linen cards (`#FFFFFF`, border `#F1EBE1`).
  - Brand Secondary (30%): Deep Royal Maroon (`#701A1E` / `#581216`) for primary app bars, main headers, and important states.
  - Sacred Accents (10%): Warm Saffron Gold (`#D97706` / `#B45309`) and Antique Brass (`#CA8A04`) for CTAs, active filters, and highlights.
  - Text & Contrast: Deep Charcoal/Warm Espresso (`#1F1A17`) for typography, ensuring WCAG AA compliant contrast ratio $\ge 7:1$.
- **Typography & Hierarchy**:
  - Display & Headings: `Cinzel` / `Playfair Display` serif for devotional grandeur.
  - Body & Form Controls: `Plus Jakarta Sans` for clean, highly legible mobile touch reading.
  - Pricing & Numbers: `font-mono tabular-nums` for crisp currency and quantity alignment.
- **Mobile Ergonomics**:
  - Natural thumb zone fixed bottom tab bar (Home / Storefront, Orders, Cart, Admin / Supplier Console).
  - Minimum touch targets of $\ge 44\text{px} \times 44\text{px}$.
  - Sticky bottom action bars for Checkout and Order Acceptance.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Partial Acceptance State Machine**:
  - *Chosen Approach*: Explicit two-phase state machine (`PENDING_SUPPLIER_REVIEW` $\to$ `PARTIALLY_ACCEPTED` / `AWAITING_CUSTOMER_CONFIRMATION` $\to$ `CONFIRMED_BY_CUSTOMER` or `CANCELLED`).
  - *Why*: Devotional items and handcrafted temple brass often experience variable workshop stock. Preserving both `requestedQuantity` and `approvedQuantity` on line-item snapshots guarantees customer trust and transparent recalculation.
  - *Trade-off*: Requires extra customer confirmation step, which protects against unwanted fulfillment discrepancies.
- **Decision 2: Dual Access Model (Role Switcher + Profile Authentication)**:
  - *Chosen Approach*: Embed a high-visibility Quick Role Switcher (Admin, Supplier, Customer) with active persona presets while simultaneously maintaining full user profile creation, credential management, and role-based route guard security.
  - *Why*: Allows instant mobile testing and verification on any device without losing production security constraints.
- **Decision 3: PWA Offline Shell & Android Installability**:
  - *Chosen Approach*: `vite-plugin-pwa` with service worker caching for application shell, static assets, and products, paired with an in-app `beforeinstallprompt` banner.
  - *Why*: Provides native Android app feel, launches in standalone full-screen mode, and supports browsing under weak temple or rural connectivity.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Mantralaya Arts Mobile PWA Canvas                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar: Brand Wordmark · Quick Role Switcher · Notifications     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│          ┌─────────────────────┴──────────────────────┐                │
│          ▼                                            ▼                │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │   Customer View       │                  │ Supplier / Admin View │  │
│  │ • Hero Banner         │                  │ • KPI Summary Cards   │  │
│  │ • 8 Pooja Categories  │                  │ • Supplier Orders     │  │
│  │ • Product Cards (₹)   │                  │   - Accept / Reject   │  │
│  │ • Product Detail Modal│                  │   - Partial Approve   │  │
│  │ • Cart & Checkout     │                  │ • Product Management  │  │
│  │ • Order Tracking      │                  │ • User Profile Mgmt   │  │
│  │ • Customer Confirm    │                  │ • Category CRUD       │  │
│  └───────────────────────┘                  └───────────────────────┘  │
│                                │                                       │
│  ┌─────────────────────────────┴────────────────────────────────────┐  │
│  │ Context & State Engine (Data Repository + Reactive Listeners)     │  │
│  │ • UserProfilesStore  • ProductsStore  • OrdersStore  • CartStore │  │
│  │ • In-App Notifications Store  • PWA Install Controller           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│  ┌─────────────────────────────┴────────────────────────────────────┐  │
│  │ Persistence & Sync Layer: IndexedDB / LocalStorage / Firestore    │  │
│  │ Service Worker Cache (Vite PWA) · asia-northeast1 · ₹ INR Locale │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Mobile Bottom Tab Bar: Store · Orders · Cart · Console (44px+)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & Models

- **Product**: `id`, `name`, `category`, `price` (number, > 0), `stockQuantity` (number, $\ge$ 0), `description`, `imageUrl`, `status` (`ACTIVE` | `INACTIVE` | `OUT_OF_STOCK`), `createdAt`.
- **Category**: `id`, `name`, `slug`, `description`, `iconName`, `isActive`.
- **Order**:
  - `id` (e.g. `ORD-20261014-8841`), `orderNumber`, `customerId`, `customerName`, `customerPhone`, `deliveryAddress`, `customerNotes`.
  - `items`: Array of `OrderItem` (`productId`, `productName`, `unitPrice`, `requestedQuantity`, `approvedQuantity`, `itemTotal`, `imageUrl`, `isAvailable`).
  - `originalTotal`, `revisedTotal`, `currentStatus` (`PENDING_SUPPLIER_REVIEW` | `ACCEPTED` | `REJECTED` | `PARTIALLY_ACCEPTED` | `AWAITING_CUSTOMER_CONFIRMATION` | `CONFIRMED_BY_CUSTOMER` | `CANCELLED`).
  - `rejectionReason`, `supplierNotes`, `supplierId`, `createdAt`, `updatedAt`, `decisionTimestamp`.
  - `statusHistory`: Array of `{ status, timestamp, actorRole, notes }`.
- **UserProfile**: `id`, `fullName`, `email`, `phone`, `role` (`CUSTOMER` | `SUPPLIER` | `ADMIN`), `address`, `notes`, `status` (`ACTIVE` | `INACTIVE`), `createdAt`.
- **Notification**: `id`, `recipientRole`, `recipientUserId`, `orderId`, `orderNumber`, `title`, `message`, `type`, `read`, `timestamp`.

#### Implementation Phasing

- **Phase 1: Foundation, Design Tokens & PWA Config**
  - Install `vite-plugin-pwa`. Configure PWA manifest, meta tags, and icons.
  - Setup color tokens (Temple Maroon, Ivory, Saffron Gold), typography, and icons.
- **Phase 2: Seed Data & Reactive State Engine**
  - Realistic seed catalog (8 categories, 16+ authentic pooja items with images and ₹ pricing).
  - Seed profiles: Admin, Supplier (Ravi Kumar), Customer (Lakshmi Devi).
  - Storage repository with transaction-safe mutations, duplicate order guards, and stock validation.
- **Phase 3: Customer Storefront, Cart & Checkout**
  - Mobile-first catalog with search, category pills/tabs, and product detail sheet.
  - Slide-over / modal cart with quantity steppers, subtotal in ₹, and validation.
  - Checkout form capturing Name, Phone, Address, and notes. Order snapshot creation.
- **Phase 4: Supplier Dashboard & Partial Acceptance Workflow**
  - Supplier order queue: View order snapshot and customer details.
  - Modal for Partial Acceptance with line-item approved quantity controls and real-time revised total.
  - Rejection with reason modal. Safe stock adjustments.
  - Customer order view with interactive "Confirm Revised Order" / "Cancel Order".
- **Phase 5: Administrator Dashboard & User Profile Management**
  - KPI summary metrics (products, inventory alerts, orders).
  - Full Product & Category CRUD with image picker/URL support and stock management.
  - Dedicated User Management module: Add User form (validation, duplicate phone/email detection), filterable profile table/list, view/edit user modal, activate/deactivate toggles, and user order history.
- **Phase 6: In-App Notifications, Role Switcher, PWA Install Banner & Verification**
  - Real-time notification drawer with badge counters.
  - Quick Role Switcher toolbar for rapid evaluation.
  - Install PWA banner for Android and step-by-step guidance for iOS.
  - Comprehensive TypeScript build verification with `compile_applet`.
