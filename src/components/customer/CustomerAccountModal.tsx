import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  MapPin,
  Mail,
  LogOut,
  KeyRound,
  X,
  Heart,
  ShoppingBag,
  Sparkles,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStaffModal: () => void;
  onOpenCart?: () => void;
  onGoToStore?: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onOpenStaffModal,
  onOpenCart,
  onGoToStore,
}) => {
  const {
    customerUser,
    customerLogout,
    products,
    savedProductIds,
    toggleSavedProduct,
    clearSavedProducts,
    addToCart,
    cart,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'profile'>('saved');
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  if (!isOpen || !customerUser) return null;

  // Resolve saved products from catalog
  const savedProducts = products.filter((p) => savedProductIds.includes(p.id));

  const handleAddToCart = (e: React.MouseEvent, product: (typeof products)[0]) => {
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result.success) {
      setAddedSuccessId(product.id);
      setTimeout(() => setAddedSuccessId(null), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden pb-safe max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#701A1E] text-amber-50 px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-base uppercase shrink-0">
              {customerUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-cinzel text-base font-bold text-amber-100 leading-tight truncate">
                {customerUser.fullName}
              </h3>
              <p className="text-[11px] text-amber-200/80">Devotee Account &amp; Sacred Collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-amber-200 flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center border-b border-stone-200 bg-stone-50/80 px-4 pt-2.5 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'border-[#701A1E] text-[#701A1E] bg-white shadow-2xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                activeTab === 'saved' ? 'fill-rose-600 text-rose-600' : 'text-stone-400'
              }`}
            />
            <span>Saved for Later</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'saved'
                  ? 'bg-rose-100 text-rose-800 font-bold'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {savedProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#701A1E] text-[#701A1E] bg-white shadow-2xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: SAVED FOR LATER SECTION */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-stone-600 pb-1">
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-stone-900">
                    Sacred Items Saved for Later
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Handcrafted idols, deepams, and pooja essentials saved to your personal list.
                  </p>
                </div>

                {savedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all saved items?')) {
                        clearSavedProducts();
                      }
                    }}
                    className="text-[11px] text-stone-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {savedProducts.length === 0 ? (
                <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-8 text-center my-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200/60 shadow-2xs">
                    <Heart className="w-6 h-6 fill-rose-100" />
                  </div>
                  <h4 className="font-cinzel text-sm font-bold text-stone-900">
                    Your Saved List is Empty
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Tap the heart icon on any deity idol, brass lamp, or temple pooja essential in the store to save it here for future blessings.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onGoToStore) onGoToStore();
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#701A1E] text-white text-xs font-semibold hover:bg-[#581216] transition cursor-pointer shadow-xs active:scale-95"
                  >
                    Explore Devotional Store
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedProducts.map((product) => {
                    const cartItem = cart.find((i) => i.product.id === product.id);
                    const inCartQty = cartItem ? cartItem.quantity : 0;
                    const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
                    const isJustAdded = addedSuccessId === product.id;

                    return (
                      <div
                        key={product.id}
                        className="bg-white p-3 rounded-2xl border border-stone-200 hover:border-amber-300 transition shadow-2xs flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23701A1E"/></svg>';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block truncate">
                              {product.category}
                            </span>
                            <p className="text-xs font-bold text-stone-900 line-clamp-1 leading-snug">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono font-extrabold text-sm text-[#701A1E]">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${
                                  isOutOfStock
                                    ? 'text-rose-600'
                                    : product.stockQuantity < 10
                                    ? 'text-amber-700'
                                    : 'text-stone-400'
                                }`}
                              >
                                {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} left`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Move to Bag button */}
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isOutOfStock}
                            className={`h-8 px-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white'
                                : inCartQty > 0
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold'
                                : isOutOfStock
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-[#701A1E] hover:bg-[#581216] text-white'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : inCartQty > 0 ? (
                              <>
                                <ShoppingBag className="w-3 h-3 text-[#701A1E]" />
                                <span>{inCartQty} in Bag</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>

                          {/* Heart toggle / Remove button */}
                          <button
                            onClick={() => toggleSavedProduct(product.id)}
                            className="w-8 h-8 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 flex items-center justify-center transition cursor-pointer"
                            title="Remove from Saved for Later"
                            aria-label={`Remove ${product.name} from saved items`}
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-600 stroke-rose-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Link to Bag */}
              {cart.length > 0 && onOpenCart && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#701A1E]" />
                    <span>View Sacred Bag ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEVOTEE PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Identity Info */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Devotee Name:</span>
                  <span className="font-bold text-stone-900 text-sm">{customerUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Mobile Number:</span>
                  <span className="font-mono font-semibold text-stone-800">{customerUser.phone}</span>
                </div>
                {customerUser.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-[11px]">Email Address:</span>
                    <span className="text-stone-800">{customerUser.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Customer ID:</span>
                  <span className="font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {customerUser.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Saved Items:</span>
                  <span className="font-mono font-bold text-[#701A1E]">
                    {savedProducts.length} items
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              {customerUser.deliveryAddress && (
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#701A1E]" />
                    <span>Primary Delivery Address</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed pl-5">
                    {customerUser.deliveryAddress}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenStaffModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>Staff &amp; Artisan PIN Login</span>
                </button>

                <button
                  onClick={() => {
                    customerLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
