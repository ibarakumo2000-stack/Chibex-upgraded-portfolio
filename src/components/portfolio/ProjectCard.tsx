import React, { useState } from 'react';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { Project } from '../../types/portfolio';
import { useAuth } from '../../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isProjectSaved, toggleSaveProject } = useAuth();

  const isSaved = isProjectSaved(project.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProject(project);
  };

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`View project details for ${project.title}`}
      className="group relative flex flex-col rounded-xl border border-[#2C302A] bg-[#191B18] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#C8FF45]/60 hover:shadow-2xl hover:shadow-black/60 focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
    >
      {/* Media Container with stable aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#101110]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#222521] animate-pulse" />
        )}

        {!imageError ? (
          <img
            src={project.imagePath}
            alt={project.imageAlt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-[#8A8E85]">
            <span>{project.title} Preview</span>
          </div>
        )}

        {/* Hover Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101110]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Floating Controls: Bookmark + Inspect */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* Moodboard Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            title={isSaved ? 'Saved to moodboard' : 'Save to moodboard'}
            aria-label={isSaved ? 'Remove from moodboard' : 'Save to moodboard'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isSaved
                ? 'bg-[#38bdf8] text-[#101110] border-[#38bdf8] shadow-md shadow-[#38bdf8]/30 opacity-100'
                : 'bg-[#101110]/80 border-[#2C302A] text-[#C5C8C1] hover:text-[#38bdf8] hover:border-[#38bdf8]/60 opacity-90 sm:opacity-0 group-hover:opacity-100'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Action arrow */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#101110]/80 border border-[#2C302A] text-[#F5F5F0] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 group-hover:bg-[#C8FF45] group-hover:text-[#101110] group-hover:border-[#C8FF45]">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          {/* Metadata - Clean Unboxed Text with Separators */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A8E85]">
            <span className="text-[#C8FF45]">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            {project.isConcept && (
              <>
                <span aria-hidden="true">·</span>
                <span>Concept</span>
              </>
            )}
          </div>

          {/* Project Title */}
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#F5F5F0] group-hover:text-[#C8FF45] transition-colors leading-snug">
            {project.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#C5C8C1] line-clamp-2 leading-relaxed">
            {project.shortDescription}
          </p>
        </div>

        {/* Card Footer: Deliverables snippet & explicit action affordance */}
        <div className="pt-3 border-t border-[#2C302A]/60 flex items-center justify-between text-xs">
          <span className="text-[#8A8E85] truncate max-w-[190px]">
            {project.deliverables[0]}
          </span>
          <span className="font-semibold text-[#F5F5F0] group-hover:text-[#C8FF45] transition-colors whitespace-nowrap flex items-center gap-1">
            View Details &rarr;
          </span>
        </div>
      </div>
    </motion.article>
  );
};
