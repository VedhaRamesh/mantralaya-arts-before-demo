# Mantralaya Arts - UI Visibility Rules & Temple Kalash Branding

Comprehensive implementation plan to refine the Admin and Supplier dashboard navigation, restore Supplier alerts and Storefront accessibility, remove Orders Fulfillment from the Admin console, and introduce an authentic temple Kalash and Diya insignia logo.

> [!IMPORTANT]
> **User Clarifications & Confirmed Decisions (Phase 1):**
> 1. **Logo Design**: Confirmed creation of an authentic temple Kalash and Diya insignia (sacred brass pot, coconut, mango leaves, and luminous diya flame) replacing the generic sparkles icon.
> 2. **Supplier Storefront Session**: Confirmed keeping the top staff bar persistently visible when suppliers navigate to the Storefront, providing a one-click return to the Supplier Fulfillment Console.
> 3. **Supplier Alerts**: Confirmed prioritizing new assigned orders, pending supplier review items, and urgent item fulfillment updates in the Supplier notification bell.

---

### 1. Overview & Core Concept

- **What It Does**: Streamlines the role-based experience between store administrators, suppliers, and customers. It hides the "Orders Fulfillment" tab from the Admin dashboard (keeping Admin focused on high-level reports, users, catalog, and settings), restores full access to the Notification Bell and Storefront link for Suppliers, and replaces the generic sparkles logo with an authentic temple Kalash & Diya emblem.
- **Target Personas**:
  - **Store Administrator**: Manages high-level store configuration, devotees, products, categories, and business reports without clutter from supplier-level packing tasks.
  - **Artisan / Supplier**: Inspects assigned purchase requests, receives instant alerts on new orders, accepts/rejects items, and browses the customer-facing storefront while retaining instant return navigation.
  - **Devotee / Customer**: Enjoys an authentic devotional visual identity with traditional temple aesthetics and seamless order placement.
- **Key Value**: Distinct role separation with zero dead ends, clear alert visibility for order fulfillment, and an authentic sacred temple branding aesthetic.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Admin View Flow**:
   - Administrator signs in via Staff PIN (or role switcher).
   - In Admin Mode (`activeTab === 'admin'`), the top banner displays "Administrator Console Active".
   - The Admin dashboard displays clean tabs: **Reports & Analytics**, **User Profile Management**, **Product Management**, **Category Management**, and **Store & WhatsApp Settings**.
   - The "Orders Fulfillment" tab is completely hidden/removed from the Admin console.
2. **Supplier View Flow**:
   - Supplier signs in or toggles to Supplier Mode (`activeTab === 'supplier'`).
   - The top header renders the **Notification Bell** with unread count badges; clicking reveals prioritized alerts (new assigned orders, pending reviews).
   - The **Storefront** navigation link in Zone 2 is fully visible and clickable, allowing the supplier to inspect customer product listings and stock status.
   - When browsing the Storefront, the top amber staff bar remains persistent with an active "Supplier Active" badge and a "Return to Fulfillment" action.
3. **Branding Experience**:
   - The application header displays the handcrafted **Kalash & Diya Insignia**: a sacred brass Kalash pot crowned with ceremonial coconut and mango leaves, resting upon a glowing diya base with a warm red-to-amber flame.
   - Accompanying typography retains the dignified `Cinzel` serif wordmark with warm gold accents.

#### Visual Identity & Theme
- **Dominant Palette**:
  - Primary Canvas: Deep temple burgundy `#581216` to rich maroon `#701A1E`.
  - Accents: Sacred brass gold (`#FDE68A`, `#F59E0B`, `#B45309`) and diya flame crimson (`#EF4444`).
  - Surfaces: Warm parchment `#FDFBF7`, soft cream `#F8F4EB`, and neutral stone `#1C1917`.
- **Typography**:
  - Display / Wordmark: `Cinzel` serif with letter-spacing tracking.
  - Body & Microcopy: `Plus Jakarta Sans` for crisp UI legibility.
  - Telemetry & Order Counts: `JetBrains Mono` / tabular numbers.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of Orders Fulfillment from Admin Dashboard**
  - *Chosen Approach*: Completely remove any fulfillment tab from `AdminDashboard.tsx`, keeping order dispatch and partial accept/reject workflows dedicated to the Supplier Fulfillment Console.
  - *Why*: Reduces cognitive overhead for administrators and enforces clear separation of concerns between business administration and artisan fulfillment.
- **Decision 2: Supplier Navigation & Bell Restoration**
  - *Chosen Approach*: Decouple Zone 2 (navigation links) and Zone 3 (notification bell) visibility in `Header.tsx` so that `activeTab === 'supplier'` displays both the `Storefront` link and the `Bell` icon, while hiding customer-only elements like the Shopping Bag.
  - *Why*: Suppliers need real-time order alerts to dispatch items promptly and need to verify how their products appear in the live storefront.
- **Decision 3: Handcrafted Scalable SVG Brand Logo Component**
  - *Chosen Approach*: Implement a dedicated `BrandLogo` component featuring a scalable, vectorized Kalash and Diya insignia consistent with `public/icon.svg`.
  - *Why*: Inline SVG ensures crisp rendering across high-DPI displays without network dependencies, avoiding broken image fallbacks or blurry raster icons.

---

### 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Header                                   │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────┐  │
│  │ BrandLogo         │  │ Zone 2: Nav Links │  │ Zone 3: Actions    │  │
│  │ - Kalash & Diya   │  │ - Storefront Link │  │ - Notification Bell│  │
│  │ - Cinzel Wordmark │  │   (Supplier/Cust) │  │   (Supplier/Cust)  │  │
│  └───────────────────┘  └───────────────────┘  │ - Profile / Staff  │  │
│                                                └────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│          AdminDashboard           │       │         SupplierDashboard         │
│  - Reports & Analytics            │       │  - Order Review & Fulfillment     │
│  - User Management                │       │  - Accept / Reject / Partial      │
│  - Product Management             │       │  - Real-time Dispatch Sync        │
│  - Category Management            │       │  - Filter by Status & Search      │
│  - Store & WhatsApp Settings      │       └───────────────────────────────────┘
│  (Orders Fulfillment REMOVED)     │
└───────────────────────────────────┘
```

#### State and Logic Updates
- **`Header.tsx`**:
  - Update `isStaffView` / `isAdminView` / `isSupplierView` condition flags.
  - Allow `activeTab === 'supplier'` to render `Storefront` navigation link.
  - Allow `activeTab === 'supplier'` to render the Notification Bell dropdown.
  - Replace `<Sparkles />` with `<BrandLogo />` containing the Kalash & Diya insignia.
- **`AdminDashboard.tsx`**:
  - Verify and ensure no "Orders Fulfillment" tab button or panel exists.
  - Keep active tabs clean: `reports`, `users`, `products`, `categories`, `settings`.
- **`BrandLogo.tsx`**:
  - Create reusable SVG insignia component with gold gradient Kalash pot, coconut, sacred leaves, and luminous diya flame.

---

### 5. Verification & Acceptance Criteria
1. When toggling to "Admin" mode:
   - "Orders Fulfillment" tab is completely hidden/removed from Admin dashboard.
   - Only Reports, Users, Products, Categories, and Settings are displayed.
2. When toggling to "Supplier" mode:
   - Notification Bell is clearly visible in the header with unread badge.
   - Clicking Bell opens alerts filtered for the supplier's pending orders.
   - "Storefront" link is visible in the desktop navigation and functional.
   - Clicking "Storefront" navigates to the store catalog while keeping the staff bar accessible to return to the Supplier console.
3. Branding:
   - The header displays the authentic temple Kalash and Diya insignia alongside the Mantralaya Arts title.
   - App builds cleanly with zero compilation errors (`npm run build`).
