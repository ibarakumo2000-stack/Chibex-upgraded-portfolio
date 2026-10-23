import { z } from 'zod';

export const serviceOptions = [
  'Brand Identity & Logo Design',
  'Flyers & Posters',
  'Social Media Design',
  'Digital & Print Design',
  'Campaign Graphics',
  'General Inquiry / Consultation',
] as const;

export const budgetOptions = [
  '< $1,000 (Starter / Single Asset)',
  '$1,000 – $2,500 (Small Project / Package)',
  '$2,500 – $5,000 (Complete Brand / Campaign)',
  '$5,000+ (Comprehensive Studio Project)',
  'Flexible / To be discussed',
] as const;

export const timelineOptions = [
  'Within 1–2 weeks (Urgent)',
  'Within 1 month',
  '1–3 months',
  'Flexible timeline',
] as const;

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(80, { message: 'Full name must not exceed 80 characters.' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please provide a valid email address.' })
    .max(100, { message: 'Email address must not exceed 100 characters.' }),
  serviceNeeded: z
    .string()
    .min(1, { message: 'Please select a service needed.' }),
  budgetRange: z
    .string()
    .optional(),
  preferredDeadline: z
    .string()
    .optional(),
  projectDetails: z
    .string()
    .trim()
    .min(10, { message: 'Please share at least 10 characters about your project goals.' })
    .max(2500, { message: 'Message is limited to 2,500 characters.' }),
  botField: z
    .string()
    .optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
