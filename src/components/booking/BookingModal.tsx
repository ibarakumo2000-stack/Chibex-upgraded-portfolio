import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Globe, Shield, ArrowRight, CheckCircle2, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { siteConfig } from '../../data/site-config';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToContact?: (topic?: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSwitchToContact,
}) => {
  const { currentUser, createBooking, openAuthModal } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Visitor's local timezone
  const [localTimezone, setLocalTimezone] = useState<string>('UTC');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('14:00');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !clientName) setClientName(currentUser.displayName);
      if (currentUser.email && !clientEmail) setClientEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setLocalTimezone(tz);
    } catch {
      setLocalTimezone('Local Time');
    }

    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Modal accessibility
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasConfiguredBookingUrl = Boolean(
    siteConfig.booking.url &&
    siteConfig.booking.url.trim().length > 0 &&
    siteConfig.booking.url.startsWith('http')
  );

  const handleSubmitSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. If user is authenticated, persist directly into Firestore
      if (currentUser) {
        await createBooking({
          userName: clientName,
          userEmail: clientEmail,
          serviceInterest: '30-Minute Creative Strategy Session',
          date: bookingDate,
          timeSlot: `${bookingTime} (${localTimezone})`,
          notes: notes,
        });
      }

      // 2. Also send slot request to server endpoint
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: clientName,
          email: clientEmail,
          serviceNeeded: '30-Minute Discovery Call',
          budgetRange: 'Introductory Consultation',
          preferredDeadline: `${bookingDate} at ${bookingTime} (${localTimezone})`,
          projectDetails: `[Discovery Call Booking Request]\nRequested Slot: ${bookingDate} at ${bookingTime} (${localTimezone})\nNotes: ${notes || 'None provided'}`,
        }),
      }).catch((err) => console.warn('Server contact fallback notice:', err));

      setIsSubmitted(true);
    } catch (err) {
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[#191B18] border border-[#2C302A] rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C302A] bg-[#101110]">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#C8FF45]/10 text-[#C8FF45]">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F0]">
              Direct Strategy Session
            </span>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close booking modal (Escape)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2C302A] text-[#C5C8C1] hover:text-[#F5F5F0] hover:border-[#C8FF45] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-6">
          
          {/* Main Title & Guarantees */}
          <div className="space-y-2">
            <h2
              id="booking-modal-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight"
            >
              Book a Free 30-Minute Call
            </h2>
            <p className="text-sm text-[#C5C8C1] leading-relaxed">
              Schedule a dedicated 1-on-1 discovery call with E-Tech Graphics to review your brand vision, project scope, timeline, and deliverables.
            </p>
          </div>

          {/* Key Call Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#2C302A] bg-[#101110] text-xs">
            <div className="flex items-center gap-2.5 text-[#F5F5F0]">
              <Clock className="h-4 w-4 text-[#C8FF45] shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-[#8A8E85]">DURATION</p>
                <p className="font-semibold">30 Minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#F5F5F0]">
              <Shield className="h-4 w-4 text-[#C8FF45] shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-[#8A8E85]">INVESTMENT</p>
                <p className="font-semibold text-[#C8FF45]">100% Free ($0)</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#F5F5F0]">
              <Globe className="h-4 w-4 text-[#C8FF45] shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-[#8A8E85]">TIMEZONE</p>
                <p className="font-semibold truncate max-w-[120px]" title={localTimezone}>
                  {localTimezone}
                </p>
              </div>
            </div>
          </div>

          {/* Provider Integration or Direct Slot Selector */}
          {hasConfiguredBookingUrl ? (
            /* External Provider (Calendly / Cal.com iframe or button) */
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-[#2C302A] bg-[#101110] p-6 text-center space-y-4">
                <p className="text-sm text-[#F5F5F0] font-medium">
                  Connect directly with our live calendar provider to select your preferred slot:
                </p>
                <a
                  href={siteConfig.booking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all"
                >
                  <span>Open Scheduling Calendar</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : isSubmitted ? (
            /* Submission Confirmation */
            <div className="p-6 rounded-xl border border-[#C8FF45]/50 bg-[#C8FF45]/10 space-y-4 text-center animate-in fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C8FF45] text-[#101110]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Call Request Received
                </h3>
                <p className="text-xs sm:text-sm text-[#C5C8C1]">
                  We have received your requested 30-minute discovery call for <strong className="text-[#F5F5F0]">{bookingDate} at {bookingTime} ({localTimezone})</strong>.
                </p>
                <p className="text-xs text-[#8A8E85] pt-1">
                  A confirmation invite and Google Meet link will be dispatched to <span className="font-mono text-[#F5F5F0]">{clientEmail}</span> shortly.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#101110] bg-[#C8FF45] rounded-lg hover:bg-[#bbf033]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Direct Slot Reservation Form */
            <form onSubmit={handleSubmitSlot} className="space-y-4 pt-1">
              {/* Client Portal Sync Notice */}
              {currentUser ? (
                <div className="flex items-center justify-between rounded-lg border border-[#C8FF45]/30 bg-[#C8FF45]/5 px-3.5 py-2 text-xs text-[#C5C8C1]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C8FF45]" />
                    <span>Signed in as <strong className="text-[#F5F5F0]">{currentUser.displayName || currentUser.email}</strong></span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C8FF45]">AUTO-SYNCED TO PORTAL</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-[#2C302A] bg-[#141613] px-3.5 py-2 text-xs text-[#8A8E85]">
                  <span>Want to track your calls in your client hub?</span>
                  <button
                    type="button"
                    onClick={() => openAuthModal()}
                    className="font-medium text-[#C8FF45] hover:underline cursor-pointer"
                  >
                    Sign in with Google
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="clientName" className="block text-xs font-mono uppercase text-[#F5F5F0]">
                    Your Name <span className="text-[#C8FF45]">*</span>
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Samuel Ade"
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="clientEmail" className="block text-xs font-mono uppercase text-[#F5F5F0]">
                    Email Address <span className="text-[#C8FF45]">*</span>
                  </label>
                  <input
                    id="clientEmail"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="samuel@example.com"
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="bookingDate" className="block text-xs font-mono uppercase text-[#F5F5F0]">
                    Preferred Date <span className="text-[#C8FF45]">*</span>
                  </label>
                  <input
                    id="bookingDate"
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bookingTime" className="block text-xs font-mono uppercase text-[#F5F5F0]">
                    Preferred Time ({localTimezone}) <span className="text-[#C8FF45]">*</span>
                  </label>
                  <select
                    id="bookingTime"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:30">06:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bookingNotes" className="block text-xs font-mono uppercase text-[#C5C8C1]">
                  Brief Call Focus / Project Topic (Optional)
                </label>
                <textarea
                  id="bookingNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Rebranding our architectural firm, poster series design, or campaign timeline..."
                  className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3.5 py-2 text-xs sm:text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8FF45] py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.99] disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
              >
                {isSubmitting ? (
                  <span>Reserving Free Slot...</span>
                ) : (
                  <>
                    <span>Confirm Free 30-Minute Reservation</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Alternative: WhatsApp Call */}
          <div className="pt-4 border-t border-[#2C302A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A8E85]">
            <p>Prefer immediate chat without scheduling?</p>
            <a
              href={siteConfig.whatsapp.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#25D366] hover:underline"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>Chat on WhatsApp Directly &rarr;</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
