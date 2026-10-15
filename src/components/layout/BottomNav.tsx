import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Package, ShoppingBag, ShieldCheck, Truck, User, KeyRound } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'store' | 'orders' | 'admin' | 'supplier';
  onNavigateTab: (tab: 'store' | 'orders' | 'admin' | 'supplier') => void;
  onOpenCart: () => void;
  isStaffUnlocked: boolean;
  onOpenStaffModal: () => void;
  onOpenCustomerModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenCart,
  isStaffUnlocked,
  onOpenStaffModal,
  onOpenCustomerModal,
}) => {
  const { currentRole, cartItemCount, orders, currentUser, customerUser, isCustomerLoggedIn } = useApp();

  const pendingSupplierOrders = orders.filter(
    (o) => o.currentStatus === 'PENDING_SUPPLIER_REVIEW'
  ).length;

  const awaitingCustomerOrders = orders.filter(
    (o) =>
      o.customerId === (customerUser?.id || currentUser.id) &&
      o.currentStatus === 'AWAITING_CUSTOMER_CONFIRMATION'
  ).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-lg pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Storefront - Clean without any dots below */}
        <button
          onClick={() => onNavigateTab('store')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition relative cursor-pointer ${
            activeTab === 'store' ? 'text-[#701A1E]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Store className={`w-5 h-5 ${activeTab === 'store' ? 'stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] tracking-tight mt-1 ${activeTab === 'store' ? 'font-bold text-[#701A1E]' : 'font-semibold'}`}>
            Store
          </span>
        </button>

        {/* Tab 2: Orders - Clean without any dots below */}
        <button
          onClick={() => onNavigateTab('orders')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition relative cursor-pointer ${
            activeTab === 'orders' ? 'text-[#701A1E]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : ''}`} />
            {awaitingCustomerOrders > 0 && currentRole === 'CUSTOMER' && (
              <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {awaitingCustomerOrders}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 ${activeTab === 'orders' ? 'font-bold text-[#701A1E]' : 'font-semibold'}`}>
            Orders
          </span>
        </button>

        {/* Tab 3: Bag - Clean without any dots below */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-stone-500 hover:text-[#701A1E] transition relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#701A1E] text-amber-200 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-1">Bag</span>
        </button>

        {/* Tab 4: Staff Access or Devotee Account Profile */}
        {isStaffUnlocked ? (
          currentRole === 'SUPPLIER' ? (
            <button
              onClick={() => onNavigateTab('supplier')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition relative cursor-pointer ${
                activeTab === 'supplier' ? 'text-[#701A1E]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Truck className={`w-5 h-5 ${activeTab === 'supplier' ? 'stroke-[2.5]' : ''}`} />
                {pendingSupplierOrders > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingSupplierOrders}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${activeTab === 'supplier' ? 'font-bold text-[#701A1E]' : 'font-semibold'}`}>
                Supplier
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('admin')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition relative cursor-pointer ${
                activeTab === 'admin' ? 'text-[#701A1E]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] tracking-tight mt-1 ${activeTab === 'admin' ? 'font-bold text-[#701A1E]' : 'font-semibold'}`}>
                Admin
              </span>
            </button>
          )
        ) : isCustomerLoggedIn && customerUser ? (
          <button
            onClick={onOpenCustomerModal || onOpenStaffModal}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-stone-500 hover:text-stone-900 transition relative cursor-pointer"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-[10px] uppercase border border-emerald-400/30">
              {customerUser.fullName.charAt(0)}
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[55px]">
              Account
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenStaffModal}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-stone-500 hover:text-stone-900 transition relative cursor-pointer"
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Staff</span>
          </button>
        )}
      </div>
    </nav>
  );
};
