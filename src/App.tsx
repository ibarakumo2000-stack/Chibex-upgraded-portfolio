import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ClientHubDrawer } from './components/portal/ClientHubDrawer';
import { BookingModal } from './components/booking/BookingModal';
import { ProjectModal } from './components/portfolio/ProjectModal';
import { Header } from './components/navigation/Header';
import { Footer } from './components/footer/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { WebsiteConcierge } from './components/ai/WebsiteConcierge';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { Project } from './types/portfolio';
import { trackActivity } from './lib/analytics';

// Individual Pages
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { DownloadPage } from './pages/DownloadPage';

// Automatic route-level visitor telemetry component
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackActivity('page_view', `Visited ${location.pathname}`);
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [globalBookingOpen, setGlobalBookingOpen] = useState(false);
  const [globalActiveProject, setGlobalActiveProject] = useState<Project | null>(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <PageTracker />
        <div className="min-h-screen flex flex-col bg-[#101110] text-[#F5F5F0]">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/download" element={<DownloadPage />} />
              {/* Studio Command Center (restricted to authorized administrators) */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <FloatingWhatsApp />

          <WebsiteConcierge
            onOpenBooking={() => setGlobalBookingOpen(true)}
            onOpenProject={(proj) => setGlobalActiveProject(proj)}
          />

          <AuthModal />
          <ClientHubDrawer
            onOpenBooking={() => setGlobalBookingOpen(true)}
            onOpenProject={(proj) => setGlobalActiveProject(proj)}
          />

          <CookieConsentBanner />

          <BookingModal
            isOpen={globalBookingOpen}
            onClose={() => setGlobalBookingOpen(false)}
          />
          <ProjectModal
            project={globalActiveProject}
            onClose={() => setGlobalActiveProject(null)}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
