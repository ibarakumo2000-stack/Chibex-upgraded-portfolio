import React, { useState } from 'react';
import { sampleProjects } from '../../data/projects';
import { Project, ProjectCategory } from '../../types/portfolio';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { Info } from 'lucide-react';

interface PortfolioGalleryProps {
  onInquireService: (serviceName: string) => void;
}

const categories: Array<{ id: string; label: string; value: 'All' | ProjectCategory }> = [
  { id: 'all', label: 'All Works', value: 'All' },
  { id: 'cinematic', label: 'Cinematic Posters', value: 'Cinematic Posters' },
  { id: 'flyers', label: 'Event Flyers', value: 'Event Flyers' },
  { id: 'brand', label: 'Brand Identity', value: 'Brand Identity' },
  { id: 'campaigns', label: 'Social & Campaigns', value: 'Social Media & Campaigns' },
  { id: 'print', label: 'Digital & Print', value: 'Digital & Print Design' },
];

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ onInquireService }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const filteredProjects = selectedCategory === 'All'
    ? sampleProjects
    : sampleProjects.filter((p) => p.category === selectedCategory);

  return (
    <section id="work" className="py-16 md:py-24 border-b border-[#2C302A] scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#2C302A]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
                PORTFOLIO ARCHIVE
              </span>
              <span className="text-[#2C302A]" aria-hidden="true">/</span>
              <span className="text-xs font-mono text-[#8A8E85]">
                06 SELECTED WORKS
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F0] tracking-tight">
              Selected Projects.
            </h2>
            <p className="text-sm sm:text-base text-[#C5C8C1] max-w-xl">
              A curated survey of brand identities, modern posters, modular social systems, and editorial print layouts.
            </p>
          </div>

          {/* Interactive Filter Controls - Segmented Buttons */}
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] ${
                    isActive
                      ? 'bg-[#C8FF45] text-[#101110] font-bold shadow-sm'
                      : 'text-[#C5C8C1] hover:text-[#F5F5F0] hover:bg-[#222521]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="pt-10">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => setActiveProject(p)}
                />
              ))}
            </div>
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
        </div>

        {/* Concept Showcase Transparency Banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-xl border border-[#2C302A] bg-[#191B18]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A8E85]">
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-[#C8FF45] shrink-0" />
            <p>
              <strong className="text-[#F5F5F0]">Transparent Notice: </strong>
              The items in this portfolio are studio concept projects and artistic samples. As real client engagements launch, they replace these samples seamlessly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onInquireService('General Inquiry / Consultation')}
            className="text-[#C8FF45] font-semibold hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Commission Custom Project &rarr;
          </button>
        </div>

      </div>

      {/* Accessible Detail Lightbox Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onInquireService={(service) => {
          setActiveProject(null);
          onInquireService(service);
        }}
      />
    </section>
  );
};
