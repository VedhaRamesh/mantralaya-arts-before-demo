import React, { useEffect, useState } from 'react';
import { Bell, Sparkles, X, ArrowRight, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { setupFCMForegroundListener } from '../../services/fcmService';

interface FCMNotificationBannerProps {
  onViewOrder?: (orderId: string) => void;
}

interface BannerItem {
  id: string;
  title: string;
  body: string;
  orderId?: string;
  orderNumber?: string;
  stage?: string;
}

export const FCMNotificationBanner: React.FC<FCMNotificationBannerProps> = ({ onViewOrder }) => {
  const [activeBanner, setActiveBanner] = useState<BannerItem | null>(null);

  useEffect(() => {
    const cleanup = setupFCMForegroundListener((payload) => {
      const bannerItem: BannerItem = {
        id: `fcm-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        orderId: payload.data?.orderId || payload.data?.dispatchLog?.orderId,
        orderNumber: payload.data?.orderNumber || payload.data?.dispatchLog?.orderNumber,
        stage: payload.data?.stage || payload.data?.dispatchLog?.stage,
      };

      setActiveBanner(bannerItem);

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setActiveBanner((current) => (current?.id === bannerItem.id ? null : current));
      }, 7000);

      return () => clearTimeout(timer);
    });

    return cleanup;
  }, []);

  if (!activeBanner) return null;

  const isApproved = activeBanner.stage === 'ACCEPTED';
  const isPartiallyApproved = activeBanner.stage === 'AWAITING_CUSTOMER_CONFIRMATION' || activeBanner.stage === 'PARTIALLY_ACCEPTED';
  const isRejected = activeBanner.stage === 'REJECTED';
  const isShipped = activeBanner.stage === 'SHIPPED';

  return (
    <div className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounce-short">
      <div className="bg-[#701A1E] text-amber-50 rounded-2xl shadow-2xl border-2 border-amber-400/40 p-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
            {isApproved && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {isPartiallyApproved && <AlertCircle className="w-5 h-5 text-amber-300" />}
            {isShipped && <Truck className="w-5 h-5 text-sky-300" />}
            {!isApproved && !isPartiallyApproved && !isShipped && <Bell className="w-5 h-5 text-amber-300" />}
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/30 text-amber-300">
                FCM Push Alert
              </span>
              {activeBanner.orderNumber && (
                <span className="text-[10px] text-amber-200/80 font-mono">
                  #{activeBanner.orderNumber}
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-bold font-cinzel text-amber-100 leading-tight">
              {activeBanner.title}
            </h4>
            <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
              {activeBanner.body}
            </p>

            {activeBanner.orderId && onViewOrder && (
              <button
                onClick={() => {
                  onViewOrder(activeBanner.orderId!);
                  setActiveBanner(null);
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer"
              >
                <span>Inspect Order Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveBanner(null)}
            className="absolute top-3 right-3 text-amber-200/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
