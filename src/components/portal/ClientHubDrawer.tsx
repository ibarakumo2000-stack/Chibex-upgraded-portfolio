import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Bookmark,
  Send,
  LogOut,
  ExternalLink,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sampleProjects } from '../../data/projects';
import { siteConfig } from '../../data/site-config';

interface ClientHubDrawerProps {
  onOpenBooking: () => void;
  onOpenProject?: (project: any) => void;
}

export const ClientHubDrawer: React.FC<ClientHubDrawerProps> = ({
  onOpenBooking,
  onOpenProject,
}) => {
  const {
    currentUser,
    isHubOpen,
    closeHub,
    logout,
    userBookings,
    cancelBooking,
    savedProjects,
    removeSavedProject,
    submitInquiry,
    isAdmin,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'moodboard' | 'inquiry'>('bookings');

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState(currentUser?.displayName || '');
  const [inquiryEmail, setInquiryEmail] = useState(currentUser?.email || '');
  const [inquiryService, setInquiryService] = useState('Cinematic Poster & Art');
  const [inquiryBudget, setInquiryBudget] = useState('$500 - $1,500');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  if (!isHubOpen || !currentUser) return null;

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) return;

    setInquirySubmitting(true);
    try {
      await submitInquiry({
        name: inquiryName,
        email: inquiryEmail,
        service: inquiryService,
        budget: inquiryBudget,
        message: inquiryMessage,
      });
      setInquirySubmitted(true);
      setInquiryMessage('');
      setTimeout(() => setInquirySubmitted(false), 4000);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeHub}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md h-full bg-[#141613] border-l border-[#2C302A] shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#2C302A] flex items-center justify-between bg-[#101110]">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="h-10 w-10 rounded-full border border-[#C8FF45]/40 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#C8FF45]/20 text-[#C8FF45] font-bold flex items-center justify-center text-sm border border-[#C8FF45]/40">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#F5F5F0]">
                    {currentUser.displayName || 'Client'}
                  </h4>
                  {isAdmin && (
                    <span className="rounded bg-[#C8FF45]/20 border border-[#C8FF45]/50 px-1.5 py-0.2 text-[10px] font-mono text-[#C8FF45]">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8A8E85] truncate max-w-[190px]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  logout();
                  closeHub();
                }}
                title="Sign out"
                className="p-2 text-[#8A8E85] hover:text-red-400 rounded-lg hover:bg-[#1C1E1B] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <button
                onClick={closeHub}
                title="Close"
                className="p-2 text-[#8A8E85] hover:text-[#F5F5F0] rounded-lg hover:bg-[#1C1E1B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#2C302A] bg-[#101110]/50 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#1F221D] text-[#C8FF45] border border-[#2C302A] shadow-sm'
                  : 'text-[#8A8E85] hover:text-[#F5F5F0]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Calls ({userBookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('moodboard')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'moodboard'
                  ? 'bg-[#1F221D] text-[#38bdf8] border border-[#2C302A] shadow-sm'
                  : 'text-[#8A8E85] hover:text-[#F5F5F0]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Moodboard ({savedProjects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inquiry')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'inquiry'
                  ? 'bg-[#1F221D] text-[#e0b84c] border border-[#2C302A] shadow-sm'
                  : 'text-[#8A8E85] hover:text-[#F5F5F0]'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Inquire</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* TAB 1: CONSULTATION BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-sm text-[#F5F5F0]">
                      Your Consultation Schedule
                    </h5>
                    <p className="text-xs text-[#8A8E85]">
                      1-on-1 Creative Direction calls with E-tech Visuals
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeHub();
                      onOpenBooking();
                    }}
                    className="text-xs font-mono font-medium text-[#101110] bg-[#C8FF45] hover:bg-[#d6ff6a] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book New</span>
                  </button>
                </div>

                {userBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2C302A] bg-[#191B18]/50 p-8 text-center space-y-3">
                    <div className="h-10 w-10 mx-auto rounded-full bg-[#C8FF45]/10 text-[#C8FF45] flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-[#F5F5F0]">No calls scheduled yet</p>
                    <p className="text-xs text-[#8A8E85] max-w-xs mx-auto">
                      Reserve a free 30-minute consultation to discuss branding, posters, event flyers, or advertising systems.
                    </p>
                    <button
                      onClick={() => {
                        closeHub();
                        onOpenBooking();
                      }}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#101110] bg-[#C8FF45] px-4 py-2 rounded-lg hover:bg-[#d6ff6a] transition-all cursor-pointer"
                    >
                      <span>Schedule 30-Min Call</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border border-[#2C302A] bg-[#191B18] p-4 space-y-3 hover:border-[#C8FF45]/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C8FF45]">
                              {b.serviceInterest}
                            </span>
                            <h6 className="text-sm font-semibold text-[#F5F5F0]">
                              {b.date} • {b.timeSlot}
                            </h6>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : b.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {b.status.toUpperCase()}
                          </span>
                        </div>

                        {b.notes && (
                          <p className="text-xs text-[#A0A59C] bg-[#101110] p-2 rounded-lg border border-[#2C302A]">
                            "{b.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#2C302A] text-xs">
                          <span className="text-[11px] text-[#8A8E85]">
                            Booked: {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              Cancel Call
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MOODBOARD & SAVED WORKS */}
            {activeTab === 'moodboard' && (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-sm text-[#F5F5F0]">
                    Curated Client Moodboard
                  </h5>
                  <p className="text-xs text-[#8A8E85]">
                    Saved concept references to guide your upcoming design project
                  </p>
                </div>

                {savedProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2C302A] bg-[#191B18]/50 p-8 text-center space-y-3">
                    <div className="h-10 w-10 mx-auto rounded-full bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
                      <Bookmark className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-[#F5F5F0]">Your moodboard is empty</p>
                    <p className="text-xs text-[#8A8E85] max-w-xs mx-auto">
                      Click the bookmark icon on any project in the gallery to curate your personalized creative moodboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProjects.map((sp) => {
                      const fullProject = sampleProjects.find((p) => p.id === sp.projectId);
                      return (
                        <div
                          key={sp.id}
                          className="flex items-center gap-3 rounded-xl border border-[#2C302A] bg-[#191B18] p-3 hover:border-[#38bdf8]/40 transition-all group"
                        >
                          {sp.imageUrl ? (
                            <img
                              src={sp.imageUrl}
                              alt={sp.projectTitle}
                              className="h-14 w-14 rounded-lg object-cover border border-[#2C302A] shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-[#242822] flex items-center justify-center shrink-0 text-xs font-mono text-[#8A8E85]">
                              IMG
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-[#38bdf8]">
                              {sp.category}
                            </span>
                            <h6 className="text-xs font-bold text-[#F5F5F0] truncate">
                              {sp.projectTitle}
                            </h6>
                            <p className="text-[11px] text-[#8A8E85]">
                              Saved {new Date(sp.savedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {fullProject && onOpenProject && (
                              <button
                                onClick={() => {
                                  closeHub();
                                  onOpenProject(fullProject);
                                }}
                                title="Inspect project"
                                className="p-1.5 text-[#8A8E85] hover:text-[#F5F5F0] rounded-md transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => removeSavedProject(sp.projectId)}
                              title="Remove from moodboard"
                              className="p-1.5 text-[#8A8E85] hover:text-red-400 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIRECT INQUIRY */}
            {activeTab === 'inquiry' && (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <h5 className="font-semibold text-sm text-[#F5F5F0]">
                    Direct Project Brief
                  </h5>
                  <p className="text-xs text-[#8A8E85]">
                    Send your project specifications straight to E-tech Visuals
                  </p>
                </div>

                {inquirySubmitted && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex items-center gap-3 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Inquiry submitted! Our creative director will respond within 24 hours.</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#8A8E85] mb-1 font-mono">YOUR NAME</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3 py-2 text-[#F5F5F0] focus:border-[#C8FF45] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8E85] mb-1 font-mono">CONTACT EMAIL</label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3 py-2 text-[#F5F5F0] focus:border-[#C8FF45] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8E85] mb-1 font-mono">SERVICE NEEDED</label>
                    <select
                      value={inquiryService}
                      onChange={(e) => setInquiryService(e.target.value)}
                      className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3 py-2 text-[#F5F5F0] focus:border-[#C8FF45] focus:outline-none"
                    >
                      <option value="Cinematic Poster & Art">Cinematic Poster & Art Direction</option>
                      <option value="Event Flyer & Festival Promotion">Event Flyer & Festival Promotion</option>
                      <option value="Full Brand Identity & Guidelines">Full Brand Identity & Guidelines</option>
                      <option value="Advertising & Digital Campaign">Advertising & Digital Campaign</option>
                      <option value="Editorial & Print Architecture">Editorial & Print Architecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8E85] mb-1 font-mono">ESTIMATED BUDGET</label>
                    <select
                      value={inquiryBudget}
                      onChange={(e) => setInquiryBudget(e.target.value)}
                      className="w-full rounded-lg border border-[#2C302A] bg-[#101110] px-3 py-2 text-[#F5F5F0] focus:border-[#C8FF45] focus:outline-none"
                    >
                      <option value="Under $500">Under $500</option>
                      <option value="$500 - $1,500">$500 - $1,500</option>
                      <option value="$1,500 - $3,500">$1,500 - $3,500</option>
                      <option value="$3,500+">$3,500+ (Enterprise / Full Campaign)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8E85] mb-1 font-mono">PROJECT BRIEF / GOALS</label>
                    <textarea
                      required
                      rows={4}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Describe your visual concept, target audience, and key deliverables..."
                      className="w-full rounded-lg border border-[#2C302A] bg-[#101110] p-3 text-[#F5F5F0] focus:border-[#C8FF45] focus:outline-none placeholder:text-[#555a50]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C8FF45] hover:bg-[#d6ff6a] text-[#101110] font-bold py-3 text-xs tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{inquirySubmitting ? 'SUBMITTING BRIEF...' : 'TRANSMIT PROJECT BRIEF'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
