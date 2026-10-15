import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  CheckCircle,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  KeyRound,
  Shield,
  AlertCircle,
  ExternalLink,
  Bell,
  Smartphone,
  Send,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatWhatsAppNumber } from '../../utils/whatsapp';

interface ShopSettingsViewProps {
  settings: ShopSettings;
  onSave: (newSettings: ShopSettings) => void;
}

export const ShopSettingsView: React.FC<ShopSettingsViewProps> = ({
  settings,
  onSave,
}) => {
  const { fcmDispatchLogs, sendTestFCMNotification, allUsers } = useApp();
  const [form, setForm] = useState<ShopSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedCustomerForTest, setSelectedCustomerForTest] = useState<string>('');

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = formatWhatsAppNumber(form.whatsappNumber);
    const updated = {
      ...form,
      whatsappNumber: formattedPhone,
    };
    setForm(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#701A1E]" />
            <span>Store Configuration &amp; Contact Settings</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure your official WhatsApp number, shop address, payment UPI ID, and staff PINs.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Store settings and WhatsApp number updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5 text-xs">
        {/* Section 1: Store & Contact Information */}
        <div>
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#701A1E]" />
            <span>Business Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Business Number *</span>
                </span>
                {form.whatsappNumber && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-bold">
                    wa.me/{formatWhatsAppNumber(form.whatsappNumber)}
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9845012345 or 919845012345"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                />
                {form.whatsappNumber && (
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(form.whatsappNumber)}?text=${encodeURIComponent('Hello Mantralaya Arts! Testing WhatsApp connection.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 shrink-0 transition"
                    title="Test WhatsApp Link in new tab"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                All customer orders shared via WhatsApp will open a chat with this number. Enter 10 digits (India +91 is added automatically) or full international format.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Support Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Temple Store &amp; Workshop Address (printed on receipts)</span>
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Section 2: Payments & UPI */}
        <div>
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#701A1E]" />
            <span>Payment &amp; UPI Coordination</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Store UPI VPA / ID (e.g. mantralaya@oksbi)</label>
              <input
                type="text"
                value={form.upiId || ''}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                placeholder="mantralayaarts@upi"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dispatch Notice for Customers</label>
              <input
                type="text"
                value={form.dispatchNote || ''}
                onChange={(e) => setForm({ ...form, dispatchNote: e.target.value })}
                placeholder="e.g. All sacred items packed in consecrated boxes with prasadam."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Staff Security PINs */}
        <div>
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3 pb-2 border-b border-stone-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#701A1E]" />
            <span>Staff Portal Access PINs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Administrator PIN</label>
              <input
                type="text"
                maxLength={6}
                value={form.staffAdminPin || '1008'}
                onChange={(e) => setForm({ ...form, staffAdminPin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono tracking-widest"
              />
              <p className="text-[10px] text-stone-400 mt-1">Default: 1008</p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Supplier / Artisan PIN</label>
              <input
                type="text"
                maxLength={6}
                value={form.staffSupplierPin || '1234'}
                onChange={(e) => setForm({ ...form, staffSupplierPin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono tracking-widest"
              />
              <p className="text-[10px] text-stone-400 mt-1">Default: 1234</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>

      {/* Section 4: Firebase Cloud Messaging (FCM) Integration Console */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#701A1E]" />
              <span>Firebase Cloud Messaging (FCM) Status &amp; Dispatch Console</span>
            </h3>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Automated push notification engine that alerts customers instantly when their order workflow stage updates.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>FCM Live Connected</span>
          </span>
        </div>

        {/* Integration Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <p className="text-[10px] text-stone-400 font-bold uppercase">Firebase Project</p>
            <p className="font-mono font-bold text-stone-800 text-xs mt-0.5">watchful-artwork-f8f9p</p>
            <p className="text-[10px] text-stone-500 mt-1">GCP Cloud Messaging Channel</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <p className="text-[10px] text-stone-400 font-bold uppercase">Messaging Sender ID</p>
            <p className="font-mono font-bold text-stone-800 text-xs mt-0.5">253533122716</p>
            <p className="text-[10px] text-stone-500 mt-1">Web Push Protocol</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <p className="text-[10px] text-stone-400 font-bold uppercase">FCM Service Worker</p>
            <p className="font-mono font-bold text-stone-800 text-xs mt-0.5">/firebase-messaging-sw.js</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active &amp; Background Ready</p>
          </div>
        </div>

        {/* Automated Workflow Triggers Summary */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
          <h4 className="font-bold text-amber-950 text-xs mb-2 flex items-center gap-1.5 font-cinzel">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Automated Customer Workflow Triggers</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-amber-900">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span><strong>Order Placed:</strong> Customer receipt confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span><strong>Accepted:</strong> Workshop approval push</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span><strong>Adjusted:</strong> Quantity revision alert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span><strong>Confirmed:</strong> Devotee agreement logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span><strong>Dispatched:</strong> Sacred tracking notification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span><strong>Delivered:</strong> Blessing arrival confirmation</span>
            </div>
          </div>
        </div>

        {/* Admin Test Push Dispatcher */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#701A1E]" />
              <span>Trigger Test FCM Push Notification</span>
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Send a real-time test notification to verify client service worker delivery and audible bell chime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCustomerForTest}
              onChange={(e) => setSelectedCustomerForTest(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none"
            >
              <option value="">Current Devotee / Test Device</option>
              {allUsers.filter((u) => u.role === 'CUSTOMER').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.id}) {c.fcmToken ? '• FCM Active' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={isSendingTest}
              onClick={async () => {
                setIsSendingTest(true);
                setTestPushStatus(null);
                const res = await sendTestFCMNotification(selectedCustomerForTest || undefined);
                setIsSendingTest(false);
                if (res.success) {
                  setTestPushStatus('✅ Push notification successfully dispatched to target customer device!');
                } else {
                  setTestPushStatus(`Notice: ${res.error || 'Failed to dispatch'}`);
                }
                setTimeout(() => setTestPushStatus(null), 5000);
              }}
              className="px-4 py-2 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSendingTest ? 'Sending...' : 'Send Test Push'}</span>
            </button>
          </div>
        </div>

        {testPushStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {testPushStatus}
          </div>
        )}

        {/* Live FCM Push Dispatch Audit Log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Recent FCM Push Notification Dispatches ({fcmDispatchLogs.length})</span>
            </h4>
            <span className="text-[10px] text-stone-400">Stored in Firestore fcm_dispatches</span>
          </div>

          {fcmDispatchLogs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-stone-500 text-xs">
              No FCM push notifications dispatched yet. Try sending a test push above or changing an order status in Supplier Fulfillment.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] font-semibold border-b border-stone-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Order</th>
                    <th className="p-2.5">Workflow Stage</th>
                    <th className="p-2.5">Recipient</th>
                    <th className="p-2.5">Title &amp; Body</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {fcmDispatchLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/60">
                      <td className="p-2.5 text-stone-400 font-mono text-[10px] whitespace-nowrap">
                        {new Date(log.dispatchedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-stone-800 whitespace-nowrap">
                        #{log.orderNumber}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                          {log.stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-stone-800 whitespace-nowrap">
                        {log.recipientName}
                      </td>
                      <td className="p-2.5 text-stone-600 max-w-xs truncate">
                        <span className="font-semibold text-stone-900 block truncate">{log.title}</span>
                        <span className="text-[11px] text-stone-500 block truncate">{log.body}</span>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
