import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { StaffAuthModal } from '../auth/StaffAuthModal';
import { BrandLogo } from '../common/BrandLogo';
import { MantralayaLogo } from '../common/MantralayaLogo';
import {
  ShoppingBag,
  Bell,
  Sparkles,
  Store,
  User,
  Shield,
  Truck,
  Package,
  Layers,
  CheckCircle,
  X,
  ChevronDown,
  RotateCcw,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Heart,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onNavigateTab: (tab: 'store' | 'orders' | 'admin' | 'supplier') => void;
  activeTab: 'store' | 'orders' | 'admin' | 'supplier';
  isStaffUnlocked: boolean;
  onStaffLogin: (role: Role) => void;
  onStaffLogout: () => void;
  onOpenCustomerModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onNavigateTab,
  activeTab,
  isStaffUnlocked,
  onStaffLogin,
  onStaffLogout,
  onOpenCustomerModal,
}) => {
  const {
    isCloudConnected,
    currentRole,
    setCurrentRole,
    currentUser,
    allUsers,
    switchUser,
    cartItemCount,
    unreadCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToSeedData,
    customerUser,
    isCustomerLoggedIn,
    customerLogout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const isUserLoggedIn = isCustomerLoggedIn || isStaffUnlocked;
  const isSupplierMode = (isStaffUnlocked && currentRole === 'SUPPLIER') || activeTab === 'supplier';
  const isStaffView = activeTab === 'admin' || activeTab === 'supplier';
  const isAdminView = activeTab === 'admin';

  // In Supplier mode, prioritize Supplier notifications even when viewing Storefront
  const effectiveRole = isSupplierMode ? 'SUPPLIER' : currentRole;
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === effectiveRole
  );
  const roleUnreadCount = roleNotifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-[100] bg-[#701A1E] text-amber-50 shadow-md border-b border-amber-600/30">
        {/* Top Banner: Only visible when Staff Mode is Unlocked */}
        {isStaffUnlocked && (
          <div className="bg-[#581216] px-3 py-1.5 border-b border-amber-500/20 text-xs animate-in slide-in-from-top-1">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2 text-amber-200/90 text-[11px] sm:text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Staff Session:</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Firestore Cloud</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-black/20 p-0.5 rounded-lg border border-amber-400/20">
                  <button
                    onClick={() => {
                      setCurrentRole('SUPPLIER');
                      onNavigateTab('supplier');
                    }}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                      currentRole === 'SUPPLIER' || activeTab === 'supplier'
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                        : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                    <span>Supplier</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('ADMIN');
                      onNavigateTab('admin');
                    }}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                      currentRole === 'ADMIN' && activeTab === 'admin'
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                        : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* Exit Staff Mode button */}
                <button
                  onClick={onStaffLogout}
                  className="px-2 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-amber-200 hover:text-white text-xs flex items-center gap-1 border border-amber-400/20 transition cursor-pointer"
                  title="Lock Staff Session and return to Customer View"
                >
                  <Lock className="w-3 h-3 text-amber-300" />
                  <span className="hidden sm:inline">Lock Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Top Bar: Responsive 3 Zones */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Zone 1: Brand Wordmark with Authentic Temple Kalash & Diya Insignia */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[55%] sm:max-w-none">
            <button
              onClick={() => {
                if (isUserLoggedIn) {
                  onNavigateTab('store');
                }
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer min-w-0"
              title="Mantralaya Arts - Home Storefront"
            >
              <BrandLogo size="sm" />
              <div className="min-w-0">
                <h1 className="font-cinzel text-sm xs:text-base sm:text-xl font-bold tracking-wider text-amber-100 group-hover:text-amber-300 transition leading-tight truncate">
                  MANTRALAYA ARTS
                </h1>
                <p className="hidden xs:block text-[9px] sm:text-[11px] text-amber-200/70 tracking-widest font-sans uppercase truncate">
                  Temple Gifts &amp; Pooja Essentials
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          {/* Supplier Mode Navigation: Explicitly includes Storefront, Customer Orders, and Fulfillment Console */}
          {isSupplierMode ? (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <button
                onClick={() => onNavigateTab('store')}
                className={`transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'store'
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                    : 'text-amber-100/80 hover:text-white hover:text-amber-200'
                }`}
                title="Browse customer-facing storefront"
              >
                <Store className="w-4 h-4 text-amber-300" />
                <span>Storefront</span>
              </button>
              <button
                onClick={() => onNavigateTab('orders')}
                className={`transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                    : 'text-amber-100/80 hover:text-white hover:text-amber-200'
                }`}
                title="View customer orders list"
              >
                <Package className="w-4 h-4 text-amber-300" />
                <span>Customer Orders</span>
              </button>
              <button
                onClick={() => onNavigateTab('supplier')}
                className={`transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'supplier'
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                    : 'text-amber-100/80 hover:text-white hover:text-amber-200'
                }`}
                title="Supplier Order Fulfillment Console"
              >
                <Truck className="w-4 h-4 text-amber-300" />
                <span>Fulfillment Console</span>
              </button>
            </nav>
          ) : isStaffUnlocked && currentRole === 'ADMIN' && activeTab === 'admin' ? (
            /* Admin Header Center Indicator when in Admin Mode (Orders Fulfillment completely hidden) */
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/20 border border-amber-400/20 text-xs text-amber-200">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-amber-100">Administrator Console Active</span>
            </div>
          ) : isUserLoggedIn ? (
            /* Customer / Devotee Store Navigation Links */
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <button
                onClick={() => onNavigateTab('store')}
                className={`transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'store'
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                    : 'text-amber-100/80 hover:text-white'
                }`}
              >
                Storefront
              </button>
              <button
                onClick={() => onNavigateTab('orders')}
                className={`transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                    : 'text-amber-100/80 hover:text-white'
                }`}
              >
                {currentRole === 'CUSTOMER' ? 'My Orders' : 'Customer Orders'}
              </button>
            </nav>
          ) : null}

          {/* Zone 3: Actions - Filtered strictly by auth status & Staff mode */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* When NOT logged in: Only Staff Login button is shown */}
            {!isUserLoggedIn ? (
              <button
                onClick={() => setShowStaffModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
                title="Staff & Administrator PIN Access"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Staff Login</span>
              </button>
            ) : (
              /* When Logged In: Show Bell (in Customer & Supplier views) and Bag (Customer view) */
              <>
                {/* Notification Bell: Restored for Supplier Mode & active for Customer Mode */}
                {activeTab !== 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-1.5 sm:p-2 rounded-xl bg-black/20 hover:bg-black/30 text-amber-200 hover:text-white transition relative cursor-pointer"
                      aria-label="View notifications"
                      title={activeTab === 'supplier' ? 'Supplier Alerts & Fulfillment Requests' : 'Notifications'}
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      {roleUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-bold text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                          {roleUnreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <>
                        <div
                          onClick={() => setShowNotifications(false)}
                          className="fixed inset-0 z-[105] bg-black/40 backdrop-blur-2xs"
                        />
                        <div className="fixed inset-x-3.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl bg-white text-stone-800 shadow-2xl border border-stone-200 z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="bg-[#701A1E] text-amber-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-amber-300" />
                              <span className="text-xs font-bold uppercase tracking-wider font-cinzel">
                                {activeTab === 'supplier'
                                  ? `Supplier Alerts (${roleNotifications.length})`
                                  : `Notifications (${roleNotifications.length})`}
                              </span>
                            </div>
                            {roleNotifications.some((n) => !n.isRead) && (
                              <button
                                onClick={markAllNotificationsAsRead}
                                className="text-[11px] text-amber-200 hover:text-white underline cursor-pointer"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                            {roleNotifications.length === 0 ? (
                              <div className="p-6 text-center text-xs text-stone-500">
                                {activeTab === 'supplier'
                                  ? 'No pending order fulfillment alerts for supplier.'
                                  : 'No notifications for your account.'}
                              </div>
                            ) : (
                              roleNotifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  onClick={() => {
                                    markNotificationAsRead(notif.id);
                                    onNavigateTab(
                                      activeTab === 'supplier' || currentRole === 'SUPPLIER'
                                        ? 'supplier'
                                        : 'orders'
                                    );
                                    setShowNotifications(false);
                                  }}
                                  className={`p-3.5 hover:bg-stone-50 transition cursor-pointer text-left ${
                                    !notif.isRead ? 'bg-amber-50/50' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-stone-900 leading-tight">
                                      {notif.title}
                                    </p>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-stone-400 mt-1.5 font-mono">
                                    {new Date(notif.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Shopping Bag Button: Visible only when browsing Storefront / Orders */}
                {!isStaffView && (
                  <button
                    onClick={onOpenCart}
                    className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition shadow-sm active:scale-95 cursor-pointer"
                    aria-label={`Shopping bag with ${cartItemCount} items`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#701A1E] shrink-0" />
                    <span className="hidden md:inline">Bag</span>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#701A1E] text-amber-200 text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0">
                      {cartItemCount}
                    </span>
                  </button>
                )}

                {/* Customer Profile: Active when role is CUSTOMER or staff session is locked */}
                {(currentRole === 'CUSTOMER' || !isStaffUnlocked) && customerUser && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-amber-100 text-xs transition border border-amber-400/20 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase border border-emerald-400/30 shrink-0">
                        {customerUser.fullName.charAt(0)}
                      </div>
                      <span className="hidden md:inline font-medium text-xs max-w-[80px] truncate">
                        {customerUser.fullName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-amber-300 shrink-0" />
                    </button>

                    {showCustomerDropdown && (
                      <>
                        <div
                          onClick={() => setShowCustomerDropdown(false)}
                          className="fixed inset-0 z-[105] bg-black/40 backdrop-blur-2xs"
                        />
                        <div className="fixed inset-x-3.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-64 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl bg-white text-stone-800 shadow-2xl border border-stone-200 z-[110] p-2 animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-3 border-b border-stone-100">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-stone-900 truncate">{customerUser.fullName}</p>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                                Active Devotee
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-mono mt-0.5">{customerUser.phone}</p>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">{customerUser.id}</p>
                          </div>

                          {customerUser.deliveryAddress && (
                            <div className="p-3 border-b border-stone-100 text-[11px] text-stone-600">
                              <p className="font-semibold text-stone-800 text-[10px] uppercase tracking-wider mb-0.5">Delivery Address:</p>
                              <p className="line-clamp-2 leading-tight">{customerUser.deliveryAddress}</p>
                            </div>
                          )}

                          <div className="p-1 space-y-1">
                            {onOpenCustomerModal && (
                              <button
                                onClick={() => {
                                  setShowCustomerDropdown(false);
                                  onOpenCustomerModal();
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-800 hover:bg-stone-50 transition flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Heart className="w-4 h-4 text-rose-600 fill-rose-100" />
                                <span>Saved for Later &amp; Profile</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setShowCustomerDropdown(false);
                                customerLogout();
                                onNavigateTab('store');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <LogOut className="w-4 h-4 text-rose-600" />
                              <span>Sign Out of Account</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Staff User Dropdown: Only visible when staff is unlocked AND current role is Staff/Admin */}
                {isStaffUnlocked && currentRole !== 'CUSTOMER' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-amber-100 text-xs transition border border-amber-400/20 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <span className="hidden md:inline font-medium text-xs max-w-[80px] truncate">
                        {currentUser.fullName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-amber-300 shrink-0" />
                    </button>

                    {showUserDropdown && (
                      <>
                        <div
                          onClick={() => setShowUserDropdown(false)}
                          className="fixed inset-0 z-[105] bg-black/40 backdrop-blur-2xs"
                        />
                        <div className="fixed inset-x-3.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-64 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl bg-white text-stone-800 shadow-2xl border border-stone-200 z-[110] p-2 animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-3 border-b border-stone-100">
                            <p className="text-xs font-bold text-stone-900 truncate">{currentUser.fullName}</p>
                            <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                            <span className="inline-block mt-1 text-[10px] font-semibold text-[#701A1E] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Active Role: {currentUser.role}
                            </span>
                          </div>

                          {/* Switch Staff Profile: Strictly Staff profiles only */}
                          <div className="py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-1">
                              Switch Staff Profile:
                            </p>
                            <div className="space-y-1">
                              {allUsers
                                .filter((u) => u.role === 'ADMIN' || u.role === 'SUPPLIER')
                                .map((u) => (
                                  <button
                                    key={u.id}
                                    onClick={() => {
                                      switchUser(u.id);
                                      setShowUserDropdown(false);
                                      if (u.role === 'SUPPLIER') onNavigateTab('supplier');
                                      else if (u.role === 'ADMIN') onNavigateTab('admin');
                                      else onNavigateTab('store');
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                                      u.id === currentUser.id
                                        ? 'bg-amber-100 text-[#701A1E] font-bold'
                                        : 'text-stone-700 hover:bg-stone-50'
                                    }`}
                                  >
                                    <div className="truncate">
                                      <p className="truncate font-medium">{u.fullName}</p>
                                      <p className="text-[10px] text-stone-400 capitalize">{u.role.toLowerCase()}</p>
                                    </div>
                                    {u.id === currentUser.id && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#701A1E] shrink-0" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 space-y-1">
                            <button
                              onClick={onStaffLogout}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-stone-700 hover:bg-stone-100 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5 text-stone-500" />
                              <span>Lock Staff Session</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('Reset all catalog, user profiles, and orders to initial seed state?')) {
                                  resetToSeedData();
                                  setShowUserDropdown(false);
                                }
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Initial Demo Data</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Staff Authentication PIN Modal */}
      <StaffAuthModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSuccess={(role) => {
          onStaffLogin(role);
          // Requirement: When a user logs in with Admin credentials, the UI toggle automatically defaults to "Supplier" mode
          onNavigateTab('supplier');
        }}
      />
    </>
  );
};
