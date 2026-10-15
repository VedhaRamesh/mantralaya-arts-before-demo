import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Truck,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Printer,
  Bell,
  Smartphone,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';
import { OrderInvoiceModal } from '../common/OrderInvoiceModal';
import { PaginationControls } from '../common/PaginationControls';

interface CustomerOrdersViewProps {
  onGoToStore: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onGoToStore,
}) => {
  const {
    orders,
    currentUser,
    currentRole,
    customerConfirmRevisedOrder,
    customerCancelOrder,
    shopSettings,
    fcmPermissionStatus,
    fcmDeviceToken,
    enableFCMNotifications,
    sendTestFCMNotification,
  } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isEnablingFCM, setIsEnablingFCM] = useState(false);
  const [fcmTestStatus, setFcmTestStatus] = useState<string | null>(null);

  // Pagination State (Defaults to 20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // If role is Customer, only show that customer's orders. If Admin or Supplier, show all or relevant
  const visibleOrders = orders.filter((o) => {
    if (currentRole === 'CUSTOMER') {
      return o.customerId === currentUser.id;
    }
    return true;
  });

  const totalPages = Math.ceil(visibleOrders.length / pageSize) || 1;
  const paginatedOrders = visibleOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_SUPPLIER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      case 'PARTIALLY_ACCEPTED':
      case 'AWAITING_CUSTOMER_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            Revised — Awaiting Your Confirmation
          </span>
        );
      case 'CONFIRMED_BY_CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            Confirmed by You
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-indigo-600" />
            Dispatched / In Transit
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-700" />
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-stone-500" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmRevision = (orderId: string, orderNumber: string) => {
    const res = customerConfirmRevisedOrder(orderId);
    if (res.success) {
      setActionSuccessMessage(`Order #${orderNumber} confirmed! Our artisan will prepare dispatch.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
      const res = customerCancelOrder(orderId, 'Cancelled after reviewing partial proposal.');
      if (res.success) {
        setActionSuccessMessage(`Order #${orderNumber} has been cancelled.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    }
  };

  const handleEnableFCM = async () => {
    setIsEnablingFCM(true);
    setFcmTestStatus(null);
    const res = await enableFCMNotifications();
    setIsEnablingFCM(false);
    if (res.success) {
      setFcmTestStatus('Push notifications enabled successfully! You will receive live FCM alerts as your orders progress.');
    } else {
      setFcmTestStatus(`Could not enable notifications: ${res.error || 'Please allow notifications in browser site settings.'}`);
    }
    setTimeout(() => setFcmTestStatus(null), 6000);
  };

  const handleSendTestPush = async () => {
    setFcmTestStatus('Dispatching test FCM push notification...');
    const res = await sendTestFCMNotification();
    if (res.success) {
      setFcmTestStatus('✅ Test FCM push notification dispatched and delivered to your device!');
    } else {
      setFcmTestStatus(`Test notification notice: ${res.error || 'Check notification permissions'}`);
    }
    setTimeout(() => setFcmTestStatus(null), 5000);
  };

  const isFCMActive = fcmPermissionStatus === 'granted' || Boolean(fcmDeviceToken);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#701A1E]" />
            <span>{currentRole === 'CUSTOMER' ? 'My Devotional Orders' : 'All Customer Orders'}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track real-time order approvals, supplier quantity adjustments, and fulfillment snapshots.
          </p>
        </div>

        <button
          onClick={onGoToStore}
          className="self-start sm:self-auto text-xs font-semibold text-[#701A1E] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Browse Catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Firebase Cloud Messaging (FCM) Customer Notification Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#581216] via-[#701A1E] to-[#8C242A] text-amber-50 rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-100 font-cinzel">
                  Order Status Push Notifications
                </span>
                {isFCMActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    FCM Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    <Smartphone className="w-3 h-3 text-amber-300" />
                    FCM Standby
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5">
                {isFCMActive
                  ? 'Firebase Cloud Messaging is connected. You receive instant alerts when suppliers accept, adjust, or dispatch orders.'
                  : 'Enable Firebase push alerts to get immediate updates whenever your sacred order changes stage.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {!isFCMActive ? (
              <button
                onClick={handleEnableFCM}
                disabled={isEnablingFCM}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#581216] font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isEnablingFCM ? 'Connecting...' : 'Enable FCM Alerts'}</span>
              </button>
            ) : (
              <button
                onClick={handleSendTestPush}
                className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-amber-200 hover:text-white border border-amber-400/30 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3 h-3 text-amber-300" />
                <span>Send Test FCM Push</span>
              </button>
            )}
          </div>
        </div>

        {fcmTestStatus && (
          <div className="mt-3 pt-3 border-t border-amber-400/20 text-[11px] text-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{fcmTestStatus}</span>
          </div>
        )}
      </div>

      {actionSuccessMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#701A1E] flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-cinzel text-base font-bold text-stone-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            You haven't submitted any orders yet. Discover our consecrated pooja essentials, idols, and gifts.
          </p>
          <button
            onClick={onGoToStore}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#701A1E] text-white text-xs font-semibold hover:bg-[#581216] transition cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isAwaitingConfirmation =
              order.currentStatus === 'AWAITING_CUSTOMER_CONFIRMATION' ||
              order.currentStatus === 'PARTIALLY_ACCEPTED';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                  isAwaitingConfirmation
                    ? 'border-amber-400 ring-2 ring-amber-300/40'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Order Summary Strip */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#701A1E] flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.currentStatus)}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      {isAwaitingConfirmation && order.revisedTotal !== order.originalTotal ? (
                        <div>
                          <span className="text-[11px] text-stone-400 line-through font-mono">
                            ₹{order.originalTotal.toLocaleString('en-IN')}
                          </span>
                          <p className="text-base font-extrabold text-[#701A1E] font-mono">
                            ₹{order.revisedTotal.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-base font-extrabold text-[#701A1E] font-mono">
                          ₹{(order.revisedTotal || order.originalTotal).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>

                    <button
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                      aria-label="Expand order details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CRITICAL FEATURE: Customer Action Banner for Partial Acceptance */}
                {isAwaitingConfirmation && (
                  <div className="bg-amber-50/80 border-t border-b border-amber-300 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-cinzel">
                          Supplier Partial Acceptance Notice
                        </h4>
                        <p className="text-xs text-amber-900 mt-1">
                          Our supplier adjusted the quantities for this order based on current artisan workshop stock.
                        </p>
                        {order.supplierDecisionNotes && (
                          <div className="mt-2 p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-stone-800 italic">
                            &ldquo;{order.supplierDecisionNotes}&rdquo;
                            <span className="block not-italic text-[10px] text-stone-400 mt-1">
                              — {order.supplierName || 'Authorized Supplier'}
                            </span>
                          </div>
                        )}

                        {/* Revised Line Items: Responsive Mobile Stacked Cards (sm:hidden) */}
                        <div className="mt-3 sm:hidden space-y-2.5">
                          {order.items.map((item) => (
                            <div
                              key={item.productId}
                              className={`p-3 rounded-2xl border text-xs ${
                                !item.isAvailable || item.approvedQuantity === 0
                                  ? 'bg-rose-50/50 border-rose-200 text-stone-500'
                                  : 'bg-white border-amber-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-stone-900 leading-tight">
                                  {item.productName}
                                </p>
                                <span className="font-mono font-bold text-stone-900 shrink-0">
                                  ₹{item.itemTotal.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {(!item.isAvailable || item.approvedQuantity === 0) && (
                                <span className="inline-block mt-1 text-[10px] text-rose-600 font-bold uppercase">
                                  Unavailable in workshop
                                </span>
                              )}

                              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                                <div>
                                  <span>Requested: <strong className="font-mono">{item.requestedQuantity}</strong></span>
                                  <span className="mx-1.5 text-stone-300">→</span>
                                  <span>Approved: <strong className="font-mono text-amber-800 font-bold">{item.approvedQuantity}</strong></span>
                                </div>
                                <span className="text-stone-400 font-mono">₹{item.unitPrice} each</span>
                              </div>
                            </div>
                          ))}

                          {/* Mobile Total Comparison Card */}
                          <div className="p-3 rounded-2xl bg-white border border-amber-300 space-y-1.5 text-xs">
                            <div className="flex justify-between text-stone-500">
                              <span>Original Total:</span>
                              <span className="font-mono line-through">₹{order.originalTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t border-amber-100">
                              <span className="font-cinzel text-amber-950">Revised Total:</span>
                              <span className="font-mono font-extrabold text-[#701A1E] text-sm">
                                ₹{order.revisedTotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Revised Line Items: Desktop Table (hidden sm:block) */}
                        <div className="mt-3 hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white rounded-xl border border-amber-200 overflow-hidden">
                            <thead className="bg-amber-100/60 text-amber-950 font-semibold border-b border-amber-200">
                              <tr>
                                <th className="p-2.5">Product</th>
                                <th className="p-2.5 text-center">Requested</th>
                                <th className="p-2.5 text-center">Approved</th>
                                <th className="p-2.5 text-right">Unit Price</th>
                                <th className="p-2.5 text-right">Item Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {order.items.map((item) => (
                                <tr
                                  key={item.productId}
                                  className={!item.isAvailable || item.approvedQuantity === 0 ? 'bg-rose-50/40 text-stone-400' : ''}
                                >
                                  <td className="p-2.5 font-medium text-stone-900">
                                    {item.productName}
                                    {(!item.isAvailable || item.approvedQuantity === 0) && (
                                      <span className="block text-[10px] text-rose-600 font-bold uppercase">
                                        Unavailable in workshop
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center font-mono">{item.requestedQuantity}</td>
                                  <td className="p-2.5 text-center font-mono font-bold text-amber-800">
                                    {item.approvedQuantity}
                                  </td>
                                  <td className="p-2.5 text-right font-mono">₹{item.unitPrice}</td>
                                  <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                                    ₹{item.itemTotal.toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-stone-50 border-t border-stone-200 text-xs font-semibold">
                              <tr>
                                <td colSpan={4} className="p-2.5 text-right text-stone-600">Original Total:</td>
                                <td className="p-2.5 text-right font-mono line-through text-stone-400">
                                  ₹{order.originalTotal.toLocaleString('en-IN')}
                                </td>
                              </tr>
                              <tr className="bg-amber-100/50">
                                <td colSpan={4} className="p-2.5 text-right font-bold text-stone-900 font-cinzel">
                                  Revised Total:
                                </td>
                                <td className="p-2.5 text-right font-mono font-extrabold text-[#701A1E] text-sm">
                                  ₹{order.revisedTotal.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Customer Decision Buttons */}
                        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <button
                            onClick={() => handleConfirmRevision(order.id, order.orderNumber)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm Revised Order (₹{order.revisedTotal.toLocaleString('en-IN')})</span>
                          </button>

                          <button
                            onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                            className="py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel Order</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50/50 space-y-5">
                    {/* Items List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                        Order Line Items Snapshot
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23701A1E"/></svg>';
                                }}
                              />
                              <div>
                                <p className="text-xs font-semibold text-stone-900 line-clamp-1">
                                  {item.productName}
                                </p>
                                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                                  Qty: {item.approvedQuantity} (Requested: {item.requestedQuantity}) · ₹{item.unitPrice} each
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-stone-900 font-mono">
                              ₹{item.itemTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                        <p className="font-bold text-stone-900 mb-1">Delivery Destination</p>
                        <p className="text-stone-600 leading-relaxed">{order.deliveryAddress}</p>
                        <p className="text-[11px] text-stone-500 mt-2">
                          Recipient: <span className="text-stone-800 font-medium">{order.customerName}</span> ({order.customerPhone})
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                        <p className="font-bold text-stone-900 mb-1">Order Notes &amp; Fulfillment</p>
                        <p className="text-stone-600 italic">
                          {order.customerNotes || 'No special pooja instructions provided.'}
                        </p>
                        {order.supplierName && (
                          <p className="text-[11px] text-stone-500 mt-2">
                            Assigned Artisan: <span className="text-stone-800 font-medium">{order.supplierName}</span>
                          </p>
                        )}
                        {order.rejectionReason && (
                          <p className="text-[11px] text-rose-700 font-medium mt-1">
                            Reason for rejection: {order.rejectionReason}
                          </p>
                        )}
                        <div className="mt-3 pt-2 border-t border-stone-100 flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                          <a
                            href={generateWhatsAppOrderUrl(order, shopSettings?.whatsappNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition flex-1 text-center shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Share on WhatsApp</span>
                          </a>
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-medium text-xs transition cursor-pointer flex-1 bg-white shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#701A1E] shrink-0" />
                            <span>View Slip</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status History Timeline (Feature 6) */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                        Status History &amp; Decision Audit Log
                      </h4>
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                        {order.statusHistory.map((hist, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#701A1E] mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-stone-900">
                                  {hist.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {new Date(hist.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-stone-600 text-[11px] mt-0.5">{hist.notes}</p>
                              <span className="text-[10px] text-stone-400">
                                Actor: {hist.actorName} ({hist.actorRole})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Universal Responsive Pagination Controls */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-white">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={visibleOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          shopSettings={shopSettings}
        />
      )}
    </div>
  );
};
