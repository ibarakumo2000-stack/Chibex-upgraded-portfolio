import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { sampleProjects } from '../data/projects';
import { Project, ProjectCategory } from '../types/portfolio';
import { ProjectCard } from '../components/portfolio/ProjectCard';
import { ProjectModal } from '../components/portfolio/ProjectModal';
import { Info, ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '../data/site-config';

const categories: Array<{ id: string; label: string; value: 'All' | ProjectCategory }> = [
  { id: 'all', label: 'All Works', value: 'All' },
  { id: 'cinematic', label: 'Cinematic Posters', value: 'Cinematic Posters' },
  { id: 'flyers', label: 'Event Flyers', value: 'Event Flyers' },
  { id: 'brand', label: 'Brand Identity', value: 'Brand Identity' },
  { id: 'campaigns', label: 'Social & Campaigns', value: 'Social Media & Campaigns' },
  { id: 'print', label: 'Digital & Print', value: 'Digital & Print Design' },
];

export const WorkPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const navigate = useNavigate();

  const filteredProjects =
    selectedCategory === 'All'
      ? sampleProjects
      : sampleProjects.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-12 md:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header with Motion */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#2C302A]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                PORTFOLIO ARCHIVE
              </span>
              <span className="text-[#2C302A]" aria-hidden="true">/</span>
              <span className="text-xs font-mono text-[#8A8E85]">
                {sampleProjects.length} CURATED PROJECTS
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F5F0] tracking-tight">
              Selected Works.
            </h1>
            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              Explore our curated archive of brand identities, modern posters, multi-device social systems, and editorial print layouts crafted for maximum visual resonance.
            </p>
          </motion.div>

          {/* Category Filter Controls with Animated Indicator */}
          <div
            role="toolbar"
            aria-label="Filter portfolio by project category"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#191B18] border border-[#2C302A] rounded-xl self-start md:self-end"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  aria-pressed={isActive}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] cursor-pointer ${
                    isActive ? 'text-[#101110] font-bold' : 'text-[#C5C8C1] hover:text-[#F5F5F0]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className="absolute inset-0 bg-[#C8FF45] rounded-lg shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid with AnimatePresence */}
        <div className="pt-10">
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(p) => setActiveProject(p)}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="py-16 text-center border border-dashed border-[#2C302A] rounded-xl p-8">
                <p className="text-sm font-medium text-[#F5F5F0]">No projects found in this category.</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="mt-3 text-xs font-semibold text-[#C8FF45] hover:underline"
                >
                  View all projects
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Concept Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-5 rounded-xl border border-[#2C302A] bg-[#191B18]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A8E85]"
        >
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-[#C8FF45] shrink-0" />
            <p>
              <strong className="text-[#F5F5F0]">Design Quality Disclosure: </strong>
              The items in this portfolio reflect studio concept demonstrations and creative exercises. They can be replaced easily with commissioned client work in <code className="font-mono text-[#C8FF45]">src/data/projects.ts</code>.
            </p>
          </div>
          <Link
            to="/contact"
            className="text-[#C8FF45] font-semibold hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Commission Custom Project &rarr;
          </Link>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-xl border border-[#2C302A] bg-[#191B18] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-[#F5F5F0]">
              Like what you see?
            </h3>
            <p className="text-xs sm:text-sm text-[#C5C8C1]">
              Reach out to discuss your brand, poster series, or upcoming visual campaign.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Inquire About A Project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

      </div>

      {/* Accessible Detail Lightbox Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onInquireService={(service) => {
          setActiveProject(null);
          navigate(`/contact?service=${encodeURIComponent(service)}`);
        }}
      />
    </div>
  );
};
