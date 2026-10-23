import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Project } from '../../types/portfolio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onInquireService?: (serviceTitle: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onInquireService,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-[#191B18] border border-[#2C302A] rounded-xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C302A] bg-[#101110]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A8E85]">
            <span className="text-[#C8FF45]">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            {project.isConcept && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#C5C8C1]">Concept Study</span>
              </>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close project modal (Escape)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2C302A] text-[#C5C8C1] hover:text-[#F5F5F0] hover:border-[#C8FF45] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[82vh] overflow-y-auto">
          {/* Main Visual Image */}
          <div className="relative bg-[#101110] aspect-video w-full overflow-hidden border-b border-[#2C302A]">
            <img
              src={project.imagePath}
              alt={project.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2
                id="modal-project-title"
                className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight"
              >
                {project.title}
              </h2>
              <p className="mt-2 text-xs font-mono text-[#8A8E85]">
                CONTEXT: {project.clientContext}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#C5C8C1] leading-relaxed">
              {project.fullDescription}
            </p>

            {/* Deliverables List */}
            <div className="pt-4 border-t border-[#2C302A]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8FF45] mb-3">
                PROJECT DELIVERABLES & SCOPE
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[#F5F5F0]">
                    <CheckCircle className="h-4 w-4 text-[#C8FF45] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transparent Sample Disclosure */}
            {project.isConcept && (
              <div className="rounded-lg border border-[#2C302A] bg-[#101110] p-4 text-xs text-[#8A8E85] flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-[#C8FF45] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F5F5F0]">Studio Concept Sample: </span>
                  This project demonstrates E-tech Visuals' design methodology, grid architecture, and visual execution standards. It is presented as a concept exploration until bespoke client case studies are commissioned.
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#2C302A]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#C5C8C1] hover:text-[#F5F5F0] transition-colors"
              >
                Back to Gallery
              </button>

              {onInquireService && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInquireService(project.category);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all"
                >
                  <span>Inquire Similar Project</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
