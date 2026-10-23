import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Users,
  Calendar,
  MessageSquare,
  Eye,
  Bookmark,
  RefreshCw,
  Search,
  Filter,
  Download,
  Clock,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ActivityEvent, getLocalActivityLogs } from '../lib/analytics';
import { BookingRecord, SavedProjectRecord } from '../context/AuthContext';

const ADMIN_EMAILS = ['ibarakumo2000@gmail.com', 'emperorstech885@gmail.com'];

export const AdminPage: React.FC = () => {
  const { currentUser, isAdmin, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'activity' | 'sessions' | 'inquiries' | 'bookings'>('activity');
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Fetch Firestore activity logs with fallback to local activity cache
  const loadAdminData = async () => {
    setIsLoading(true);
    setLastRefreshed(new Date().toLocaleTimeString());

    // 1. Load local cache first for instant feedback
    const localLogs = getLocalActivityLogs();
    if (localLogs.length > 0) {
      setActivityLogs(localLogs);
    }

    // 2. Fetch cloud activityLogs if accessible
    try {
      const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      const items: ActivityEvent[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as ActivityEvent);
      });
      if (items.length > 0) {
        // Merge cloud and local logs by unique ID
        const map = new Map<string, ActivityEvent>();
        [...items, ...localLogs].forEach((log) => map.set(log.id, log));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivityLogs(merged);
      }
    } catch (err) {
      console.warn('Admin Firestore cloud logs sync notice, displaying local audit stream:', err);
    }

    // 3. Fetch Inquiries
    try {
      const inqSnap = await getDocs(query(collection(db, 'inquiries'), limit(50)));
      const inqItems: any[] = [];
      inqSnap.forEach((d) => inqItems.push(d.data()));
      setInquiries(inqItems);
    } catch {
      // Local fallback
    }

    // 4. Fetch Bookings
    try {
      const bookSnap = await getDocs(query(collection(db, 'bookings'), limit(50)));
      const bookItems: BookingRecord[] = [];
      bookSnap.forEach((d) => bookItems.push(d.data() as BookingRecord));
      setBookings(bookItems);
    } catch {
      // Local fallback
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // If NOT authorized admin, show access locked view
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl border border-red-900/60 bg-[#141613] p-8 text-center shadow-2xl space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/50 border border-red-700/60 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
              RESTRICTED ACCESS
            </span>
            <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">
              Studio Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#C5C8C1] leading-relaxed">
              This administrative dashboard is strictly restricted to designated studio owners. Only the following authorized accounts are permitted:
            </p>
          </div>

          <div className="rounded-xl border border-[#2C302A] bg-[#101110] p-4 text-xs font-mono text-left space-y-2 text-[#C8FF45]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45]" />
              <span>emperorstech885@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45]" />
              <span>ibarakumo2000@gmail.com</span>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-[#8A8E85]">
                Currently signed in as: <strong className="text-[#F5F5F0]">{currentUser.email || 'Guest User'}</strong>
              </p>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2C302A] bg-[#191B18] px-4 py-2.5 text-xs text-[#F5F5F0] hover:text-red-400 hover:border-red-800 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out of Current Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={openAuthModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8FF45] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#101110] hover:bg-[#bbf033] transition-all cursor-pointer shadow-lg shadow-[#C8FF45]/15"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Authenticate Admin Google Account</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-[#2C302A]">
            <Link
              to="/"
              className="text-xs text-[#8A8E85] hover:text-[#C8FF45] transition-colors"
            >
              &larr; Return to Public Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter logs by action and search keyword
  const filteredLogs = activityLogs.filter((log) => {
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        log.sessionId.toLowerCase().includes(q) ||
        log.page.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Aggregate user sessions
  const sessionMap = new Map<
    string,
    {
      sessionId: string;
      userEmail?: string;
      device: string;
      eventCount: number;
      pages: Set<string>;
      firstSeen: string;
      lastSeen: string;
      actions: string[];
    }
  >();

  activityLogs.forEach((log) => {
    const existing = sessionMap.get(log.sessionId);
    if (!existing) {
      sessionMap.set(log.sessionId, {
        sessionId: log.sessionId,
        userEmail: log.userEmail,
        device: log.device || 'Desktop',
        eventCount: 1,
        pages: new Set([log.page]),
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        actions: [log.action],
      });
    } else {
      existing.eventCount += 1;
      existing.pages.add(log.page);
      if (new Date(log.timestamp) > new Date(existing.lastSeen)) {
        existing.lastSeen = log.timestamp;
      }
      if (new Date(log.timestamp) < new Date(existing.firstSeen)) {
        existing.firstSeen = log.timestamp;
      }
      if (!existing.userEmail && log.userEmail) {
        existing.userEmail = log.userEmail;
      }
      if (!existing.actions.includes(log.action)) {
        existing.actions.push(log.action);
      }
    }
  });

  const sessionList = Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );

  const exportActivityJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `etech_user_activity_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="py-8 md:py-14 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="rounded-2xl border border-[#2C302A] bg-[#141613] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C8FF45]/40 bg-[#C8FF45]/10 px-3 py-1 text-xs font-mono font-bold text-[#C8FF45]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>AUTHORIZED STUDIO ADMINISTRATOR</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
              Studio Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#C5C8C1]">
              Signed in as <strong className="text-[#F5F5F0]">{currentUser?.email}</strong>. Live visitor activity stream and studio engagement intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2C302A] bg-[#191B18] px-4 py-2.5 text-xs font-bold text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45] transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stream</span>
            </button>

            <button
              type="button"
              onClick={exportActivityJson}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2C302A] bg-[#191B18] px-4 py-2.5 text-xs font-bold text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45] transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="p-2.5 rounded-xl border border-[#2C302A] bg-[#191B18] text-[#8A8E85] hover:text-red-400 hover:border-red-900 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl border border-[#2C302A] bg-[#141613]">
            <div className="flex items-center justify-between text-xs font-mono text-[#8A8E85] mb-2">
              <span>VISITOR SESSIONS</span>
              <Users className="h-4 w-4 text-[#38bdf8]" />
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#F5F5F0]">{sessionList.length}</p>
            <p className="text-[11px] text-[#8A8E85] mt-1">Unique visitor footprints</p>
          </div>

          <div className="p-5 rounded-xl border border-[#2C302A] bg-[#141613]">
            <div className="flex items-center justify-between text-xs font-mono text-[#8A8E85] mb-2">
              <span>LOGGED ACTIONS</span>
              <Activity className="h-4 w-4 text-[#C8FF45]" />
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#C8FF45]">{activityLogs.length}</p>
            <p className="text-[11px] text-[#8A8E85] mt-1">Consented interactions captured</p>
          </div>

          <div className="p-5 rounded-xl border border-[#2C302A] bg-[#141613]">
            <div className="flex items-center justify-between text-xs font-mono text-[#8A8E85] mb-2">
              <span>CALL RESERVATIONS</span>
              <Calendar className="h-4 w-4 text-[#e0b84c]" />
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#F5F5F0]">{bookings.length}</p>
            <p className="text-[11px] text-[#8A8E85] mt-1">30-min strategy requests</p>
          </div>

          <div className="p-5 rounded-xl border border-[#2C302A] bg-[#141613]">
            <div className="flex items-center justify-between text-xs font-mono text-[#8A8E85] mb-2">
              <span>INQUIRIES SUBMITTED</span>
              <MessageSquare className="h-4 w-4 text-[#a855f7]" />
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#F5F5F0]">{inquiries.length}</p>
            <p className="text-[11px] text-[#8A8E85] mt-1">Project quotes & briefs</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2C302A] overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'border-[#C8FF45] text-[#C8FF45]'
                : 'border-transparent text-[#8A8E85] hover:text-[#F5F5F0]'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Live Activity Stream ({activityLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sessions'
                ? 'border-[#C8FF45] text-[#C8FF45]'
                : 'border-transparent text-[#8A8E85] hover:text-[#F5F5F0]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Visitor Sessions ({sessionList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-[#C8FF45] text-[#C8FF45]'
                : 'border-transparent text-[#8A8E85] hover:text-[#F5F5F0]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Inquiries ({inquiries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#C8FF45] text-[#C8FF45]'
                : 'border-transparent text-[#8A8E85] hover:text-[#F5F5F0]'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Consultation Calls ({bookings.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Activity Stream */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#2C302A] bg-[#141613]">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-[#8A8E85] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword, action, project, or email..."
                  className="bg-transparent text-xs text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-3.5 w-3.5 text-[#8A8E85]" />
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="rounded-lg border border-[#2C302A] bg-[#101110] px-3 py-1.5 text-xs text-[#F5F5F0] focus:outline-none focus:ring-1 focus:ring-[#C8FF45]"
                >
                  <option value="all">All Actions</option>
                  <option value="page">Page Views</option>
                  <option value="project">Project Views</option>
                  <option value="bookmark">Bookmarks</option>
                  <option value="booking">Bookings</option>
                  <option value="inquiry">Inquiries</option>
                  <option value="ai">AI Concierge</option>
                  <option value="cookie">Cookie Consent</option>
                </select>
              </div>
            </div>

            {/* Activity Stream Feed */}
            {filteredLogs.length > 0 ? (
              <div className="space-y-2.5">
                {filteredLogs.map((log) => {
                  const isUser = Boolean(log.userEmail || log.userId);
                  const isBooking = log.action.includes('booking');
                  const isBookmark = log.action.includes('bookmark');
                  const isProject = log.action.includes('project');

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-[#2C302A] bg-[#141613] hover:border-[#C8FF45]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 border ${
                            isBooking
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : isBookmark
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                              : isProject
                              ? 'bg-[#C8FF45]/15 border-[#C8FF45]/30 text-[#C8FF45]'
                              : 'bg-[#191B18] border-[#2C302A] text-[#8A8E85]'
                          }`}
                        >
                          {isBooking ? (
                            <Calendar className="h-4 w-4" />
                          ) : isBookmark ? (
                            <Bookmark className="h-4 w-4" />
                          ) : isProject ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                        </span>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#F5F5F0]">
                              {log.action.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="font-mono text-[10px] text-[#8A8E85]">
                              on {log.page}
                            </span>
                            {isUser && (
                              <span className="rounded bg-[#C8FF45]/15 border border-[#C8FF45]/40 px-1.5 py-0.5 text-[10px] font-mono text-[#C8FF45]">
                                {log.userEmail || 'Client'}
                              </span>
                            )}
                          </div>

                          {log.details && (
                            <p className="text-[#C5C8C1] leading-relaxed">
                              {log.details}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-[#8A8E85] font-mono pt-0.5">
                            <span className="flex items-center gap-1">
                              {log.device === 'Mobile' ? (
                                <Smartphone className="h-3 w-3" />
                              ) : (
                                <Monitor className="h-3 w-3" />
                              )}
                              <span>{log.device || 'Desktop'}</span>
                            </span>
                            <span>·</span>
                            <span>Session: {log.sessionId.slice(0, 14)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:self-center font-mono text-[11px] text-[#8A8E85] shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-[#2C302A] p-6 text-xs text-[#8A8E85]">
                No activity logs match the selected filter.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Visitor Sessions */}
        {activeTab === 'sessions' && (
          <div className="rounded-xl border border-[#2C302A] bg-[#141613] overflow-hidden">
            <div className="p-4 border-b border-[#2C302A] bg-[#101110] flex items-center justify-between text-xs font-mono text-[#8A8E85]">
              <span>ACTIVE & RECENT SESSIONS ({sessionList.length})</span>
              <span>GROUPED BY BROWSER FOOTPRINT</span>
            </div>

            <div className="divide-y divide-[#2C302A] text-xs">
              {sessionList.map((sess) => (
                <div key={sess.sessionId} className="p-4 sm:p-5 hover:bg-[#191B18]/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#191B18] border border-[#2C302A] text-[#C8FF45]">
                        {sess.device === 'Mobile' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                      </span>
                      <div>
                        <span className="font-bold text-[#F5F5F0]">
                          {sess.userEmail ? (
                            <span className="text-[#C8FF45]">{sess.userEmail}</span>
                          ) : (
                            'Anonymous Visitor'
                          )}
                        </span>
                        <span className="font-mono text-[11px] text-[#8A8E85] ml-2">
                          ID: {sess.sessionId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#8A8E85]">
                      <span className="rounded bg-[#C8FF45]/10 border border-[#C8FF45]/30 px-2 py-0.5 text-[#C8FF45] font-bold">
                        {sess.eventCount} Actions
                      </span>
                      <span>Last seen: {new Date(sess.lastSeen).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#8A8E85]">
                    <span className="font-medium text-[#C5C8C1]">Pages Visited:</span>
                    {Array.from(sess.pages).map((p, idx) => (
                      <span key={idx} className="rounded bg-[#101110] px-2 py-0.5 border border-[#2C302A] font-mono text-[#F5F5F0]">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-[#8A8E85]">
                    <span className="text-[#C5C8C1]">Actions:</span>
                    {sess.actions.map((act, idx) => (
                      <span key={idx} className="rounded bg-[#191B18] px-1.5 py-0.5 border border-[#2C302A]">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-xl border border-[#2C302A] bg-[#141613] space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C302A] pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#F5F5F0]">{inq.name}</h3>
                      <p className="text-[#C8FF45] font-mono">{inq.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#C8FF45]/15 border border-[#C8FF45]/40 px-2 py-1 font-mono text-[10px] text-[#C8FF45] font-bold">
                        {inq.service}
                      </span>
                      <span className="font-mono text-[11px] text-[#8A8E85]">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#C5C8C1] leading-relaxed whitespace-pre-line">
                    {inq.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-mono text-[#8A8E85]">
                    {inq.budget && <span>Budget: <strong className="text-[#F5F5F0]">{inq.budget}</strong></span>}
                    {inq.timeline && <span>Timeline: <strong className="text-[#F5F5F0]">{inq.timeline}</strong></span>}
                    <a
                      href={`mailto:${inq.email}?subject=Regarding your E-Tech Graphics inquiry`}
                      className="ml-auto inline-flex items-center gap-1 text-[#C8FF45] hover:underline"
                    >
                      <Send className="h-3 w-3" />
                      <span>Reply Directly &rarr;</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-[#2C302A] p-6 text-xs text-[#8A8E85]">
                No submitted project inquiries on record yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((book) => (
                <div
                  key={book.id}
                  className="p-5 rounded-xl border border-[#2C302A] bg-[#141613] space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C302A] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#F5F5F0]">{book.userName}</h3>
                        <p className="text-[#C8FF45] font-mono">{book.userEmail}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[#F5F5F0] block">
                        {book.date} at {book.timeSlot}
                      </span>
                      <span className="rounded bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-400 uppercase">
                        {book.status}
                      </span>
                    </div>
                  </div>

                  {book.notes && (
                    <p className="text-[#C5C8C1] leading-relaxed">
                      <strong className="text-[#8A8E85]">Notes: </strong>{book.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-[#2C302A] p-6 text-xs text-[#8A8E85]">
                No consultation strategy calls reserved yet.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
