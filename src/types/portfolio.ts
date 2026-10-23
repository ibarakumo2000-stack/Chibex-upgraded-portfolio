export type ProjectCategory =
  | 'Cinematic Posters'
  | 'Event Flyers'
  | 'Brand Identity'
  | 'Social Media & Campaigns'
  | 'Digital & Print Design';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  year: string;
  clientContext: string;
  isConcept: boolean; // Explicitly true for sample/concept showcases
  imagePath: string;
  imageAlt: string;
  aspectRatioClass?: string;
  featured?: boolean;
  accentNote?: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  summary: string;
  deliverables: string[];
  keyOutcome: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  serviceNeeded: string;
  budgetRange?: string;
  preferredDeadline?: string;
  projectDetails: string;
  botField?: string; // Honeypot
}

export interface ContactApiResponse {
  success: boolean;
  status: 'sent' | 'simulated' | 'error';
  message: string;
  error?: string;
  details?: Record<string, string>;
}
