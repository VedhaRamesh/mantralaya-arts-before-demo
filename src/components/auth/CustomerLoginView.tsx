import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Phone,
  KeyRound,
  Shield,
  MessageCircle,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Lock,
  UserCheck,
  Building,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { BrandLogo } from '../common/BrandLogo';

interface CustomerLoginViewProps {
  onOpenStaffModal: () => void;
  onLoginSuccess?: () => void;
}

export const CustomerLoginView: React.FC<CustomerLoginViewProps> = ({
  onOpenStaffModal,
  onLoginSuccess,
}) => {
  const { customerLogin, shopSettings, allUsers } = useApp();

  const [authMethod, setAuthMethod] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [showCredential, setShowCredential] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Available customer profiles created by admin
  const customerProfiles = allUsers.filter((u) => u.role === 'CUSTOMER' && u.status === 'ACTIVE');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = customerLogin(identifier, credential, authMethod);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setErrorMessage(result.error || 'Invalid credentials. Please verify with your store administrator.');
    }
    setIsSubmitting(false);
  };

  const handleQuickFill = (userPhone: string, userPin: string, userPassword?: string) => {
    setIdentifier(userPhone);
    const chosenCred = authMethod === 'PASSWORD' ? (userPassword || 'Lakshmi@123') : userPin;
    setCredential(chosenCred);
    setErrorMessage(null);

    // Auto-login for seamless testing
    const result = customerLogin(userPhone, chosenCred, authMethod);
    if (result.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const adminWhatsAppUrl = `https://wa.me/${formatWhatsAppNumber(
    shopSettings?.whatsappNumber
  )}?text=${encodeURIComponent(
    'Namaskara Mantralaya Arts! I would like to request an authorized customer account and access PIN to order temple items.'
  )}`;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE0]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-900/10 overflow-hidden">
        {/* Sacred Header Banner */}
        <div className="bg-[#701A1E] text-amber-50 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <BrandLogo size="lg" className="justify-center mb-3" />

          <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-amber-100">
            MANTRALAYA ARTS
          </h2>
          <p className="text-[11px] text-amber-200/80 uppercase tracking-widest font-sans mt-0.5">
            Devotee &amp; Customer Portal
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-amber-400/20 text-[10px] text-amber-200">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Customer Login is Mandatory</span>
          </div>
        </div>

        {/* Notice: Admin Created Accounts */}
        <div className="bg-amber-50/80 border-b border-amber-100 px-5 py-3 text-[11px] text-amber-900 flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Notice:</strong> Customer accounts are registered and authorized exclusively by the Mantralaya Arts administrator. Self-registration is disabled.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Dual-Method Selector: PIN vs Password */}
          <div>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PIN');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'PIN'
                    ? 'bg-white text-[#701A1E] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign in with PIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PASSWORD');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'PASSWORD'
                    ? 'bg-white text-[#701A1E] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in with Password</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#701A1E]" />
                <span>Registered Mobile Number, Email, or Customer ID *</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9123456780, lakshmi@example.com, or USR-CUST-1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  {authMethod === 'PIN' ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[#701A1E]" />
                      <span>Admin-Assigned Access PIN *</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#701A1E]" />
                      <span>Account Password *</span>
                    </>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#701A1E] hover:text-[#581216] font-medium underline cursor-pointer"
                >
                  Forgot {authMethod === 'PIN' ? 'PIN?' : 'Password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showCredential ? 'text' : 'password'}
                  required
                  maxLength={authMethod === 'PIN' ? 8 : 40}
                  inputMode={authMethod === 'PIN' ? 'numeric' : 'text'}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={authMethod === 'PIN' ? 'Enter your 4-digit PIN' : 'Enter your password'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none ${
                    authMethod === 'PIN' ? 'font-mono tracking-widest' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCredential(!showCredential)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition"
                >
                  {showCredential ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#701A1E] hover:bg-[#581216] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Sign In with {authMethod === 'PIN' ? 'Access PIN' : 'Password'}</span>
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          {customerProfiles.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin-Created Customer Accounts (1-Click Test)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customerProfiles.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleQuickFill(cust.phone, cust.accessPin || '1234', cust.password)}
                    className="p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900 group-hover:text-[#701A1E]">
                        {cust.fullName}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-stone-500 font-mono">
                      <span>Ph: {cust.phone}</span>
                      <span className="text-amber-800 font-bold">
                        {authMethod === 'PIN' ? `PIN: ${cust.accessPin || '1234'}` : `PW: ${cust.password || 'Lakshmi@123'}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Need an Account or Staff Login */}
          <div className="pt-4 border-t border-stone-100 bg-stone-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-4 h-4 text-[#701A1E]" />
              <span>Don't Have an Account Yet?</span>
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
              To place orders for sacred temple pooja items, our administrator must set up your devotee profile. Contact our temple desk:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Request via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onOpenStaffModal}
                className="py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#701A1E]" />
                <span>Staff &amp; Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password / PIN Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialIdentifier={identifier}
        defaultRoleHint="CUSTOMER"
        onResetSuccess={(newPin, newPassword) => {
          setCredential(authMethod === 'PIN' ? newPin : newPassword);
          setShowForgotModal(false);
        }}
      />
    </div>
  );
};
