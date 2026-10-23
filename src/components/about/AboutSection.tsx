import React from 'react';
import { siteConfig } from '../../data/site-config';
import { Layers, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onStartProject: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onStartProject }) => {
  return (
    <section id="about" className="py-16 md:py-24 border-b border-[#2C302A] scroll-mt-16 bg-[#101110]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-16 border-b border-[#2C302A]">
          <div className="lg:col-span-4 space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                ABOUT THE STUDIO
              </span>
              <span className="text-[#2C302A]" aria-hidden="true">/</span>
              <span className="text-xs font-mono text-[#8A8E85]">
                PHILOSOPHY
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight">
              Design With Clear Purpose.
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <blockquote className="font-display text-2xl sm:text-3xl text-[#F5F5F0] font-medium leading-relaxed">
              "{siteConfig.philosophy.statement}"
            </blockquote>
            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              At E-tech Visuals, design is not decorative veneer added after the fact—it is the structural grammar through which an idea communicates its value. We work across branding, posters, digital media, and editorial print to shape distinctive visual identities that endure.
            </p>
          </div>
        </div>

        {/* 3 Core Design Principles */}
        <div className="pt-16">
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A8E85]">
              OUR THREE FOUNDATIONAL PILLARS
            </span>
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
                    <h3 className="font-display text-xl font-bold text-[#F5F5F0]">
                      {item.title}
                    </h3>
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

        {/* Studio Workflow Callout */}
        <div className="mt-12 rounded-xl border border-[#2C302A] bg-[#191B18] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-display text-lg font-bold text-[#F5F5F0]">
              Ready to elevate your project's visual presence?
            </h4>
            <p className="text-xs sm:text-sm text-[#C5C8C1]">
              We take on a selective number of brand identity and editorial projects per quarter to guarantee dedicated craftsmanship.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartProject}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
          >
            <span>Start a Conversation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
