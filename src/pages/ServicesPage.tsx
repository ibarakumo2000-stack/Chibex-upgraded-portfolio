import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesData } from '../data/services';
import { ArrowUpRight, Check, ArrowRight, ShieldCheck, Clock, Zap, Calendar } from 'lucide-react';
import { siteConfig } from '../data/site-config';
import { BookingModal } from '../components/booking/BookingModal';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const ServicesPage: React.FC = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-3 pb-12 border-b border-[#2C302A]">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              STUDIO CAPABILITIES
            </span>
            <span className="text-[#2C302A]" aria-hidden="true">/</span>
            <span className="text-xs font-mono text-[#8A8E85]">
              05 CORE OFFERINGS
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F5F0] tracking-tight">
            Design Services.
          </h1>
          <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
            From strategic brand identities and responsive logo suites to large-format promotional posters, modular social layouts, and multi-channel campaign collateral.
          </p>
        </div>

        {/* Services List / Cards */}
        <div className="pt-12 space-y-6">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="group rounded-xl border border-[#2C302A] bg-[#191B18] p-6 sm:p-8 transition-all duration-200 hover:border-[#C8FF45]/50 hover:bg-[#1d201c]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Index & Title */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-xs font-mono text-[#C8FF45]">
                    {service.number}.
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#F5F5F0] group-hover:text-[#C8FF45] transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C5C8C1] pt-1 leading-relaxed">
                    {service.summary}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="lg:col-span-5 space-y-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#8A8E85] mb-2">
                    TYPICAL DELIVERABLES & ASSETS
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#F5F5F0]">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action & Key Outcome */}
                <div className="lg:col-span-3 flex flex-col justify-between h-full pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2C302A] space-y-5">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[#8A8E85]">
                      VALUE OUTCOME
                    </p>
                    <p className="text-xs text-[#C5C8C1] mt-1.5 italic">
                      "{service.keyOutcome}"
                    </p>
                  </div>

                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center justify-between gap-2 rounded-lg border border-[#2C302A] bg-[#101110] px-4 py-3 text-xs font-bold text-[#F5F5F0] group-hover:border-[#C8FF45] group-hover:text-[#C8FF45] transition-all hover:bg-[#C8FF45] hover:!text-[#101110] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  >
                    <span>Request This Service</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* 4-Step Process Strip */}
        <div className="mt-20 pt-16 border-t border-[#2C302A]">
          <div className="max-w-2xl space-y-2 mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              OUR METHODOLOGY
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
              How We Execute Every Engagement
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#2C302A] bg-[#191B18] space-y-3">
              <span className="text-xs font-mono text-[#C8FF45]">PHASE 01</span>
              <h4 className="font-display text-base font-bold text-[#F5F5F0]">Discovery & Goals</h4>
              <p className="text-xs text-[#C5C8C1] leading-relaxed">
                We dissect your audience, target channels, and brand objectives to align on concrete design milestones.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2C302A] bg-[#191B18] space-y-3">
              <span className="text-xs font-mono text-[#C8FF45]">PHASE 02</span>
              <h4 className="font-display text-base font-bold text-[#F5F5F0]">Direction & Concept</h4>
              <p className="text-xs text-[#C5C8C1] leading-relaxed">
                Rapid development of distinct visual routes, typography pairings, grid structures, and color palettes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2C302A] bg-[#191B18] space-y-3">
              <span className="text-xs font-mono text-[#C8FF45]">PHASE 03</span>
              <h4 className="font-display text-base font-bold text-[#F5F5F0]">Refine & Systematize</h4>
              <p className="text-xs text-[#C5C8C1] leading-relaxed">
                Selected concepts are refined into modular systems with comprehensive spacing and export specifications.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2C302A] bg-[#191B18] space-y-3">
              <span className="text-xs font-mono text-[#C8FF45]">PHASE 04</span>
              <h4 className="font-display text-base font-bold text-[#F5F5F0]">Production Delivery</h4>
              <p className="text-xs text-[#C5C8C1] leading-relaxed">
                High-resolution vector assets, print-ready CMYK files, digital banners, and guidelines packaged cleanly.
              </p>
            </div>
          </div>
        </div>

        {/* Inquire & Booking Banner */}
        <div className="mt-16 rounded-2xl border border-[#2C302A] bg-[#191B18] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              GET STARTED
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0]">
              Need a tailored package or custom scope?
            </h3>
            <p className="text-xs sm:text-sm text-[#C5C8C1] leading-relaxed">
              Book a free 30-minute introductory strategy session to map out your deliverables, or chat directly with our design lead on WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shadow-lg shadow-[#C8FF45]/15"
            >
              <Calendar className="h-4 w-4" />
              <span>Book a Free 30-Minute Call</span>
            </button>

            <WhatsAppButton
              variant="secondary"
              label="Chat on WhatsApp"
              className="py-4 px-5 text-xs font-semibold"
            />
          </div>
        </div>

      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
