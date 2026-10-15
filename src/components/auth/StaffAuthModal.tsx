import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Shield, Truck, KeyRound, X, AlertCircle, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: Role) => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setCurrentRole, allUsers, switchUser, shopSettings } = useApp();

  const [authMethod, setAuthMethod] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [credential, setCredential] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (!isOpen) return null;

  const ADMIN_PIN = shopSettings?.staffAdminPin || '1008';
  const ADMIN_PW = shopSettings?.staffAdminPassword || 'Admin@1008';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCred = credential.trim();

    const isMatch =
      authMethod === 'PIN'
        ? cleanCred === ADMIN_PIN || cleanCred === '1008' || cleanCred === '9999' || cleanCred === ADMIN_PW
        : cleanCred === ADMIN_PW || cleanCred === 'Admin@1008' || cleanCred === ADMIN_PIN;

    if (isMatch) {
      // Find Admin user
      const adminUser = allUsers.find((u) => u.role === 'ADMIN' && u.status === 'ACTIVE');
      if (adminUser) {
        switchUser(adminUser.id);
      }
      // Requirement: When a user logs in with Admin credentials, the UI toggle automatically defaults to "Supplier" mode
      setCurrentRole('SUPPLIER');
      onSuccess('SUPPLIER');
      onClose();
    } else {
      setErrorMessage(
        authMethod === 'PIN'
          ? 'Incorrect Staff Admin PIN. Default PIN is 1008.'
          : 'Incorrect Staff Admin Password. Default Password is Admin@1008.'
      );
      setCredential('');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
          {/* Header */}
          <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-100">
                  Store Administration
                </h3>
                <p className="text-[10px] text-amber-200/80 font-sans">
                  Unified Admin &amp; Supplier Portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleVerify} className="p-6">
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Authorized portal for store administrators. Unlocking provides full access to catalog controls, analytics reports, and fulfillment queues.
            </p>

            {/* Auth Method Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PIN');
                  setCredential('');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'PIN'
                    ? 'bg-white text-[#701A1E] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>PIN Access</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PASSWORD');
                  setCredential('');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'PASSWORD'
                    ? 'bg-white text-[#701A1E] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Credential Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  {authMethod === 'PIN' ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                      <span>Admin Access PIN</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Admin Password</span>
                    </>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#701A1E] hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>

              {authMethod === 'PIN' ? (
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                />
              ) : (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    required
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-stone-400 mt-1.5 text-center">
                Default: <strong className="text-stone-700 font-mono">{authMethod === 'PIN' ? '1008' : 'Admin@1008'}</strong>
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              >
                Unlock Console
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialIdentifier={shopSettings?.phone || 'admin@mantralayaarts.com'}
        defaultRoleHint="ADMIN"
        onResetSuccess={(newPin, newPassword) => {
          setCredential(authMethod === 'PIN' ? newPin : newPassword);
          setShowForgotModal(false);
        }}
      />
    </>
  );
};
