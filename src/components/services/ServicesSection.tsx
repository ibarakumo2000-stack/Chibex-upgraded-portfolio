import React from 'react';
import { servicesData } from '../../data/services';
import { ArrowUpRight, Check } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-16 md:py-24 border-b border-[#2C302A] scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 pb-12">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              CORE DISCIPLINES
            </span>
            <span className="text-[#2C302A]" aria-hidden="true">/</span>
            <span className="text-xs font-mono text-[#8A8E85]">
              05 SERVICES
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F0] tracking-tight">
            Design Services.
          </h2>
          <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
            From strategic brand systems to tactical campaign rollouts, every service is executed with mathematical grid discipline and striking visual character.
          </p>
        </div>

        {/* Services List / Cards */}
        <div className="space-y-4">
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
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F5F5F0] group-hover:text-[#C8FF45] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C5C8C1] pt-1 leading-relaxed">
                    {service.summary}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="lg:col-span-5 space-y-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#8A8E85] mb-2">
                    TYPICAL DELIVERABLES
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#F5F5F0]">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action & Key Outcome */}
                <div className="lg:col-span-3 flex flex-col justify-between h-full pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2C302A] space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[#8A8E85]">
                      VALUE OUTCOME
                    </p>
                    <p className="text-xs text-[#C5C8C1] mt-1 italic">
                      "{service.keyOutcome}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="inline-flex items-center justify-between gap-2 rounded-lg border border-[#2C302A] bg-[#101110] px-4 py-2.5 text-xs font-bold text-[#F5F5F0] group-hover:border-[#C8FF45] group-hover:text-[#C8FF45] transition-all hover:bg-[#C8FF45] hover:!text-[#101110] focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
                  >
                    <span>Request This Service</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
