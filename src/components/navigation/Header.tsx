import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Bookmark, Sparkles, User as UserIcon } from 'lucide-react';
import { siteConfig } from '../../data/site-config';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { currentUser, openAuthModal, openHub, savedProjects, userBookings } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-[#101110]/92 backdrop-blur-md border-[#2C302A] py-3.5 shadow-lg shadow-black/20'
            : 'bg-[#101110] border-transparent py-5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Zone 1: Single text element wordmark */}
            <Link
              to="/"
              className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-[#F5F5F0] hover:text-[#C8FF45] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 group"
              aria-label="E-tech Visuals Home"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#191B18] border border-[#2C302A] text-xs font-mono font-bold text-[#C8FF45] group-hover:border-[#C8FF45] transition-colors">
                E
              </span>
              <span>{siteConfig.brand.name}</span>
            </Link>

            {/* Zone 2: Clean single-line nav links with active routing state */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-8 text-sm font-medium text-[#C5C8C1]"
            >
              {siteConfig.navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `whitespace-nowrap shrink-0 relative py-1 transition-colors ${
                      isActive
                        ? 'text-[#C8FF45] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C8FF45] after:scale-x-100'
                        : 'text-[#C5C8C1] hover:text-[#F5F5F0] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C8FF45] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Zone 3: Client Hub / Auth & Primary CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {/* Client Auth / Portal Button */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={openHub}
                  className="flex items-center gap-2 rounded-lg border border-[#2C302A] bg-[#191B18] hover:border-[#C8FF45]/60 hover:bg-[#1F221D] px-2.5 py-1.5 text-xs text-[#F5F5F0] transition-all cursor-pointer group"
                  title="Open Client Hub"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="h-6 w-6 rounded-full border border-[#C8FF45]/40 object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[#C8FF45]/20 text-[#C8FF45] flex items-center justify-center text-[11px] font-bold">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium truncate max-w-[90px]">
                    {currentUser.displayName?.split(' ')[0] || 'Portal'}
                  </span>
                  {(savedProjects.length > 0 || userBookings.length > 0) && (
                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#C8FF45] text-[#101110] text-[10px] font-bold font-mono">
                      {savedProjects.length + userBookings.length}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#2C302A] bg-[#191B18] hover:border-[#38bdf8]/60 hover:text-[#38bdf8] px-3 py-1.5 text-xs font-medium text-[#C5C8C1] transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>Client Login</span>
                </button>
              )}

              {/* Start a Project Primary Action */}
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#C8FF45] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C8FF45] focus:ring-offset-2 focus:ring-offset-[#101110]"
              >
                Start a Project
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-label="Open mobile navigation menu"
                className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[#2C302A] bg-[#191B18] text-[#F5F5F0] hover:border-[#C8FF45] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8FF45]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Accessible mobile drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
