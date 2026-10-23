/**
 * Centralized site configuration for E-Tech Graphics.
 * The owner can update contact details, social links, and brand strings here.
 */

export interface SocialLink {
  label: string;
  url: string | null; // Set to null if unavailable; UI gracefully disables or hides it
  handle: string;
}

export const siteConfig = {
  brand: {
    name: 'E-tech Visuals',
    tagline: 'Turning Ideas Into Visual Impact.',
    heroSupporting: 'Bold visuals. Meaningful identities. Designs that make brands impossible to ignore.',
    shortDescription: 'E-tech Visuals creates bold visuals, distinctive brand identities, and thoughtful designs that help ideas stand out.',
    eyebrow: 'INDEPENDENT CREATIVE STUDIO',
    foundedNote: 'Portfolio & Concept Archive',
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  // Updated studio contact details
  contact: {
    emailPlaceholder: 'emperorstech885@gmail.com',
    phonePlaceholder: '07038373011',
    locationPlaceholder: 'Remote & Global / Available Worldwide',
    responseCommitment: 'Inquiries answered within 24–48 hours on business days.',
  },
  // Scheduling provider configuration
  booking: {
    url: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BOOKING_URL) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOOKING_URL) || '',
    duration: '30 Minutes',
    cost: 'Free of charge ($0)',
    title: 'Book a Free 30-Minute Call',
    description: 'Direct 1-on-1 strategy session to review your brand goals, project scope, budget, and creative direction.',
  },
  // WhatsApp click-to-chat configuration
  whatsapp: {
    number: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) || '2347038373011',
    displayNumber: '07038373011',
    prefilledMessage: "Hello E-Tech Graphics! I'm interested in your design services and would like to discuss a project.",
    getUrl: function () {
      const num = this.number.replace(/\D/g, '');
      const text = encodeURIComponent(this.prefilledMessage);
      return `https://wa.me/${num}?text=${text}`;
    },
  },
  socials: [
    {
      label: 'Instagram',
      url: 'https://instagram.com', // Replace with real Instagram profile
      handle: '@etechgraphics',
    },
    {
      label: 'Behance',
      url: 'https://behance.net', // Replace with real Behance portfolio
      handle: 'etechgraphics',
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com', // Replace with real LinkedIn page
      handle: 'E-Tech Graphics',
    },
    {
      label: 'Dribbble',
      url: null, // Disabled placeholder - demonstrates graceful handling of unconfigured channels
      handle: 'Coming soon',
    },
  ] as SocialLink[],
  philosophy: {
    statement: 'We turn ideas into purposeful visual experiences—combining clear communication, thoughtful composition, and distinctive design.',
    principles: [
      {
        number: '01',
        title: 'Form Follows Clarity',
        description: 'Every layout decision begins with message hierarchy. We strip away decorative clutter to ensure your brand communication hits instantly and legibly.',
      },
      {
        number: '02',
        title: 'Identity Longevity',
        description: 'Rather than chasing fleeting micro-trends, we develop robust visual systems with flexible typographic rhythm and enduring color restraint.',
      },
      {
        number: '03',
        title: 'Production Precision',
        description: 'From vector grid mathematical alignment to digital print bleed and mobile pixel-perfection, our assets ship production-ready across media.',
      },
    ],
  },
};
