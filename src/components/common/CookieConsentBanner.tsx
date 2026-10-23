import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, X, Check, Settings, ChevronRight } from 'lucide-react';
import { trackActivity } from '../../lib/analytics';

const COOKIE_CONSENT_KEY = 'etech_cookie_consent_choice';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Small delay so page elements settle
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    } catch {}
    setIsVisible(false);
    trackActivity('cookie_consent', 'User accepted all cookies');
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    } catch {}
    setIsVisible(false);
    trackActivity('cookie_consent', 'User selected essential cookies only');
  };

  const handleSaveCustom = () => {
    const choice = analyticsEnabled ? 'all' : 'essential';
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {}
    setShowPreferences(false);
    setIsVisible(false);
    trackActivity('cookie_consent', `User saved custom preferences (analytics: ${analyticsEnabled})`);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Preferences"
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="rounded-2xl border border-[#2C302A] bg-[#141613]/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl shadow-black/80 text-xs text-[#C5C8C1]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2C302A]/80">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C8FF45]/15 text-[#C8FF45] border border-[#C8FF45]/30">
                  <Cookie className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Cookie & Activity Consent
                </span>
              </div>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="text-[#8A8E85] hover:text-[#F5F5F0] transition-colors p-1"
                aria-label="Dismiss cookie notice with essential cookies only"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            {!showPreferences ? (
              <div className="py-3.5 space-y-3">
                <p className="leading-relaxed text-[#F5F5F0]">
                  E-Tech Graphics uses cookies and interaction telemetry to monitor design system
                  performance, remember client moodboard selections, and provide studio administrators
                  with insights into user engagement.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#8A8E85]">
                  <span className="flex items-center gap-1 text-[#C8FF45]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin Audit Active</span>
                  </span>
                  <span>·</span>
                  <span>Session Telemetry</span>
                  <span>·</span>
                  <span>Zero 3rd-Party Ad Networks</span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C8FF45] hover:bg-[#bbf033] px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-[#101110] transition-all cursor-pointer shadow-md shadow-[#C8FF45]/15"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Accept All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEssentialOnly}
                    className="flex-1 inline-flex items-center justify-center rounded-xl border border-[#2C302A] bg-[#191B18] hover:border-[#C8FF45]/50 px-4 py-2.5 font-semibold text-xs text-[#F5F5F0] transition-all cursor-pointer"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="px-2.5 py-2.5 rounded-xl border border-[#2C302A] bg-[#101110] text-[#8A8E85] hover:text-[#F5F5F0] hover:border-[#C8FF45]/40 transition-colors inline-flex items-center justify-center"
                    title="Customize cookie settings"
                    aria-label="Customize cookie settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Detailed Custom Preferences */
              <div className="py-3.5 space-y-3.5 animate-in fade-in">
                <p className="text-[11px] text-[#8A8E85]">
                  Configure your tracking preferences. Essential cookies are required for user authentication and client portal state.
                </p>

                <div className="space-y-2.5 border-y border-[#2C302A] py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#F5F5F0]">Strictly Essential</p>
                      <p className="text-[11px] text-[#8A8E85]">Auth sessions, client hub & booking slots</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[#C8FF45] font-bold">Always On</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2C302A]/50">
                    <div>
                      <p className="font-semibold text-[#F5F5F0]">Studio Analytics & Activity</p>
                      <p className="text-[11px] text-[#8A8E85]">Tracks pages visited & portfolio clicks for studio admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-[#2C302A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C8FF45]" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPreferences(false)}
                    className="text-[#8A8E85] hover:text-[#F5F5F0] text-xs"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8FF45] px-4 py-2 font-bold text-xs text-[#101110] hover:bg-[#bbf033] transition-colors cursor-pointer"
                  >
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
