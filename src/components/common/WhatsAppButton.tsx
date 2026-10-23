import React from 'react';
import { siteConfig } from '../../data/site-config';

interface WhatsAppButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'compact';
  label?: string;
  showIcon?: boolean;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.5C9.33 7.5 9.03 7.58 8.77 7.85C8.5 8.13 7.79 8.81 7.79 10.18C7.79 11.55 8.79 12.87 8.93 13.06C9.07 13.25 10.87 16.03 13.63 17.22C14.29 17.5 14.81 17.69 15.21 17.82C15.87 18.03 16.48 18 16.96 17.93C17.5 17.85 18.61 17.26 18.84 16.6C19.07 15.94 19.07 15.38 19 15.26C18.93 15.15 18.76 15.08 18.5 14.95C18.24 14.82 16.96 14.19 16.72 14.1C16.48 14.01 16.31 13.97 16.14 14.23C15.97 14.49 15.48 15.08 15.33 15.25C15.18 15.42 15.03 15.44 14.77 15.31C14.51 15.18 13.68 14.91 12.7 14.04C11.93 13.35 11.41 12.5 11.26 12.25C11.11 12 11.24 11.86 11.37 11.73C11.49 11.61 11.63 11.42 11.77 11.27C11.91 11.12 11.95 11.01 12.05 10.82C12.14 10.63 12.1 10.46 12.03 10.33C11.96 10.2 11.37 8.74 11.12 8.14C10.88 7.56 10.64 7.64 10.46 7.63C10.29 7.62 10.1 7.62 9.9 7.62L9.53 7.5Z" />
  </svg>
);

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  className = '',
  variant = 'primary',
  label = 'Chat on WhatsApp',
  showIcon = true,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#101110] active:scale-[0.98] select-none';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-[#25D366] text-[#0d1f11] hover:bg-[#20ba5a] text-xs uppercase tracking-wider font-bold py-3.5 px-6 shadow-md shadow-[#25D366]/10';
      break;
    case 'secondary':
      variantStyles =
        'bg-[#191B18] border border-[#2C302A] text-[#F5F5F0] hover:border-[#25D366] hover:text-[#25D366] text-xs uppercase tracking-wider font-semibold py-3.5 px-5';
      break;
    case 'outline':
      variantStyles =
        'border border-[#25D366]/60 text-[#25D366] hover:bg-[#25D366]/10 text-xs font-semibold py-2.5 px-4';
      break;
    case 'compact':
      variantStyles =
        'bg-[#191B18] border border-[#2C302A] text-[#25D366] hover:border-[#25D366] text-xs font-mono py-2 px-3';
      break;
  }

  return (
    <a
      href={siteConfig.whatsapp.getUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open WhatsApp conversation with ${siteConfig.brand.name} at ${siteConfig.whatsapp.displayNumber}`}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {showIcon && <WhatsAppIcon className="h-4 w-4 shrink-0 text-current" />}
      <span>{label}</span>
    </a>
  );
};
