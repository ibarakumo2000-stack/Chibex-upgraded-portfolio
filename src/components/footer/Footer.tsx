import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone } from 'lucide-react';
import { siteConfig } from '../../data/site-config';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#2C302A] bg-[#101110] text-[#C5C8C1] py-12 md:py-16 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2C302A]">
          
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#191B18] border border-[#2C302A] text-xs font-mono font-bold text-[#C8FF45] group-hover:border-[#C8FF45] transition-colors">
                E
              </span>
              <span className="font-display text-xl font-bold text-[#F5F5F0] tracking-tight group-hover:text-[#C8FF45] transition-colors">
                {siteConfig.brand.name}
              </span>
            </Link>
            
            <p className="font-display text-base text-[#F5F5F0]">
              “{siteConfig.brand.tagline}”
            </p>
            
            <p className="text-xs text-[#8A8E85] leading-relaxed max-w-sm">
              {siteConfig.brand.shortDescription}
            </p>

            {/* Direct Contact Pill */}
            <div className="pt-2 space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#C5C8C1]">
                <Phone className="h-3.5 w-3.5 text-[#C8FF45]" />
                <a href={`tel:${siteConfig.contact.phonePlaceholder}`} className="hover:text-[#F5F5F0] transition-colors">
                  {siteConfig.contact.phonePlaceholder}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#C5C8C1]">
                <Mail className="h-3.5 w-3.5 text-[#C8FF45]" />
                <a href={`mailto:${siteConfig.contact.emailPlaceholder}`} className="hover:text-[#F5F5F0] transition-colors">
                  {siteConfig.contact.emailPlaceholder}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-[#F5F5F0]">
              Navigation
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-[#C5C8C1] hover:text-[#C8FF45] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Socials */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-[#F5F5F0]">
              Presence
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              {siteConfig.socials
                .filter((s) => s.url !== null)
                .map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url!}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-[#C5C8C1] hover:text-[#C8FF45] transition-colors"
                    >
                      <span>{social.label}</span>
                      <span className="text-[11px] font-mono text-[#8A8E85]">
                        ({social.handle})
                      </span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8E85]">
          <div>
            <p>
              &copy; {currentYear} {siteConfig.brand.name}. All visual works and concept layouts reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">
              {siteConfig.brand.eyebrow}
            </span>

            <button
              type="button"
              onClick={handleScrollToTop}
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 text-[#C5C8C1] hover:text-[#C8FF45] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C8FF45]"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
