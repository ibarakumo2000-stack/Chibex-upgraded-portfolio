import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { Project } from './types/portfolio';

// Individual Pages
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  const [globalBookingOpen, setGlobalBookingOpen] = useState(false);
  const [globalActiveProject, setGlobalActiveProject] = useState<Project | null>(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#101110] text-[#F5F5F0]">
          {/* Top Bar Navigation */}
          <Header />

          {/* Individual Page Routes */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              {/* Catch-all route gracefully navigates to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Global Floating WhatsApp Direct Message Button */}
          <FloatingWhatsApp />

          {/* Global Floating AI Creative Concierge */}
          <WebsiteConcierge
            onOpenBooking={() => setGlobalBookingOpen(true)}
            onOpenProject={(proj) => setGlobalActiveProject(proj)}
          />

          {/* Client Authentication & Hub Drawers */}
          <AuthModal />
          <ClientHubDrawer
            onOpenBooking={() => setGlobalBookingOpen(true)}
            onOpenProject={(proj) => setGlobalActiveProject(proj)}
          />

          {/* Global Modals for Booking & Projects triggered from Hub */}
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
