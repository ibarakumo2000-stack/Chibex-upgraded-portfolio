import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Calendar, Sparkles, Award, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Hero } from '../components/hero/Hero';
import { sampleProjects } from '../data/projects';
import { servicesData } from '../data/services';
import { siteConfig } from '../data/site-config';
import { ProjectCard } from '../components/portfolio/ProjectCard';
import { ProjectModal } from '../components/portfolio/ProjectModal';
import { BookingModal } from '../components/booking/BookingModal';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { Project } from '../types/portfolio';

const MARQUEE_ITEMS = [
  'CINEMATIC POSTERS',
  'EVENT FLYERS',
  'BRAND IDENTITY SYSTEMS',
  '3D VISUAL SYSTEMS',
  'ADVERTISING CAMPAIGNS',
  'EDITORIAL & PRINT ARCHITECTURE',
  'PACKAGING & MOCKUPS',
  'TYPOGRAPHIC ART DIRECTION',
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);

  // Display 6 diverse featured projects across cinematic posters, event flyers, brand identity, and campaigns
  const featuredProjects = sampleProjects.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with 3D Adaptive Intelligence Layer and Conversion CTAs */}
      <Hero
        onStartProject={() => navigate('/contact')}
        onOpenBooking={() => setBookingModalOpen(true)}
      />

      {/* Infinite Animated Discipline Ticker Ribbon */}
      <div className="border-b border-[#2C302A] bg-[#141613] py-3.5 overflow-hidden select-none">
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 25 }}
            className="flex items-center gap-8 shrink-0 text-xs font-mono tracking-widest text-[#8A8E85]"
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div key={idx} className="flex items-center gap-8">
                <span className="hover:text-[#C8FF45] transition-colors">{item}</span>
                <span className="text-[#C8FF45]/60 text-[10px]">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Studio Metrics Highlights Strip */}
      <section className="border-b border-[#2C302A] bg-[#101110] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-xl border border-[#2C302A] bg-[#191B18]/50"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#C8FF45] mb-1">
                <Award className="h-4 w-4" />
                <span className="font-mono text-2xl font-extrabold text-[#F5F5F0]">150+</span>
              </div>
              <p className="text-xs font-mono text-[#8A8E85]">CONCEPTS DELIVERED</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-4 rounded-xl border border-[#2C302A] bg-[#191B18]/50"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#38bdf8] mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-mono text-2xl font-extrabold text-[#F5F5F0]">99.8%</span>
              </div>
              <p className="text-xs font-mono text-[#8A8E85]">CLIENT SATISFACTION</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-xl border border-[#2C302A] bg-[#191B18]/50"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#e0b84c] mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-2xl font-extrabold text-[#F5F5F0]">48H</span>
              </div>
              <p className="text-xs font-mono text-[#8A8E85]">INITIAL CONCEPT DRAFT</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-4 rounded-xl border border-[#2C302A] bg-[#191B18]/50"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#C8FF45] mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-2xl font-extrabold text-[#F5F5F0]">100%</span>
              </div>
              <p className="text-xs font-mono text-[#8A8E85]">BESPOKE ART DIRECTION</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Selected Work Teaser */}
      <section id="projects" className="py-16 md:py-24 border-b border-[#2C302A] scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#2C302A]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                  CURATED PORTFOLIO
                </span>
                <span className="text-[#2C302A]" aria-hidden="true">/</span>
                <span className="text-xs font-mono text-[#8A8E85]">
                  SELECTED WORKS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight">
                Crafted for Visual Impact.
              </h2>
              <p className="text-sm sm:text-base text-[#C5C8C1] max-w-xl">
                Explore cinematic film posters, brutalist event flyers, minimalist brand identities, and high-conversion digital campaigns.
              </p>
            </div>

            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2C302A] bg-[#191B18] px-5 py-2.5 text-xs font-bold text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45] transition-colors whitespace-nowrap shrink-0 self-start md:self-end"
            >
              <span>Explore All Works ({sampleProjects.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 6 Featured Projects Grid with Animated Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(p) => setActiveProject(p)}
              />
            ))}
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>View Full Portfolio Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2C302A] bg-[#191B18] px-5 py-3.5 text-xs font-bold text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45] transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#C8FF45]" />
              <span>Book a Free 30-Minute Call</span>
            </button>
          </div>

        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16 md:py-24 border-b border-[#2C302A] bg-[#101110]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 border-b border-[#2C302A]">
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                  WHAT WE OFFER
                </span>
                <span className="text-[#2C302A]" aria-hidden="true">/</span>
                <span className="text-xs font-mono text-[#8A8E85]">
                  SERVICES
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight">
                Design Services Built Around Your Vision.
              </h2>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
                Whether you need a ground-up brand identity or high-converting promotional print and social collateral, every deliverable is crafted with clear communication in mind.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#C8FF45] hover:underline"
                >
                  <span>Read Full Services & Deliverables Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Compact Services Grid */}
          <div className="pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.slice(0, 3).map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl border border-[#2C302A] bg-[#191B18] p-6 flex flex-col justify-between space-y-5 hover:border-[#C8FF45]/50 transition-colors"
              >
                <div className="space-y-3">
                  <span className="text-xs font-mono text-[#C8FF45]">{service.number}.</span>
                  <h3 className="font-display text-lg font-bold text-[#F5F5F0]">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#C5C8C1] leading-relaxed">
                    {service.summary}
                  </p>
                  <ul className="space-y-1 pt-2 text-xs text-[#F5F5F0]">
                    {service.deliverables.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-[#C8FF45] shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="inline-flex items-center justify-between text-xs font-semibold text-[#F5F5F0] hover:text-[#C8FF45] transition-colors pt-3 border-t border-[#2C302A]"
                >
                  <span>Request This Service</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Philosophy Teaser */}
      <section className="py-16 md:py-24 border-b border-[#2C302A] bg-[#191B18]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              STUDIO PHILOSOPHY
            </span>
            <blockquote className="font-display text-2xl sm:text-3xl text-[#F5F5F0] font-medium leading-relaxed">
              "{siteConfig.philosophy.statement}"
            </blockquote>
            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              We eliminate decorative excess to let the core message stand out with geometric discipline and typographic authority.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#C8FF45] hover:underline"
              >
                <span>Discover Our Design Methodology</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Conversion Strip: Booking & WhatsApp */}
      <section className="py-16 md:py-20 bg-[#101110]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[#2C302A] bg-[#191B18] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl"
          >
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                START A CONVERSATION
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
                Ready to turn your idea into visual impact?
              </h3>
              <p className="text-xs sm:text-sm text-[#C5C8C1] leading-relaxed">
                Connect directly with {siteConfig.brand.name} via a free 30-minute introductory strategy session or message on WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shadow-lg shadow-[#C8FF45]/15 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Book a Free 30-Minute Call</span>
              </button>

              <WhatsAppButton
                variant="secondary"
                label="Chat on WhatsApp"
                className="py-4 px-5 text-xs font-semibold cursor-pointer"
              />

              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5C8C1] hover:text-[#F5F5F0] transition-colors py-2 px-3"
              >
                <span>Send Brief Online &rarr;</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Lightbox Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onInquireService={(service) => {
          setActiveProject(null);
          navigate(`/contact?service=${encodeURIComponent(service)}`);
        }}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
