import React, { useState } from 'react';
import { siteConfig } from '../../data/site-config';
import { WhatsAppIcon } from './WhatsAppButton';

export const FloatingWhatsApp: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      aria-label="Direct WhatsApp Message"
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 group"
    >
      {/* Expanded Pill on Hover */}
      <span
        className={`hidden sm:inline-block pointer-events-none rounded-full bg-[#191B18]/95 border border-[#2C302A] px-3.5 py-1.5 text-xs font-mono font-medium text-[#F5F5F0] shadow-lg backdrop-blur-md transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        Chat on WhatsApp
      </span>

      {/* Floating Action Button */}
      <a
        href={siteConfig.whatsapp.getUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat with E-Tech Graphics on WhatsApp (07038373011)"
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-[#0d1f11] shadow-xl shadow-black/40 hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#101110]"
      >
        <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </a>
    </aside>
  );
};
