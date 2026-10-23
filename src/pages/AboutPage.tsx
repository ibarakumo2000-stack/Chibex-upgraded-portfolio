import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../data/site-config';
import { Compass, Layers, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl space-y-3 pb-12 border-b border-[#2C302A]">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              STUDIO PROFILE
            </span>
            <span className="text-[#2C302A]" aria-hidden="true">/</span>
            <span className="text-xs font-mono text-[#8A8E85]">
              PHILOSOPHY & STANDARDS
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F5F0] tracking-tight">
            About {siteConfig.brand.name}.
          </h1>
          <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
            {siteConfig.brand.shortDescription}
          </p>
        </div>

        {/* Philosophy Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start py-16 border-b border-[#2C302A]">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C8FF45]">
              CORE MANIFESTO
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
              Turning Ideas Into Purposeful Visuals.
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <blockquote className="font-display text-2xl sm:text-3xl text-[#F5F5F0] font-medium leading-relaxed">
              "{siteConfig.philosophy.statement}"
            </blockquote>
            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              At {siteConfig.brand.name}, design is not decorative veneer added after the fact—it is the structural grammar through which an idea communicates its value. We work across branding, posters, digital media, and editorial print to shape distinctive visual identities that endure.
            </p>
            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              Every curve, typographic weight, and spacing ratio is chosen with intention. We believe in visual clarity over superficial noise, ensuring that your message cuts through cluttered feeds and crowded physical spaces alike.
            </p>
          </div>
        </div>

        {/* The 3 Pillars */}
        <div className="py-16 border-b border-[#2C302A]">
          <div className="max-w-2xl space-y-2 mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              OUR THREE FOUNDATIONAL PILLARS
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
              Built On Rigor & Purpose
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {siteConfig.philosophy.principles.map((item, idx) => {
              const icons = [Compass, Layers, ShieldCheck];
              const Icon = icons[idx] || Compass;

              return (
                <div
                  key={item.number}
                  className="rounded-xl border border-[#2C302A] bg-[#191B18] p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#C8FF45]/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#C8FF45]">
                        {item.number}.
                      </span>
                      <Icon className="h-5 w-5 text-[#8A8E85]" />
                    </div>
                    <h4 className="font-display text-xl font-bold text-[#F5F5F0]">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#C5C8C1] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2C302A]/60 text-[11px] font-mono text-[#8A8E85]">
                    DISCIPLINE IN PRACTICE
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Production Standards Checklist */}
        <div className="py-16 border-b border-[#2C302A]">
          <div className="max-w-2xl space-y-2 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              PRODUCTION RIGOR
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
              How We Deliver Production-Grade Files
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Mathematical vector construction with clean anchor points and zero stray paths',
              'Strict CMYK and spot-color prepress proofing with bleed, trim, and safety margins',
              'Responsive SVG monograms scalable from 16px favicons to building facades',
              'Modular social layouts built on 12-column grids for seamless brand continuity',
              'Accessible contrast verification exceeding WCAG AA standards',
              'Comprehensive packaging with organized source files, fonts, and style guides',
            ].map((spec, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-[#2C302A] bg-[#191B18]/70 text-xs sm:text-sm text-[#F5F5F0]">
                <CheckCircle2 className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-[#2C302A] bg-[#191B18] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              LET'S COLLABORATE
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
              Ready to create something memorable?
            </h3>
            <p className="text-xs sm:text-sm text-[#C5C8C1]">
              Reach out directly at <a href={`mailto:${siteConfig.contact.emailPlaceholder}`} className="text-[#F5F5F0] hover:underline font-mono">{siteConfig.contact.emailPlaceholder}</a> or call <a href={`tel:${siteConfig.contact.phonePlaceholder}`} className="text-[#F5F5F0] hover:underline font-mono">{siteConfig.contact.phonePlaceholder}</a>.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <span>Start a Conversation</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
