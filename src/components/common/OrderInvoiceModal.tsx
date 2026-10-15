import React from 'react';
import { Order, ShopSettings } from '../../types';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';
import { useApp } from '../../context/AppContext';
import { X, Printer, MessageCircle, Sparkles, ShieldCheck, MapPin, Phone } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  shopSettings?: ShopSettings;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  onClose,
  shopSettings: propSettings,
}) => {
  const { shopSettings: contextSettings } = useApp();
  if (!order) return null;

  const currentSettings = propSettings || contextSettings;
  const storePhone = currentSettings?.whatsappNumber;
  const storeName = currentSettings?.storeName || 'Mantralaya Arts';
  const storeAddress =
    currentSettings?.address ||
    'Temple Ring Road, Opposite Moola Brindavana Complex, Mantralayam, Andhra Pradesh - 518345';

  const totalAmount = order.revisedTotal || order.originalTotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] sm:max-h-[95vh] flex flex-col">
        {/* Modal Controls (Hidden in print) */}
        <div className="bg-[#701A1E] text-amber-50 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-100 truncate">
              Temple Order Slip
            </h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#701A1E] shrink-0" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-3.5 sm:p-6 md:p-8 overflow-y-auto flex-1 font-sans text-stone-900 bg-white" id="printable-receipt">
          {/* Temple Letterhead */}
          <div className="border-b-2 border-[#701A1E] pb-3 sm:pb-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-cinzel text-lg sm:text-2xl font-extrabold text-[#701A1E] tracking-wider">
                  {storeName.toUpperCase()}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Devotional Art
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                Temple Gifts · Deity Idols · Brass Vilakkus · Pooja Essentials
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">{storeAddress}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Helpline / WhatsApp: +{storePhone}</p>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right bg-amber-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-amber-200/70 shrink-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Order Reference</span>
              <p className="font-mono text-lg sm:text-xl font-extrabold text-[#701A1E]">#{order.orderNumber}</p>
              <p className="text-xs text-stone-600 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-200">
                Status: {order.currentStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Customer & Fulfillment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs mb-4 sm:mb-6 bg-stone-50 p-3.5 sm:p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block mb-1">
                Recipient &amp; Delivery Destination:
              </span>
              <p className="font-bold text-sm text-stone-900">{order.customerName}</p>
              <p className="text-stone-700 leading-relaxed mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </p>
              <p className="text-stone-700 font-mono mt-1.5 flex items-center gap-1 font-semibold">
                <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{order.customerPhone}</span>
              </p>
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block mb-1">
                Artisan Workshop &amp; Order Notes:
              </span>
              <p className="text-stone-800">
                Assigned Artisan: <strong>{order.supplierName || 'Mantralaya Primary Workshop'}</strong>
              </p>
              {order.customerNotes && (
                <p className="text-stone-600 mt-1 italic">
                  &ldquo;{order.customerNotes}&rdquo;
                </p>
              )}
              {order.supplierDecisionNotes && (
                <div className="mt-2 p-2 rounded-xl bg-amber-100/60 text-amber-900 text-[11px] border border-amber-200">
                  <strong>Artisan Note:</strong> {order.supplierDecisionNotes}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Itemized Breakdown (<640px) */}
          <div className="sm:hidden space-y-2.5 mb-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Ordered Items ({order.items.length})
            </span>
            {order.items.map((item, idx) => (
              <div key={item.productId} className="bg-stone-50/70 p-3 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-stone-400 shrink-0">#{idx + 1}</span>
                    <p className="text-xs font-semibold text-stone-900 line-clamp-1">{item.productName}</p>
                  </div>
                  <span className="text-xs font-bold text-stone-900 font-mono shrink-0">
                    ₹{item.itemTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/60 text-stone-600">
                  <span>₹{item.unitPrice.toLocaleString('en-IN')} each</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-stone-400">Req: {item.requestedQuantity}</span>
                    <span className="text-stone-300">·</span>
                    <span className="font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Appr: {item.approvedQuantity}
                    </span>
                  </div>
                </div>

                {item.approvedQuantity === 0 && (
                  <span className="inline-block text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold uppercase">
                    Unavailable in workshop
                  </span>
                )}
              </div>
            ))}

            {/* Mobile Summary Box */}
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1.5 text-xs">
              {order.originalTotal !== totalAmount && (
                <div className="flex items-center justify-between text-stone-500">
                  <span>Original Total:</span>
                  <span className="font-mono line-through">₹{order.originalTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-600">
                <span>Temple Sacred Packaging:</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-amber-300 font-bold">
                <span className="font-cinzel text-stone-900">Total Payable:</span>
                <span className="font-mono text-base text-[#701A1E]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Desktop & Print Itemized Table (>=640px and print) */}
          <div className="hidden sm:block print:block border border-stone-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#701A1E] text-amber-100 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Req.</th>
                  <th className="p-3 text-center">Approved</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Item Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-stone-50">
                    <td className="p-3 font-mono text-stone-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-stone-900">
                      {item.productName}
                      {item.approvedQuantity === 0 && (
                        <span className="block text-[10px] text-rose-600 font-bold uppercase mt-0.5">
                          Unavailable
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-stone-500">{item.requestedQuantity}</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-900">{item.approvedQuantity}</td>
                    <td className="p-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">
                      ₹{item.itemTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 border-t-2 border-stone-200 text-xs font-semibold">
                {order.originalTotal !== totalAmount && (
                  <tr>
                    <td colSpan={5} className="p-3 text-right text-stone-500">Original Total:</td>
                    <td className="p-3 text-right font-mono text-stone-400 line-through">
                      ₹{order.originalTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={5} className="p-3 text-right text-stone-600">Temple Sacred Packaging &amp; Inspection:</td>
                  <td className="p-3 text-right font-semibold text-emerald-700">Free</td>
                </tr>
                <tr className="bg-amber-50 text-sm">
                  <td colSpan={5} className="p-3 text-right font-extrabold font-cinzel text-stone-900">
                    Grand Total Payable:
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-[#701A1E] text-base">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Temple Blessing & Verification Seal */}
          <div className="pt-3 sm:pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0" />
              <span className="text-[11px] sm:text-xs">Inspected and sanctified by Mantralaya Arts artisans. Traditional purity guaranteed.</span>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <span className="font-cinzel font-bold text-[#701A1E] block text-xs sm:text-sm">Sri Raghavendra Swamy Prasada</span>
              <span className="text-[10px] text-stone-400">Authorized Workshop Slip</span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden in print) */}
        <div className="bg-stone-50 p-3 sm:p-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 print:hidden shrink-0">
          <a
            href={generateWhatsAppOrderUrl(order, storePhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition active:scale-95 shadow-xs"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Send Slip on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition cursor-pointer text-center"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
