# Mobile Responsiveness Overhaul for Mantralaya Arts PWA

A comprehensive mobile ergonomic enhancement resolving viewport truncation, horizontal scroll clipping, and layout wrapping across customer storefront, bag drawer, order review, and staff management consoles.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and govern the mobile layout architecture:

- **Confirmed Decision 1 (Storefront Categories)**: Replace the single-row horizontal overflow scroll with wrapping multi-row category pills (`flex-wrap`), making all devotional collections instantly visible and accessible without swiping.
- **Confirmed Decision 2 (Management & Order Tables)**: Transform wide desktop tabular grids in Customer Orders, User Profile Directory, and Product Management into responsive card-based stacked lists on mobile devices (`md:hidden`), preserving full tables for tablet and desktop viewports (`hidden md:table`).
- **Confirmed Decision 3 (Notification Panel)**: Reposition the notification center popover on mobile viewports to a full-width centered overlay modal with screen margin constraints, preventing left-edge cutoff.

---

## 1. Overview & Core Concept

### What It Delivers
This update delivers full responsive compliance across all smartphone viewports (360px–430px) without horizontal scroll leakage, edge truncation, or awkward touch barriers. Every key workflow—browsing collections, reviewing bag totals, inspecting orders, and administering devotees or products—adheres to natural mobile thumb ergonomics.

### Target Audience & Persona
- **Temple Devotees & Customers**: Ordering pooja essentials on compact Android and iOS mobile screens without clipped pricing or obscured collection tabs.
- **Store Administrators & Suppliers**: Reviewing devotees, inventory, and order items on mobile devices without pinching or horizontal table scrolling.

---

## 2. User Experience & Visual Design

### Key Responsiveness Upgrades by Surface

1. **Bell Notification Center (`Header.tsx`)**:
   - *Current Bug*: `absolute right-0 w-72` inside a right-aligned header container anchors the right edge to the icon, causing the left edge to overflow off the left of the screen (-70px).
   - *Mobile UX*: Center-anchored floating dropdown modal on viewports `< 640px` (`fixed inset-x-3.5 top-16 max-w-sm mx-auto z-50 shadow-2xl`), with a backdrop layer and edge padding. Tablet/desktop retains compact anchored dropdown (`sm:absolute sm:right-0 sm:w-96`).

2. **Storefront Category Navigation (`StorefrontView.tsx`)**:
   - *Current Bug*: `overflow-x-auto min-w-max` forces devotees to swipe horizontally to discover brass lamps, idols, or return gifts.
   - *Mobile UX*: Responsive `flex flex-wrap gap-2` pill strip. Collections wrap neatly into 2–3 rows with compact touch targets (minimum 44px hitbox) and clear active/inactive visual states.

3. **Sacred Bag Drawer (`CartDrawer.tsx`)**:
   - *Current Bug*: Fixed drawer wrapper has `flex pl-10` with inner container `w-screen`, expanding total width to `100vw + 40px` and pushing the right-aligned Subtotal, ₹ amounts, and CTA buttons off-screen.
   - *Mobile UX*: Remove mobile `pl-10` (`pl-0 sm:pl-10`) and constrain drawer width to `w-full max-w-md` with `overflow-x-hidden`. Subtotal, packaging fees, and checkout button remain fully visible with proper 16px safe-area margins.

4. **Customer Orders View (`CustomerOrdersView.tsx`)**:
   - *Current Bug*: Order line item breakdowns and supplier partial revision tables require 500px+ width, forcing awkward horizontal scrolling.
   - *Mobile UX*: Mobile card list (`sm:hidden`) rendering each line item as an ergonomic card with product title, requested vs. approved quantities, unit price, and subtotal. Desktop maintains the tabular format (`hidden sm:table`).

5. **User Profile Directory (`UserManagementView.tsx`)**:
   - *Current Bug*: 6-column user directory table (Profile, Contact, Role, Status, Date, Actions) overflows on phone screens.
   - *Mobile UX*: On mobile (`md:hidden`), render stacked devotee cards featuring initials avatar, role/status badges, one-tap WhatsApp and phone dialing, access PIN indicator, and stacked action buttons (Edit, Status, Orders).

6. **Product Catalog Management (`ProductManagementView.tsx`)**:
   - *Current Bug*: Products table overflows horizontally on small screens.
   - *Mobile UX*: On mobile (`md:hidden`), render responsive inventory cards displaying product thumbnail, title, category, stock badge, status, and full-width edit/delete buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Rendering (Cards on Mobile vs. Tables on Desktop)**
  - *Chosen Approach*: Use Tailwind responsive display classes (`block md:hidden` for cards, `hidden md:table` for tables).
  - *Why*: Tables are ideal on wide desktop screens with mouse pointers, while stacked cards with vertical thumb scrolling are vastly superior on mobile devices.
  - *Alternative Considered*: Sticky column horizontal scrolling was rejected as it leads to high cognitive load and reach fatigue on narrow screens.

- **Decision 2: Category Pill Wrapping vs. Collapsible Accordion**
  - *Chosen Approach*: Multi-row wrapping pills (`flex-wrap`).
  - *Why*: Devotees can see all 6 sacred collections immediately on page load with zero extra clicks.

- **Decision 3: Centered Modal Anchor for Notifications**
  - *Chosen Approach*: `fixed inset-x-3 top-16 max-w-sm mx-auto` on mobile.
  - *Why*: Eliminates calculation bugs related to header parent positioning and ensures zero left or right clipping regardless of phone model width.

---

## 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    MANTRALAYA ARTS PWA                      │
├──────────────────────────────┬──────────────────────────────┤
│ Mobile Viewport (< 640px)    │ Desktop Viewport (>= 640px)  │
├──────────────────────────────┼──────────────────────────────┤
│ • Header: Centered Dropdown  │ • Header: Anchored Dropdown  │
│ • Store: Wrapping Pills      │ • Store: Inline Pill Row     │
│ • Bag: w-full max-w-md       │ • Bag: max-w-md + pl-10      │
│ • Orders: Stacked Cards      │ • Orders: Detailed Table     │
│ • Users: Profile Cards       │ • Users: 6-Col Admin Table   │
│ • Products: Inventory Cards  │ • Products: 6-Col Catalog    │
└──────────────────────────────┴──────────────────────────────┘
```

### Component Modification Plan

- `src/components/layout/Header.tsx`:
  - Update `showNotifications` dropdown container with responsive positioning (`fixed inset-x-3.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0`).
- `src/components/customer/StorefrontView.tsx`:
  - Change category tab strip from `min-w-max overflow-x-auto` to `flex flex-wrap gap-2`.
- `src/components/customer/CartDrawer.tsx`:
  - Change wrapper from `flex pl-10` with `w-screen` to `flex pl-0 sm:pl-10` with `w-full max-w-md`.
- `src/components/customer/CustomerOrdersView.tsx`:
  - Add responsive card stack (`sm:hidden`) for order line items and revision tables, keeping `hidden sm:table` for desktop.
- `src/components/admin/UserManagementView.tsx`:
  - Add responsive card stack (`md:hidden`) for user profiles, keeping `hidden md:table` for desktop.
- `src/components/admin/ProductManagementView.tsx`:
  - Add responsive card stack (`md:hidden`) for product inventory, keeping `hidden md:table` for desktop.
