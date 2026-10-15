import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    // Show a clean helper banner in desktop/other browsers offering PWA or manual prompt
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-[#581216] via-[#701A1E] to-[#800020] text-amber-50 px-3 sm:px-4 py-2 sm:py-3 shadow-md border-b border-amber-500/20 overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-white truncate">
                Install Mantralaya Arts
              </p>
              <p className="hidden sm:block text-[11px] text-amber-200/80 truncate">
                Fast mobile access, offline catalog browsing &amp; instant notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs shadow-sm transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">Install</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-medium text-xs transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">iOS Setup</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 sm:p-1.5 text-amber-300/60 hover:text-white rounded-md transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#701A1E] mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-cinzel">Install on iPhone / iPad</h3>
            <p className="text-xs text-stone-600 mt-1 mb-4">
              Follow these simple steps in Safari to add Mantralaya Arts to your Home Screen:
            </p>

            <ol className="space-y-3 text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#701A1E] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong className="text-stone-900">Share</strong> button in the bottom Safari toolbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#701A1E] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong className="text-stone-900">Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#701A1E] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong className="text-stone-900">Add</strong> in the top-right corner to finish.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#701A1E] text-white font-medium text-xs hover:bg-[#581216] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
