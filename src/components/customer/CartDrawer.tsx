import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckoutModal } from './CheckoutModal';
import { Order } from '../../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onViewOrders,
}) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, clearCart, shopSettings } = useApp();
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md max-w-full flex pointer-events-auto">
          <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-[#701A1E] text-amber-50 px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-cinzel text-base font-bold text-amber-100">
                    Your Sacred Bag
                  </h2>
                  <p className="text-[10px] text-amber-200/70 font-sans">
                    {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-amber-200/80 hover:text-white underline cursor-pointer mr-2"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-[#701A1E] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-stone-800">
                    Your Bag is Empty
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                    Browse our handcrafted brass lamps, idols, and pooja essentials to start your devotional order.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#701A1E] text-white text-xs font-semibold hover:bg-[#581216] transition cursor-pointer"
                  >
                    Explore Catalogue
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-3.5 flex gap-3.5 items-start">
                    {/* Item Image */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23701A1E"/></svg>';
                      }}
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-stone-900 leading-snug truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                        {item.product.category}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-200 transition font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-stone-900 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price & Line Item Total */}
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#701A1E] font-mono tabular-nums">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            ₹{item.product.price} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer with Subtotal & Checkout */}
            {cart.length > 0 && (
              <div className="bg-stone-50 p-4 sm:p-5 border-t border-stone-200/80 w-full shrink-0">
                <div className="space-y-2 text-xs text-stone-600 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">Subtotal:</span>
                    <span className="font-semibold text-stone-900 font-mono shrink-0">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">Temple Packaging &amp; Inspection:</span>
                    <span className="font-semibold text-emerald-700 shrink-0 text-right">Complimentary</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                    <span className="font-cinzel truncate">Estimated Total:</span>
                    <span className="font-mono text-[#701A1E] text-base font-extrabold shrink-0">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Order Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={(order) => {
            setShowCheckout(false);
            setConfirmedOrder(order);
          }}
        />
      )}

      {/* Immediate Order Confirmation Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>

            <h3 className="font-cinzel text-xl font-bold text-stone-900">
              Order Submitted!
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Your order <strong className="font-mono text-[#701A1E]">#{confirmedOrder.orderNumber}</strong> has been routed to our authorized supplier.
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono font-bold text-stone-800">{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="font-semibold text-amber-800">Pending Supplier Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Requested:</span>
                <span className="font-mono font-bold text-[#701A1E]">₹{confirmedOrder.originalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <a
              href={generateWhatsAppOrderUrl(confirmedOrder, shopSettings?.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Order on WhatsApp</span>
            </a>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Continue Browsing
              </button>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                  onViewOrders();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#701A1E] text-white text-xs font-semibold hover:bg-[#581216] transition cursor-pointer"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
