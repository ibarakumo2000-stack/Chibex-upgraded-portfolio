import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight, Sparkles, Bookmark, User as UserIcon, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../data/site-config';
import { useAuth } from '../../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { currentUser, openAuthModal, openHub, savedProjects, isAdmin } = useAuth();

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      ref={menuRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#101110]/98 backdrop-blur-xl md:hidden"
    >
      {/* Top bar inside mobile overlay */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C302A]">
        <Link
          to="/"
          onClick={onClose}
          className="font-display text-lg font-bold tracking-tight text-[#F5F5F0] flex items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#191B18] border border-[#2C302A] text-xs font-mono font-bold text-[#C8FF45]">
            E
          </span>
          <span>{siteConfig.brand.name}</span>
        </Link>
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          type="button"
          aria-label="Close navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2C302A] text-[#C5C8C1] hover:text-[#F5F5F0] hover:border-[#C8FF45] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col justify-center px-8 py-8 space-y-5">
        {siteConfig.navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between border-b border-[#2C302A]/50 pb-4 text-2xl font-display font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8FF45] rounded-sm ${
                isActive ? 'text-[#C8FF45]' : 'text-[#F5F5F0] hover:text-[#C8FF45]'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-xs font-mono text-[#8A8E85]">0{index + 1}</span>
            </Link>
          );
        })}

        <div className="pt-4 space-y-3">
          <Link
            to="/contact"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8FF45] py-3.5 px-6 text-sm font-semibold tracking-wide text-[#101110] hover:bg-[#bbf033] active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-[#C8FF45] focus:ring-offset-2 focus:ring-offset-[#101110]"
          >
            <span>Start a Project</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Admin Command Center Link */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C8FF45]/60 bg-[#C8FF45]/15 py-3 px-6 text-sm font-mono font-bold text-[#C8FF45] hover:bg-[#C8FF45]/25 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Studio Command Center</span>
            </Link>
          )}

          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                openHub();
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#2C302A] bg-[#191B18] py-3 px-6 text-sm font-medium text-[#F5F5F0] hover:border-[#C8FF45] transition-all"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-[#C8FF45]" />
              )}
              <span>Client Hub</span>
              {savedProjects.length > 0 && (
                <span className="flex items-center gap-1 rounded bg-[#C8FF45]/15 px-1.5 py-0.5 text-[11px] font-mono text-[#C8FF45]">
                  <Bookmark className="h-3 w-3 fill-current" />
                  {savedProjects.length}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#2C302A] bg-[#141613] py-3 px-6 text-sm font-medium text-[#C5C8C1] hover:text-[#F5F5F0] hover:border-[#C8FF45]/60 transition-all"
            >
              <Sparkles className="h-4 w-4 text-[#C8FF45]" />
              <span>Client Portal Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Footer info within drawer */}
      <div className="border-t border-[#2C302A] px-8 py-5 text-xs text-[#8A8E85] space-y-1">
        <p className="font-mono text-[#F5F5F0]">{siteConfig.contact.phonePlaceholder} · {siteConfig.contact.emailPlaceholder}</p>
        <p className="text-[#8A8E85]">{siteConfig.contact.responseCommitment}</p>
      </div>
    </div>
  );
};
