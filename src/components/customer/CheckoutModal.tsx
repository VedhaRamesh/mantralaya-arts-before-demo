import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  X,
  CheckCircle,
  AlertCircle,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  FileText,
  ShoppingBag,
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onOrderSuccess,
}) => {
  const { cart, cartTotal, submitOrder, currentUser, customerUser } = useApp();
  const activeUser = customerUser || currentUser;

  const [fullName, setFullName] = useState(activeUser?.fullName || '');
  const [phone, setPhone] = useState(activeUser?.phone || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [address, setAddress] = useState(activeUser?.deliveryAddress || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (activeUser) {
      if (activeUser.fullName) setFullName(activeUser.fullName);
      if (activeUser.phone) setPhone(activeUser.phone);
      if (activeUser.email) setEmail(activeUser.email);
      if (activeUser.deliveryAddress) setAddress(activeUser.deliveryAddress);
    }
  }, [activeUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please provide a valid 10-digit mobile number for order verification.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide a delivery address.');
      return;
    }

    setIsSubmitting(true);

    const result = submitOrder({
      fullName,
      phone,
      email,
      address,
      notes,
    });

    setIsSubmitting(false);

    if (result.success && result.order) {
      onOrderSuccess(result.order);
    } else {
      setErrorMessage(result.error || 'Failed to submit order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <h3 className="font-cinzel text-base font-bold tracking-wider text-amber-100">
              Submit Devotional Order Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Notice */}
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Fulfillment Verification Process</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Our workshop artisan will inspect raw brass stock and pooja essentials. Online payments are not charged until the supplier confirms availability.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Smt. Lakshmi Devi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9123456780"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. lakshmi@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Full Delivery Address *</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door/Flat no, Street, Landmark, City, State, PIN code"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Special Puja Instructions / Notes (Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Specific date required for housewarming pooja"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
              />
            </div>
          </div>

          {/* Order Summary Snapshot Box */}
          <div className="mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-stone-600 font-medium">Items Selected:</span>
              <span className="font-semibold text-stone-900 font-mono">
                {cart.reduce((s, i) => s + i.quantity, 0)} units
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-200">
              <span className="text-stone-600 font-medium">Packaging &amp; Temple Box:</span>
              <span className="font-semibold text-emerald-700">Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-sm">
              <span className="font-bold text-stone-900 font-cinzel">Total Amount:</span>
              <span className="font-extrabold text-[#701A1E] font-mono text-base">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
            >
              Back to Bag
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 rounded-xl bg-[#701A1E] hover:bg-[#581216] disabled:bg-stone-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  <span>Submit Order Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
