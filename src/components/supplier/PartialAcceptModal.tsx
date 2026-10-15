import React, { useState } from 'react';
import { Order } from '../../types';
import { X, CheckCircle, AlertTriangle, Minus, Plus } from 'lucide-react';

interface PartialAcceptModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (
    itemApprovals: { productId: string; approvedQuantity: number }[],
    notes: string
  ) => void;
}

export const PartialAcceptModal: React.FC<PartialAcceptModalProps> = ({
  order,
  onClose,
  onSubmit,
}) => {
  // State storing approved quantity per item, initialized with currently requested quantity
  const [approvals, setApprovals] = useState<{ [productId: string]: number }>(() => {
    const init: { [productId: string]: number } = {};
    order.items.forEach((item) => {
      init[item.productId] = item.requestedQuantity;
    });
    return init;
  });

  const [supplierNotes, setSupplierNotes] = useState(
    'Partial quantities approved based on current artisan workshop stock.'
  );

  const handleQtyChange = (productId: string, maxQty: number, delta: number) => {
    setApprovals((prev) => {
      const current = prev[productId] ?? maxQty;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  // Recalculate revised total in real-time
  const revisedTotal = order.items.reduce((sum, item) => {
    const approvedQty = approvals[item.productId] ?? item.requestedQuantity;
    return sum + approvedQty * item.unitPrice;
  }, 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = order.items.map((item) => ({
      productId: item.productId,
      approvedQuantity: approvals[item.productId] ?? item.requestedQuantity,
    }));
    onSubmit(payload, supplierNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-base font-bold text-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              <span>Partially Accept Order #{order.orderNumber}</span>
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Customer: {order.customerName} ({order.customerPhone})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          <p className="text-xs text-stone-600 mb-4">
            Adjust the approved quantities based on workshop stock. Items set to 0 will be marked as unavailable.
          </p>

          {/* Mobile Stacked Items (sm:hidden) */}
          <div className="sm:hidden space-y-3 mb-5">
            {order.items.map((item) => {
              const approvedQty = approvals[item.productId] ?? item.requestedQuantity;
              const itemRevisedTotal = approvedQty * item.unitPrice;
              const isZero = approvedQty === 0;

              return (
                <div
                  key={item.productId}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                    isZero ? 'bg-rose-50/50 border-rose-200' : 'bg-stone-50/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-stone-900 leading-tight">{item.productName}</p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        ₹{item.unitPrice} each · Req: <strong className="text-stone-800">{item.requestedQuantity}</strong>
                      </p>
                    </div>
                    <span className="font-mono font-bold text-stone-900 text-xs shrink-0">
                      ₹{itemRevisedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {isZero && (
                    <span className="inline-block text-[10px] text-rose-600 font-bold uppercase">
                      Unavailable (0 Approved)
                    </span>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                    <span className="text-[11px] font-semibold text-stone-600">Approved Qty:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.productId, item.requestedQuantity, -1)}
                        disabled={approvedQty <= 0}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center font-mono font-bold text-sm text-stone-900">
                        {approvedQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.productId, item.requestedQuantity, 1)}
                        disabled={approvedQty >= item.requestedQuantity}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Revised Total Summary Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1 text-xs">
              <div className="flex justify-between items-center text-stone-500">
                <span>Original Total:</span>
                <span className="font-mono line-through text-stone-400">
                  ₹{order.originalTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-amber-200 font-bold text-stone-900">
                <span className="font-cinzel">New Revised Total:</span>
                <span className="font-mono text-base font-extrabold text-[#701A1E]">
                  ₹{revisedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Approval Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block border border-stone-200 rounded-2xl overflow-hidden mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-center">Requested</th>
                  <th className="p-3 text-center">Approved Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Revised Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item) => {
                  const approvedQty = approvals[item.productId] ?? item.requestedQuantity;
                  const itemRevisedTotal = approvedQty * item.unitPrice;
                  const isZero = approvedQty === 0;

                  return (
                    <tr key={item.productId} className={isZero ? 'bg-rose-50/50' : 'bg-white'}>
                      <td className="p-3 font-medium text-stone-900">
                        {item.productName}
                        {isZero && (
                          <span className="block text-[10px] text-rose-600 font-bold uppercase mt-0.5">
                            Unavailable (0 Approved)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">{item.requestedQuantity}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.requestedQuantity, -1)}
                            disabled={approvedQty <= 0}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-stone-900">
                            {approvedQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.requestedQuantity, 1)}
                            disabled={approvedQty >= item.requestedQuantity}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono">₹{item.unitPrice}</td>
                      <td className="p-3 text-right font-mono font-bold text-stone-900">
                        ₹{itemRevisedTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-stone-50 border-t border-stone-200 text-xs">
                <tr>
                  <td colSpan={4} className="p-3 text-right text-stone-500 font-medium">Original Total:</td>
                  <td className="p-3 text-right font-mono text-stone-400 line-through">
                    ₹{order.originalTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-amber-50/60 font-bold">
                  <td colSpan={4} className="p-3 text-right text-stone-900 font-cinzel">
                    New Revised Total:
                  </td>
                  <td className="p-3 text-right font-mono text-base font-extrabold text-[#701A1E]">
                    ₹{revisedTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Supplier Explanation Note */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason / Message for Customer regarding adjusted quantities *
            </label>
            <textarea
              required
              rows={3}
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              placeholder="Explain why fewer units were approved (e.g. only 3 sets in workshop, remaining items under casting)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-[#701A1E]" />
              <span>Send Revised Proposal to Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
