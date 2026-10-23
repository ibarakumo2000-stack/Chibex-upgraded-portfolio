import React, { useState, useEffect } from 'react';
import {
  serviceOptions,
  budgetOptions,
  timelineOptions,
  contactFormSchema,
  ContactFormInput,
} from '../../lib/validation';
import { siteConfig } from '../../data/site-config';
import { ContactApiResponse } from '../../types/portfolio';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { BookingModal } from '../booking/BookingModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { useAuth } from '../../context/AuthContext';
import { trackActivity } from '../../lib/analytics';

interface ContactSectionProps {
  preselectedService?: string;
  onClearPreselectedService?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  preselectedService,
  onClearPreselectedService,
}) => {
  const { currentUser, submitInquiry } = useAuth();
  const [formData, setFormData] = useState<ContactFormInput>({
    fullName: '',
    email: '',
    serviceNeeded: preselectedService || '',
    budgetRange: '',
    preferredDeadline: '',
    projectDetails: '',
    botField: '',
  });

  // Pre-fill user details if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || '',
        email: prev.email || currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ContactApiResponse | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Sync preselected service from parent
  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({
        ...prev,
        serviceNeeded: preselectedService,
      }));
    }
  }, [preselectedService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateClientSide = (): boolean => {
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          errors[path] = issue.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClientSide()) return;

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      // 1. Persist inquiry in Firestore & local audit store
      await submitInquiry({
        name: formData.fullName,
        email: formData.email,
        service: formData.serviceNeeded,
        budget: formData.budgetRange,
        timeline: formData.preferredDeadline,
        message: formData.projectDetails,
      });

      // 2. Dispatch to server contact endpoint with safe response parsing
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data: ContactApiResponse = await response.json();
          if (data && data.success) {
            setSubmissionResult(data);
          } else {
            setSubmissionResult({
              success: true,
              status: 'sent',
              message: 'Thank you! Your project inquiry has been received and logged directly to E-tech Visuals.',
            });
          }
        } else {
          // If response was not JSON (e.g. 200 or proxy status), the inquiry is already safely stored
          setSubmissionResult({
            success: true,
            status: 'sent',
            message: 'Thank you! Your project inquiry has been received and logged directly to E-tech Visuals.',
          });
        }
      } catch (networkErr) {
        console.warn('Backend email relay notice:', networkErr);
        // The inquiry was already saved to Firestore & local storage
        setSubmissionResult({
          success: true,
          status: 'sent',
          message: 'Thank you! Your project inquiry has been received and logged directly to E-tech Visuals.',
        });
      }
    } catch (err: unknown) {
      console.error('Contact submission error:', err);
      setSubmissionResult({
        success: false,
        status: 'error',
        message: 'Could not submit inquiry at this moment. You can also reach our creative director directly on WhatsApp at 07038373011.',
        error: err instanceof Error ? err.message : 'SUBMISSION_ERROR',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      serviceNeeded: '',
      budgetRange: '',
      preferredDeadline: '',
      projectDetails: '',
      botField: '',
    });
    setFieldErrors({});
    setSubmissionResult(null);
    if (onClearPreselectedService) onClearPreselectedService();
  };

  return (
    <section id="contact" className="py-16 md:py-24 scroll-mt-16 bg-[#101110]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 pb-12">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              GET IN TOUCH
            </span>
            <span className="text-[#2C302A]" aria-hidden="true">/</span>
            <span className="text-xs font-mono text-[#8A8E85]">
              PROJECT INQUIRY
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F0] tracking-tight">
            Start a Project.
          </h2>
          <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
            Have an idea in mind? Let’s turn it into something people remember. Share your timeline, scope, and objectives below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-[#191B18] border border-[#2C302A] rounded-xl p-6 sm:p-8 shadow-xl">
            
            {/* Success / Status Message Notification */}
            {submissionResult && submissionResult.success && (
              <div
                role="status"
                aria-live="polite"
                className="mb-8 rounded-lg border border-[#C8FF45]/60 bg-[#C8FF45]/10 p-5 text-sm space-y-3 animate-in fade-in"
              >
                <div className="flex items-center gap-2.5 font-bold text-[#F5F5F0]">
                  <CheckCircle2 className="h-5 w-5 text-[#C8FF45]" />
                  <span>Inquiry Successfully Received</span>
                </div>
                <p className="text-xs sm:text-sm text-[#C5C8C1] leading-relaxed">
                  {submissionResult.message}
                </p>

                {submissionResult.status === 'simulated' && (
                  <div className="pt-2 border-t border-[#2C302A] text-xs text-[#8A8E85] flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                    <span>
                      <strong>Development Mode Notice: </strong>
                      The server validated and recorded this submission cleanly. In production, configure <code className="font-mono text-[#C8FF45]">RESEND_API_KEY</code> and destination emails to enable live mailbox dispatch.
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8FF45] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Submit another inquiry</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {submissionResult && !submissionResult.success && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-8 rounded-lg border border-red-500/50 bg-red-950/20 p-5 text-sm space-y-2 animate-in fade-in"
              >
                <div className="flex items-center gap-2.5 font-bold text-red-200">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span>Submission Error</span>
                </div>
                <p className="text-xs sm:text-sm text-red-300">
                  {submissionResult.message}
                </p>
                {submissionResult.error && (
                  <p className="text-xs font-mono text-red-400/80">
                    Details: {submissionResult.error}
                  </p>
                )}
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              
              {/* Bot Honeypot - Hidden from humans */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="botField">Leave empty</label>
                <input
                  id="botField"
                  name="botField"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.botField}
                  onChange={handleChange}
                />
              </div>

              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-mono uppercase tracking-wider text-[#F5F5F0]"
                  >
                    Full Name <span className="text-[#C8FF45]">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Alex Jensen"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                    className={`w-full rounded-lg border bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors ${
                      fieldErrors.fullName
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-[#2C302A] hover:border-[#8A8E85]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p id="fullName-error" className="text-xs text-red-400">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-mono uppercase tracking-wider text-[#F5F5F0]"
                  >
                    Email Address <span className="text-[#C8FF45]">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    className={`w-full rounded-lg border bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors ${
                      fieldErrors.email
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-[#2C302A] hover:border-[#8A8E85]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="text-xs text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Service Needed */}
              <div className="space-y-1.5">
                <label
                  htmlFor="serviceNeeded"
                  className="block text-xs font-mono uppercase tracking-wider text-[#F5F5F0]"
                >
                  Primary Service Needed <span className="text-[#C8FF45]">*</span>
                </label>
                <select
                  id="serviceNeeded"
                  name="serviceNeeded"
                  required
                  value={formData.serviceNeeded}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.serviceNeeded)}
                  aria-describedby={fieldErrors.serviceNeeded ? 'serviceNeeded-error' : undefined}
                  className={`w-full rounded-lg border bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors ${
                    fieldErrors.serviceNeeded
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-[#2C302A] hover:border-[#8A8E85]'
                  }`}
                >
                  <option value="" disabled className="bg-[#101110] text-[#8A8E85]">
                    Select a service category...
                  </option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#101110] text-[#F5F5F0]">
                      {opt}
                    </option>
                  ))}
                </select>
                {fieldErrors.serviceNeeded && (
                  <p id="serviceNeeded-error" className="text-xs text-red-400">
                    {fieldErrors.serviceNeeded}
                  </p>
                )}
              </div>

              {/* Row 3: Budget Range & Timeline (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="budgetRange"
                    className="block text-xs font-mono uppercase tracking-wider text-[#C5C8C1]"
                  >
                    Budget Range (Optional)
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] hover:border-[#8A8E85] transition-colors"
                  >
                    <option value="" className="bg-[#101110] text-[#8A8E85]">
                      Select approximate budget...
                    </option>
                    {budgetOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#101110] text-[#F5F5F0]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="preferredDeadline"
                    className="block text-xs font-mono uppercase tracking-wider text-[#C5C8C1]"
                  >
                    Target Deadline (Optional)
                  </label>
                  <select
                    id="preferredDeadline"
                    name="preferredDeadline"
                    value={formData.preferredDeadline}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] hover:border-[#8A8E85] transition-colors"
                  >
                    <option value="" className="bg-[#101110] text-[#8A8E85]">
                      Select preferred timeline...
                    </option>
                    {timelineOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#101110] text-[#F5F5F0]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Message / Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="projectDetails"
                    className="block text-xs font-mono uppercase tracking-wider text-[#F5F5F0]"
                  >
                    Project Details & Goals <span className="text-[#C8FF45]">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#8A8E85]">
                    {formData.projectDetails.length} / 2500
                  </span>
                </div>
                <textarea
                  id="projectDetails"
                  name="projectDetails"
                  required
                  rows={5}
                  value={formData.projectDetails}
                  onChange={handleChange}
                  placeholder="Tell us about the project goals, deliverables, aesthetic references, or specific challenges..."
                  aria-invalid={Boolean(fieldErrors.projectDetails)}
                  aria-describedby={fieldErrors.projectDetails ? 'projectDetails-error' : undefined}
                  className={`w-full rounded-lg border bg-[#101110] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors resize-y ${
                    fieldErrors.projectDetails
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-[#2C302A] hover:border-[#8A8E85]'
                  }`}
                />
                {fieldErrors.projectDetails && (
                  <p id="projectDetails-error" className="text-xs text-red-400">
                    {fieldErrors.projectDetails}
                  </p>
                )}
              </div>

              {/* Submit CTA & Privacy Note */}
              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8FF45] py-4 px-6 text-sm font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] focus:ring-offset-2 focus:ring-offset-[#191B18]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#101110] border-t-transparent" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Project Brief</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#8A8E85] text-center leading-relaxed">
                  Your information is treated with strict confidentiality and used exclusively to evaluate project fit.
                </p>
              </div>

            </form>
          </div>

          {/* Right Column: Direct Contact & Availability Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Fast-Track Conversion Actions Card */}
            <div className="rounded-xl border border-[#C8FF45]/40 bg-[#191B18] p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#C8FF45] uppercase tracking-wider font-bold">
                  FAST-TRACK SCHEDULING
                </span>
                <h3 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Prefer a direct call or instant chat?
                </h3>
                <p className="text-xs text-[#C5C8C1] leading-relaxed">
                  Skip the detailed brief and discuss your requirements directly with our studio lead.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8FF45] py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all shadow-md shadow-[#C8FF45]/15"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book a Free 30-Minute Call</span>
                </button>

                <WhatsAppButton
                  variant="secondary"
                  label="Chat on WhatsApp"
                  className="w-full py-3.5"
                />
              </div>
            </div>

            {/* Direct Studio Coordinates */}
            <div className="rounded-xl border border-[#2C302A] bg-[#191B18] p-6 sm:p-7 space-y-5">
              <h3 className="font-display text-lg font-bold text-[#F5F5F0]">
                Direct Coordinates
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[#8A8E85]">STUDIO EMAIL</p>
                    <a
                      href={`mailto:${siteConfig.contact.emailPlaceholder}`}
                      className="font-mono text-[#F5F5F0] mt-0.5 break-all block hover:text-[#C8FF45] transition-colors"
                    >
                      {siteConfig.contact.emailPlaceholder}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[#8A8E85]">TELEPHONE / WHATSAPP</p>
                    <a
                      href={`tel:${siteConfig.contact.phonePlaceholder}`}
                      className="font-mono text-[#F5F5F0] mt-0.5 block hover:text-[#C8FF45] transition-colors"
                    >
                      {siteConfig.contact.phonePlaceholder}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[#8A8E85]">LOCATION & TIMEZONE</p>
                    <p className="text-[#F5F5F0] mt-0.5">
                      {siteConfig.contact.locationPlaceholder}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[#8A8E85]">TURNAROUND PLEDGE</p>
                    <p className="text-[#F5F5F0] mt-0.5">
                      {siteConfig.contact.responseCommitment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Channels - Gracefully configured */}
            <div className="rounded-xl border border-[#2C302A] bg-[#191B18] p-6 sm:p-7 space-y-4">
              <h3 className="font-display text-sm font-bold text-[#F5F5F0] uppercase tracking-wider font-mono">
                Studio Channels
              </h3>
              <p className="text-xs text-[#8A8E85]">
                Active creative feeds, work-in-progress snapshots, and portfolio features.
              </p>

              <div className="space-y-2 pt-1">
                {siteConfig.socials.map((social) => {
                  if (social.url) {
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#2C302A] bg-[#101110] text-xs hover:border-[#C8FF45] hover:text-[#C8FF45] transition-colors"
                      >
                        <span className="font-medium text-[#F5F5F0]">{social.label}</span>
                        <span className="font-mono text-[#8A8E85]">{social.handle} &rarr;</span>
                      </a>
                    );
                  }
                  return (
                    <div
                      key={social.label}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#2C302A]/50 bg-[#101110]/50 text-xs opacity-60 cursor-not-allowed"
                    >
                      <span className="text-[#8A8E85]">{social.label}</span>
                      <span className="font-mono text-[#8A8E85]">Not yet configured</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </section>
  );
};
