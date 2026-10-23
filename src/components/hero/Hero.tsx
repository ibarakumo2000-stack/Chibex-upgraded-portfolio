import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { siteConfig } from '../../data/site-config';
import { heroAsset } from '../../data/projects';
import { AdaptiveIntelligenceLayer } from '../intelligence/AdaptiveIntelligenceLayer';

interface HeroProps {
  onStartProject?: () => void;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartProject, onOpenBooking }) => {
  const [activeVisual, setActiveVisual] = useState<'3d' | 'archive'>('3d');
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 border-b border-[#2C302A] overflow-hidden">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-[#C8FF45]/5 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Typographic Hierarchy & Conversion CTAs with Smooth Motion Stagger */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-mono font-medium uppercase tracking-widest text-[#C8FF45]">
                  {siteConfig.brand.eyebrow}
                </span>
                <span className="text-[#2C302A]" aria-hidden="true">/</span>
                <span className="text-xs font-mono text-[#8A8E85]">
                  EST. 2024
                </span>
              </div>

              {/* Primary Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F0] leading-[1.08] [text-wrap:balance]">
                Turning Ideas Into{' '}
                <span className="text-[#C8FF45] relative inline-block">
                  Visual Impact.
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#C8FF45]/40 origin-left"
                  />
                </span>
              </h1>

              {/* Supporting Lead Copy */}
              <p className="text-base sm:text-lg text-[#C5C8C1] leading-relaxed max-w-xl">
                {siteConfig.brand.heroSupporting}
              </p>
            </motion.div>

            {/* Structured Conversion CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 pt-1"
            >
              <div className="flex flex-wrap items-center gap-3.5">
                {/* Primary CTA: Book a Free 30-Minute Call */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onOpenBooking}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-[#C8FF45] px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] focus:ring-offset-2 focus:ring-offset-[#101110] shadow-lg shadow-[#C8FF45]/15 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Book a Free 30-Minute Call</span>
                </motion.button>

                {/* Secondary CTA: View Projects */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('projects') || document.getElementById('work');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/work');
                    }
                  }}
                  className="inline-flex items-center gap-2.5 rounded-lg border border-[#2C302A] bg-[#191B18]/90 hover:bg-[#222521] px-6 py-4 text-xs sm:text-sm font-bold text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45] transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] shadow-sm cursor-pointer"
                >
                  <span>View Projects</span>
                  <ArrowDown className="h-4 w-4 text-[#C8FF45] shrink-0" />
                </motion.button>
              </div>
            </motion.div>

            {/* Editorial Discipline Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 pt-8 border-t border-[#2C302A] text-xs"
            >
              <div>
                <p className="font-mono text-[#8A8E85]">FOCUS</p>
                <p className="mt-1 font-medium text-[#F5F5F0]">Identity & Editorial</p>
              </div>
              <div>
                <p className="font-mono text-[#8A8E85]">CONSULTATION</p>
                <p className="mt-1 font-medium text-[#C8FF45]">30-Min Free Strategy</p>
              </div>
              <div>
                <p className="font-mono text-[#8A8E85]">WHATSAPP</p>
                <p className="mt-1 font-medium text-[#F5F5F0]">{siteConfig.whatsapp.displayNumber}</p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: 3D Visual & Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col space-y-3"
          >
            {/* Visual Selector Tabs */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono text-[#8A8E85] uppercase tracking-wider">
                STUDIO VISUAL SHOWCASE
              </span>

              <div className="flex items-center gap-1 p-1 bg-[#191B18] border border-[#2C302A] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveVisual('3d')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                    activeVisual === '3d'
                      ? 'bg-[#C8FF45] text-[#101110] font-bold'
                      : 'text-[#C5C8C1] hover:text-[#F5F5F0]'
                  }`}
                >
                  Adaptive 3D
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisual('archive')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                    activeVisual === 'archive'
                      ? 'bg-[#C8FF45] text-[#101110] font-bold'
                      : 'text-[#C5C8C1] hover:text-[#F5F5F0]'
                  }`}
                >
                  Print Archive
                </button>
              </div>
            </div>

            {/* Visual Container with AnimatePresence */}
            <AnimatePresence mode="wait">
              {activeVisual === '3d' ? (
                <motion.div
                  key="visual-3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdaptiveIntelligenceLayer />
                </motion.div>
              ) : (
                <motion.div
                  key="visual-archive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative group overflow-hidden rounded-2xl border border-[#2C302A] bg-[#191B18] aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center"
                >
                  {!imageError ? (
                    <img
                      src={heroAsset.src}
                      alt={heroAsset.alt}
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm font-medium text-[#F5F5F0]">{siteConfig.brand.name} Archive</p>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#101110]/80 backdrop-blur-md border border-[#2C302A] px-3 py-1 rounded text-[11px] font-mono text-[#C5C8C1]">
                    STUDIO SELECTION
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101110]/90 via-[#101110]/40 to-transparent p-4 sm:p-5">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#C8FF45]">
                      FEATURED ARTIFACT
                    </p>
                    <p className="text-sm font-medium text-[#F5F5F0] mt-0.5">
                      Architectural Typographic Systems & Stationary Mockups
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
