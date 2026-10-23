import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Bookmark,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithDemoClient,
    loading,
    authError,
    clearAuthError,
  } = useAuth();

  const [copied, setCopied] = useState(false);

  if (!isAuthModalOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain =
    authError === 'auth/unauthorized-domain' ||
    Boolean(authError?.toLowerCase().includes('unauthorized-domain'));

  const handleCopyHostname = async () => {
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#2C302A] bg-[#141613] p-6 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-[#8A8E85] hover:text-[#F5F5F0] rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C8FF45]/30 bg-[#C8FF45]/10 px-3 py-1 text-xs font-mono font-medium text-[#C8FF45]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CLIENT CREATIVE PORTAL</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#F5F5F0]">
              Sign in to E-tech Visuals
            </h3>
            <p className="text-sm text-[#A0A59C]">
              Sync your project consultations, curate custom concept moodboards, and collaborate seamlessly with our design team.
            </p>
          </div>

          {/* Perks list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-xs text-[#C5C8C1] rounded-lg bg-[#191B18] p-2.5 border border-[#2C302A]">
              <Calendar className="h-4 w-4 text-[#C8FF45] shrink-0" />
              <span>Track & manage your scheduled 30-minute creative calls</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#C5C8C1] rounded-lg bg-[#191B18] p-2.5 border border-[#2C302A]">
              <Bookmark className="h-4 w-4 text-[#38bdf8] shrink-0" />
              <span>Bookmark design inspirations to your personal moodboard</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#C5C8C1] rounded-lg bg-[#191B18] p-2.5 border border-[#2C302A]">
              <ShieldCheck className="h-4 w-4 text-[#e0b84c] shrink-0" />
              <span>Fast 1-click authentication with cloud data persistence</span>
            </div>
          </div>

          {/* Unauthorized Domain Diagnostic Card */}
          {isUnauthorizedDomain ? (
            <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">Firebase Domain Authorization Required</p>
                  <p className="text-[#C5C8C1] leading-relaxed">
                    Google Sign-In restricts popups to authorized domains. In Firebase Console, add this preview domain under <strong className="text-white">Authentication &gt; Settings &gt; Authorized domains</strong>:
                  </p>
                </div>
              </div>

              {/* Copyable Domain Box */}
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#101110] border border-[#2C302A] px-3 py-2">
                <code className="font-mono text-[11px] text-[#C8FF45] truncate select-all">
                  {currentHostname}
                </code>
                <button
                  type="button"
                  onClick={handleCopyHostname}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-mono text-[#8A8E85] hover:text-[#F5F5F0] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#C8FF45]" />
                      <span className="text-[#C8FF45]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons for resolving or bypassing */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0505194944/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2C302A] bg-[#191B18] px-3 py-2 text-[11px] font-semibold text-[#F5F5F0] hover:border-[#C8FF45] transition-colors text-center cursor-pointer"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <button
                  type="button"
                  onClick={() => signInWithDemoClient()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C8FF45] px-3 py-2 text-[11px] font-bold text-[#101110] hover:bg-[#bbf033] transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Enter as Demo Client</span>
                </button>
              </div>
            </div>
          ) : authError ? (
            <div className="mb-4 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-300 flex items-center justify-between">
              <span>{authError}</span>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-[#8A8E85] hover:text-white p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-4 py-3.5 text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {/* Google G Logo */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Instant Demo Client Access Button */}
            <button
              type="button"
              onClick={() => signInWithDemoClient('Client Preview', 'client.preview@example.com')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2C302A] bg-[#191B18] hover:border-[#38bdf8] text-[#C5C8C1] hover:text-[#38bdf8] font-medium px-4 py-2.5 text-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Instant Client Preview</span>
            </button>

            <button
              onClick={closeAuthModal}
              className="w-full text-center text-xs text-[#8A8E85] hover:text-[#C5C8C1] py-1 transition-colors cursor-pointer"
            >
              Continue browsing portfolio as guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
