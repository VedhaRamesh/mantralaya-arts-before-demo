/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { StorefrontView } from './components/customer/StorefrontView';
import { CartDrawer } from './components/customer/CartDrawer';
import { CustomerOrdersView } from './components/customer/CustomerOrdersView';
import { SupplierDashboard } from './components/supplier/SupplierDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StaffAuthModal } from './components/auth/StaffAuthModal';
import { CustomerLoginView } from './components/auth/CustomerLoginView';
import { FCMNotificationBanner } from './components/notifications/FCMNotificationBanner';
import { CustomerAccountModal } from './components/customer/CustomerAccountModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Role } from './types';
import { WifiOff, Sparkles, KeyRound } from 'lucide-react';

function MainApp() {
  const { currentRole, setCurrentRole, switchUser, allUsers, isCustomerLoggedIn, customerUser } = useApp();
  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'admin' | 'supplier'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const isOnline = useOnlineStatus();

  // Check if staff session is unlocked (stored in localStorage)
  const [isStaffUnlocked, setIsStaffUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('mantralaya_staff_unlocked') === 'true';
  });

  const isUserLoggedIn = isCustomerLoggedIn || isStaffUnlocked;

  const handleStaffLogin = (role: Role) => {
    setIsStaffUnlocked(true);
    localStorage.setItem('mantralaya_staff_unlocked', 'true');
    // Requirement: When a user logs in with Admin credentials, the UI toggle automatically defaults to "Supplier" mode
    if (role === 'ADMIN' || role === 'SUPPLIER') {
      setCurrentRole('SUPPLIER');
      setActiveTab('supplier');
    } else {
      setCurrentRole(role);
      setActiveTab('store');
    }
  };

  const handleStaffLogout = () => {
    setIsStaffUnlocked(false);
    localStorage.removeItem('mantralaya_staff_unlocked');
    setCurrentRole('CUSTOMER');
    setActiveTab('store');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans-body text-stone-900 overflow-x-hidden">
      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — Browsing cached temple products and offline bag.</span>
        </div>
      )}

      {/* Prominent Android / iOS PWA Install Banner */}
      <PWAInstallBanner />

      {/* Header with Top Bar Contract & Role Switcher */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
        isStaffUnlocked={isStaffUnlocked}
        onStaffLogin={handleStaffLogin}
        onStaffLogout={handleStaffLogout}
        onOpenCustomerModal={() => setShowCustomerModal(true)}
      />

      {/* Real-time Firebase Cloud Messaging Notification Toast Banner - only when logged in */}
      {isUserLoggedIn && (
        <FCMNotificationBanner onViewOrder={() => setActiveTab('orders')} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-0">
        {/* Mandatory Customer Login Barrier */}
        {!isUserLoggedIn ? (
          <CustomerLoginView
            onOpenStaffModal={() => setShowStaffModal(true)}
            onLoginSuccess={() => setActiveTab('store')}
          />
        ) : (
          <>
            {activeTab === 'store' && (
              <StorefrontView onOpenCart={() => setIsCartOpen(true)} />
            )}

            {activeTab === 'orders' && (
              <CustomerOrdersView onGoToStore={() => setActiveTab('store')} />
            )}

            {activeTab === 'supplier' && isStaffUnlocked && (
              <SupplierDashboard />
            )}

            {activeTab === 'admin' && isStaffUnlocked && (
              <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {/* Fallback if locked user somehow reaches staff tab */}
            {((activeTab === 'supplier' || activeTab === 'admin') && !isStaffUnlocked) && (
              <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-stone-200 text-center shadow-sm">
                <KeyRound className="w-12 h-12 text-[#701A1E] mx-auto mb-3" />
                <h3 className="text-lg font-bold font-cinzel text-stone-900">Staff Portal Locked</h3>
                <p className="text-xs text-stone-500 mt-1 mb-5">
                  Please enter your staff PIN to access fulfillment or administrative records.
                </p>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#701A1E] text-white font-bold text-xs cursor-pointer"
                >
                  Enter Staff PIN
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onViewOrders={() => {
          setIsCartOpen(false);
          setActiveTab('orders');
        }}
      />

      {/* Mobile Bottom Tab Navigation - Strictly hidden until user is logged in */}
      {isUserLoggedIn && (
        <BottomNav
          activeTab={activeTab}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenCart={() => setIsCartOpen(true)}
          isStaffUnlocked={isStaffUnlocked}
          onOpenStaffModal={() => setShowStaffModal(true)}
          onOpenCustomerModal={() => setShowCustomerModal(true)}
        />
      )}

      {/* Devotee Customer Account Modal */}
      <CustomerAccountModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onOpenStaffModal={() => {
          setShowCustomerModal(false);
          setShowStaffModal(true);
        }}
        onOpenCart={() => {
          setShowCustomerModal(false);
          setIsCartOpen(true);
        }}
        onGoToStore={() => {
          setShowCustomerModal(false);
          setActiveTab('store');
        }}
      />

      {/* Staff Auth PIN Modal */}
      <StaffAuthModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSuccess={(role) => {
          handleStaffLogin(role);
          if (role === 'SUPPLIER') setActiveTab('supplier');
          else if (role === 'ADMIN') setActiveTab('admin');
        }}
      />

      {/* Quiet Heritage Footer */}
      <footer className="hidden md:block bg-[#2D0B0E] text-stone-300 py-8 px-6 text-xs border-t border-amber-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-200 font-bold tracking-wider text-sm">
              MANTRALAYA ARTS
            </span>
            <span className="text-amber-200/50">·</span>
            <span className="text-stone-400">Sacred Temple Craftsmanship &amp; Pooja Essentials</span>
          </div>

          <div className="flex items-center gap-6 text-stone-400">
            <span>Prices in Indian Rupees (₹)</span>
            <span>Asia/Kolkata</span>
            {!isStaffUnlocked ? (
              <button
                onClick={() => setShowStaffModal(true)}
                className="text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </button>
            ) : (
              <button
                onClick={handleStaffLogout}
                className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Lock Staff Portal
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
