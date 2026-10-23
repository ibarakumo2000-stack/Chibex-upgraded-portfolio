import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContactSection } from '../components/contact/ContactSection';
import { siteConfig } from '../data/site-config';

export const ContactPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service') || '';

  return (
    <div className="py-8 md:py-16">
      <ContactSection
        preselectedService={serviceQuery}
        onClearPreselectedService={() => setSearchParams({})}
      />
    </div>
  );
};
