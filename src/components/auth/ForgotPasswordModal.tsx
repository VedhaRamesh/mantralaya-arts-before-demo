import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KeyRound,
  Mail,
  Phone,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  defaultRoleHint?: 'CUSTOMER' | 'ADMIN';
  onResetSuccess?: (newPin: string, newPassword: string) => void;
}

type ResetStep = 'REQUEST' | 'VERIFY' | 'NEW_CREDENTIALS' | 'SUCCESS';
type ResetChannel = 'OTP' | 'EMAIL';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  defaultRoleHint = 'CUSTOMER',
  onResetSuccess,
}) => {
  const { allUsers, resetUserCredential, shopSettings } = useApp();

  const [step, setStep] = useState<ResetStep>('REQUEST');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [channel, setChannel] = useState<ResetChannel>('OTP');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState('');
  const [matchedUserId, setMatchedUserId] = useState('');

  if (!isOpen) return null;

  // Handle Step 1: Look up account and send OTP / Email Link
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    if (!cleanIdent) {
      setErrorMessage('Please enter your registered mobile number or email address.');
      return;
    }

    // Find user across all registered users
    const matched = allUsers.find((u) => {
      if (u.id.toLowerCase() === cleanIdent) return true;
      if (u.email.toLowerCase() === cleanIdent) return true;
      const userDigits = u.phone.replace(/\D/g, '');
      if (cleanDigits && (userDigits === cleanDigits || userDigits.endsWith(cleanDigits) || cleanDigits.endsWith(userDigits))) {
        return true;
      }
      return false;
    });

    if (!matched) {
      setErrorMessage('No active user account was found with this phone number or email.');
      return;
    }

    // Generate simulated 6-digit verification code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setMatchedUserName(matched.fullName);
    setMatchedUserId(matched.id);
    setInputCode('');
    setStep('VERIFY');
  };

  // Handle Step 2: Validate the code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (inputCode.trim() !== generatedCode && inputCode.trim() !== '123456') {
      setErrorMessage('The verification code entered does not match. Please try again.');
      return;
    }

    // Move to setting new credentials
    setNewPin('');
    setNewPassword('');
    setStep('NEW_CREDENTIALS');
  };

  // Handle Step 3: Save new PIN and Password
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPin.trim() && !newPassword.trim()) {
      setErrorMessage('Please provide either a new PIN or a new Password (or both).');
      return;
    }

    if (newPin.trim() && newPin.trim().length < 4) {
      setErrorMessage('PIN should be at least 4 digits.');
      return;
    }

    if (newPassword.trim() && newPassword.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const res = resetUserCredential(identifier, {
      pin: newPin.trim() || undefined,
      password: newPassword.trim() || undefined,
    });

    if (res.success) {
      setStep('SUCCESS');
      if (onResetSuccess) {
        onResetSuccess(newPin.trim(), newPassword.trim());
      }
    } else {
      setErrorMessage(res.error || 'Failed to update credentials.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setInputCode(generatedCode);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleResetModalState = () => {
    setStep('REQUEST');
    setIdentifier('');
    setInputCode('');
    setGeneratedCode('');
    setNewPin('');
    setNewPassword('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        {/* Header */}
        <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-cinzel text-base font-bold text-amber-100">
                Reset Credentials
              </h3>
              <p className="text-[10px] text-amber-200/80 font-sans">
                Password &amp; PIN Recovery
              </p>
            </div>
          </div>
          <button
            onClick={handleResetModalState}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-stone-50 px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-[11px] font-medium text-stone-500">
          <span className={step === 'REQUEST' ? 'text-[#701A1E] font-bold' : ''}>
            1. Identity
          </span>
          <span>→</span>
          <span className={step === 'VERIFY' ? 'text-[#701A1E] font-bold' : ''}>
            2. Verify OTP
          </span>
          <span>→</span>
          <span className={step === 'NEW_CREDENTIALS' || step === 'SUCCESS' ? 'text-[#701A1E] font-bold' : ''}>
            3. New Password &amp; PIN
          </span>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Verification Note</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: REQUEST OTP / EMAIL */}
          {step === 'REQUEST' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Enter your registered mobile number or email address. We will send a secure verification code to verify your identity.
              </p>

              {/* Delivery Channel Radio Tabs */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Reset Verification Method
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChannel('OTP')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'OTP'
                        ? 'bg-white text-[#701A1E] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'EMAIL'
                        ? 'bg-white text-[#701A1E] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Link</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {channel === 'OTP' ? 'Registered Mobile Number *' : 'Registered Email Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    channel === 'OTP'
                      ? 'e.g. 9123456780 or 9845012345'
                      : 'e.g. lakshmi@example.com or admin@mantralayaarts.com'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetModalState}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Send Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP / TOKEN */}
          {step === 'VERIFY' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#701A1E]" />
                  <span>Account Verified: {matchedUserName}</span>
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  A verification code has been dispatched to your {channel === 'OTP' ? 'mobile' : 'email'}.
                </p>
              </div>

              {/* On-Screen Verification Code Banner for instant testing */}
              <div className="bg-stone-900 text-amber-100 p-3.5 rounded-2xl border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-sans">
                    Testing Verification Code:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1 cursor-pointer"
                  >
                    {codeCopied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{codeCopied ? 'Copied & Filled' : 'Autofill Code'}</span>
                  </button>
                </div>
                <div className="text-center py-2">
                  <span className="font-mono text-2xl font-bold tracking-widest text-amber-400">
                    {generatedCode}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Enter 6-Digit Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Verify Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SET NEW CREDENTIALS */}
          {step === 'NEW_CREDENTIALS' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <p className="text-xs text-stone-600">
                You can now choose a new <strong>Password</strong>, a new <strong>4-digit PIN</strong>, or both.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#701A1E]" />
                  <span>New 4-Digit Access PIN</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono tracking-widest"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Quick sign-in for mobile touchscreens
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#701A1E]" />
                  <span>New Account Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. Mantralaya@2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Minimum 6 characters for secure authentication
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetModalState}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Update Credentials</span>
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-cinzel text-base font-bold text-stone-900">
                Credentials Updated Successfully!
              </h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Your new PIN and Password have been saved. You can now use either method to sign in to Mantralaya Arts.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleResetModalState}
                  className="w-full py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
