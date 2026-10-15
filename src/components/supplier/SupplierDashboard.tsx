import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { PartialAcceptModal } from './PartialAcceptModal';
import { PaginationControls } from '../common/PaginationControls';
import {
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Bell,
  Send,
  PackageCheck,
} from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const {
    orders,
    currentUser,
    allUsers,
    supplierAcceptOrder,
    supplierRejectOrder,
    supplierPartiallyAcceptOrder,
    supplierUpdateOrderStatus,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [partialModalOrder, setPartialModalOrder] = useState<Order | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination State (Defaults to 20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Supplier sees orders assigned or authorized
  const supplierOrders = orders.filter((o) => {
    // Status filter
    if (statusFilter !== 'ALL' && o.currentStatus !== statusFilter) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      return matchNum || matchCust || matchPhone;
    }
    return true;
  });

  const totalPages = Math.ceil(supplierOrders.length / pageSize) || 1;
  const paginatedOrders = supplierOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // KPI counts
  const pendingCount = orders.filter((o) => o.currentStatus === 'PENDING_SUPPLIER_REVIEW').length;
  const acceptedCount = orders.filter((o) => o.currentStatus === 'ACCEPTED' || o.currentStatus === 'CONFIRMED_BY_CUSTOMER').length;
  const partialCount = orders.filter((o) => o.currentStatus === 'PARTIALLY_ACCEPTED' || o.currentStatus === 'AWAITING_CUSTOMER_CONFIRMATION').length;
  const rejectedCount = orders.filter((o) => o.currentStatus === 'REJECTED').length;

  const handleFullAccept = (order: Order) => {
    const res = supplierAcceptOrder(order.id, 'Order accepted in full. Artisan workshop stock allocated.');
    if (res.success) {
      setSuccessMessage(`Order #${order.orderNumber} successfully accepted!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    if (!rejectionReasonInput.trim()) return;

    const res = supplierRejectOrder(rejectingOrder.id, rejectionReasonInput);
    if (res.success) {
      setSuccessMessage(`Order #${rejectingOrder.orderNumber} declined with reason provided.`);
      setRejectingOrder(null);
      setRejectionReasonInput('');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handlePartialSubmit = (
    itemApprovals: { productId: string; approvedQuantity: number }[],
    notes: string
  ) => {
    if (!partialModalOrder) return;
    const res = supplierPartiallyAcceptOrder(partialModalOrder.id, itemApprovals, notes);
    if (res.success) {
      setSuccessMessage(`Order #${partialModalOrder.orderNumber} partially accepted and proposal dispatched to customer!`);
      setPartialModalOrder(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleMarkShipped = (order: Order) => {
    const res = supplierUpdateOrderStatus(order.id, 'SHIPPED', 'Sacred idols and items dispatched via express delivery.');
    if (res.success) {
      setSuccessMessage(`Order #${order.orderNumber} marked Dispatched. Customer notified via Firebase Cloud Messaging!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleMarkDelivered = (order: Order) => {
    const res = supplierUpdateOrderStatus(order.id, 'DELIVERED', 'Consignment delivered to customer sanctum.');
    if (res.success) {
      setSuccessMessage(`Order #${order.orderNumber} marked Delivered. Customer notified via Firebase Cloud Messaging!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28">
      {/* Header Banner */}
      <div className="bg-[#581216] rounded-3xl p-6 text-amber-50 shadow-md border border-amber-600/30 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                Supplier Fulfillment Console
              </h1>
              <p className="text-xs text-amber-200/80">
                Active Supplier: <strong className="text-white">{currentUser.fullName}</strong> · Mantralaya Brass &amp; Pooja Workshop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-200/70">Assigned Orders:</span>
            <span className="font-mono text-xs font-bold text-stone-900 bg-amber-400 px-2.5 py-0.5 rounded-full">
              {orders.length} Total
            </span>
          </div>
        </div>

        {/* Supplier KPIs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-600/30">
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Pending Review</p>
            <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">{pendingCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Accepted / Confirmed</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{acceptedCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Partially Accepted</p>
            <p className="text-xl font-bold font-mono text-amber-200 mt-0.5">{partialCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Rejected</p>
            <p className="text-xl font-bold font-mono text-rose-300 mt-0.5">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Orders', count: orders.length },
            { id: 'PENDING_SUPPLIER_REVIEW', label: 'Pending Review', count: pendingCount },
            { id: 'ACCEPTED', label: 'Accepted', count: acceptedCount },
            { id: 'AWAITING_CUSTOMER_CONFIRMATION', label: 'Partial / Awaiting', count: partialCount },
            { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#701A1E] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-100 text-stone-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by order #, customer, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#701A1E]"
          />
        </div>
      </div>

      {/* Orders List */}
      {supplierOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-6">
          <Truck className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-cinzel text-base font-bold text-stone-900">No Orders in this View</h3>
          <p className="text-xs text-stone-500 mt-1">There are no orders matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isPending = order.currentStatus === 'PENDING_SUPPLIER_REVIEW';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                  isPending ? 'border-amber-400 ring-2 ring-amber-200/50' : 'border-stone-200'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-stone-50/60 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#701A1E] flex items-center justify-center font-bold text-xs shrink-0">
                      #{order.orderNumber.replace('MA-', '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          Order #{order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : order.currentStatus === 'ACCEPTED' || order.currentStatus === 'CONFIRMED_BY_CUSTOMER'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.currentStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {order.currentStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>Submitted {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-stone-500">Order Requested Value</p>
                    <p className="text-base font-extrabold text-[#701A1E] font-mono">
                      ₹{order.originalTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Customer & Delivery Context */}
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-stone-400 font-semibold uppercase text-[10px]">Customer Contact</p>
                      {allUsers.some((u) => u.id === order.customerId && u.fcmToken) ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                          <Bell className="w-2.5 h-2.5 text-emerald-600" />
                          FCM Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded-full">
                          FCM Standby
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-stone-900">{order.customerName}</p>
                    <p className="text-stone-600 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-stone-400 font-semibold uppercase text-[10px]">Delivery Address &amp; Puja Notes</p>
                    <p className="text-stone-700 leading-relaxed flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                    {order.customerNotes && (
                      <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg mt-1 italic">
                        Note: &ldquo;{order.customerNotes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Products Table */}
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Requested Items Snapshot ({order.items.length})
                  </p>
                  {/* Mobile Stacked Items (sm:hidden) */}
                  <div className="sm:hidden space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-stone-50/70 p-3 rounded-2xl border border-stone-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23701A1E"/></svg>';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-stone-900 line-clamp-1">{item.productName}</p>
                            <span className="font-mono text-stone-500 text-[11px]">₹{item.unitPrice} each</span>
                          </div>
                          <span className="font-mono font-bold text-stone-900 text-xs">
                            ₹{item.itemTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-200/60">
                          <span className="text-stone-500">
                            Req: <strong className="font-mono text-stone-800">{item.requestedQuantity}</strong>
                          </span>
                          <span className="text-amber-800 font-semibold">
                            Approved: <strong className="font-mono">{item.approvedQuantity}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (hidden sm:block) */}
                  <div className="hidden sm:block border border-stone-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">Product</th>
                          <th className="p-2.5 text-center">Req. Qty</th>
                          <th className="p-2.5 text-center">Approved Qty</th>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {order.items.map((item) => (
                          <tr key={item.productId} className="hover:bg-stone-50/50">
                            <td className="p-2.5 font-medium text-stone-900 flex items-center gap-2">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover bg-stone-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23701A1E"/></svg>';
                                }}
                              />
                              <span className="line-clamp-1">{item.productName}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold">{item.requestedQuantity}</td>
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
                    </table>
                  </div>
                </div>

                {/* Action Buttons for Pending Review (Feature 5) */}
                {isPending && (
                  <div className="bg-amber-50/70 p-4 sm:p-5 border-t border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Review inventory availability and choose action:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Action 1: Accept Full Order */}
                      <button
                        onClick={() => handleFullAccept(order)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Full Order</span>
                      </button>

                      {/* Action 2: Partially Accept Order */}
                      <button
                        onClick={() => setPartialModalOrder(order)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#701A1E]" />
                        <span>Partially Accept</span>
                      </button>

                      {/* Action 3: Reject Order */}
                      <button
                        onClick={() => setRejectingOrder(order)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Order</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Accepted / Confirmed Orders (Dispatch Workflow with FCM Push) */}
                {(order.currentStatus === 'ACCEPTED' || order.currentStatus === 'CONFIRMED_BY_CUSTOMER') && (
                  <div className="bg-emerald-50/70 p-4 sm:p-5 border-t border-emerald-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
                      <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Order approved. Dispatching triggers instant Firebase push notification to customer:</span>
                    </div>

                    <button
                      onClick={() => handleMarkShipped(order)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Order (FCM Push)</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons for Shipped Orders (Deliver Workflow with FCM Push) */}
                {order.currentStatus === 'SHIPPED' && (
                  <div className="bg-indigo-50/70 p-4 sm:p-5 border-t border-indigo-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-indigo-950 font-medium">
                      <PackageCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <span>Sacred package in transit. Confirm customer delivery:</span>
                    </div>

                    <button
                      onClick={() => handleMarkDelivered(order)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Delivered (FCM Push)</span>
                    </button>
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
              totalItems={supplierOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}

      {/* Partial Acceptance Modal */}
      {partialModalOrder && (
        <PartialAcceptModal
          order={partialModalOrder}
          onClose={() => setPartialModalOrder(null)}
          onSubmit={handlePartialSubmit}
        />
      )}

      {/* Rejection Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 font-cinzel flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5" />
              <span>Decline Order #{rejectingOrder.orderNumber}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4">
              Please enter the specific reason for rejecting this order so the customer is properly notified.
            </p>

            <form onSubmit={handleConfirmReject}>
              <textarea
                required
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Raw brass casting materials temporarily out of stock; unable to manufacture before delivery date..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingOrder(null);
                    setRejectionReasonInput('');
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
