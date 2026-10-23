import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Calendar,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FolderOpen,
  HelpCircle,
  Eye,
  Bot,
  Minimize2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { siteConfig } from '../../data/site-config';
import { sampleProjects } from '../../data/projects';
import { Project } from '../../types/portfolio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ParsedAction[];
  timestamp: string;
  isError?: boolean;
}

export interface ParsedAction {
  type: 'navigate' | 'modal' | 'action' | 'project';
  target: string;
  label: string;
}

interface WebsiteConciergeProps {
  onOpenBooking: () => void;
  onOpenProject?: (project: Project) => void;
}

const SUGGESTED_PROMPTS = [
  'Explore projects',
  'What services do you offer?',
  'Help me choose a design',
  'Book a free 30-minute call',
  'Contact E-Tech Graphics',
];

const ALLOWLISTED_SECTIONS = ['projects', 'work', 'services', 'about', 'contact'];

export const WebsiteConcierge: React.FC<WebsiteConciergeProps> = ({
  onOpenBooking,
  onOpenProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initial Welcome Greeting logic (first visit in browsing session)
  useEffect(() => {
    try {
      const alreadyDismissed = sessionStorage.getItem('etech_concierge_greeting_dismissed');
      if (!alreadyDismissed) {
        const timer = setTimeout(() => {
          setShowGreeting(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors in privacy modes
    }
  }, []);

  // Initialize initial message when opening chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content:
            "Hello there! Welcome to E-Tech Graphics. I'm your creative concierge. I can guide you through our portfolio concepts, break down our brand & poster services, or help you schedule a free 30-minute strategy session. What would you like to explore?",
          actions: [
            { type: 'navigate', target: 'projects', label: 'Explore Selected Works' },
            { type: 'modal', target: 'booking', label: 'Book Free 30-Min Call' },
            { type: 'navigate', target: 'services', label: 'View Capabilities' },
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismissGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGreeting(false);
    try {
      sessionStorage.setItem('etech_concierge_greeting_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  const handleOpenChat = () => {
    setShowGreeting(false);
    try {
      sessionStorage.setItem('etech_concierge_greeting_dismissed', 'true');
    } catch {
      // Ignore
    }
    setIsOpen(true);
    setHasInteracted(true);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'new-chat-' + Date.now(),
        role: 'assistant',
        content:
          "Conversation reset. How can I assist with your design requirements or project vision today?",
        actions: [
          { type: 'navigate', target: 'projects', label: 'Explore Works' },
          { type: 'modal', target: 'booking', label: 'Book a Strategy Call' },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Safe action dispatcher with strict allowlisting
  const executeApprovedAction = (action: ParsedAction) => {
    if (action.type === 'navigate') {
      const targetId = action.target.toLowerCase();
      if (!ALLOWLISTED_SECTIONS.includes(targetId)) return;

      if (targetId === 'work' || targetId === 'projects') {
        if (location.pathname === '/' || location.pathname === '/work') {
          const el = document.getElementById('projects') || document.getElementById('work');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        navigate('/work');
      } else if (targetId === 'services') {
        navigate('/services');
      } else if (targetId === 'about') {
        navigate('/about');
      } else if (targetId === 'contact') {
        navigate('/contact');
      }
    } else if (action.type === 'modal' && action.target === 'booking') {
      onOpenBooking();
    } else if (action.type === 'action' && action.target === 'whatsapp') {
      window.open(siteConfig.whatsapp.getUrl(), '_blank', 'noopener,noreferrer');
    } else if (action.type === 'project' && onOpenProject) {
      const foundProject = sampleProjects.find((p) => p.id === action.target);
      if (foundProject) {
        onOpenProject(foundProject);
      } else {
        navigate('/work');
      }
    }
  };

  // Helper to parse typed tokens like [ACTION:navigate:projects] or [ACTION:modal:booking]
  const parseActionTokens = (rawText: string): { cleanText: string; actions: ParsedAction[] } => {
    const actionRegex = /\[ACTION:([a-z]+):([a-zA-Z0-9_-]+)\]/g;
    const actions: ParsedAction[] = [];
    let match;

    while ((match = actionRegex.exec(rawText)) !== null) {
      const type = match[1] as 'navigate' | 'modal' | 'action' | 'project';
      const target = match[2];

      if (type === 'navigate' && ALLOWLISTED_SECTIONS.includes(target.toLowerCase())) {
        actions.push({
          type: 'navigate',
          target,
          label: target === 'projects' ? 'View Selected Works' : `Go to ${target.charAt(0).toUpperCase() + target.slice(1)}`,
        });
      } else if (type === 'modal' && target === 'booking') {
        actions.push({
          type: 'modal',
          target: 'booking',
          label: 'Book Free 30-Minute Call',
        });
      } else if (type === 'action' && target === 'whatsapp') {
        actions.push({
          type: 'action',
          target: 'whatsapp',
          label: 'Chat on WhatsApp',
        });
      } else if (type === 'project') {
        const proj = sampleProjects.find((p) => p.id === target);
        if (proj) {
          actions.push({
            type: 'project',
            target,
            label: `Inspect "${proj.title}"`,
          });
        }
      }
    }

    const cleanText = rawText.replace(actionRegex, '').trim();
    return { cleanText, actions };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Keep context bounded (max recent 10 messages)
    const recentHistory = [...messages, userMessage].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawReply = data.reply || data.content || '';
      const { cleanText, actions } = parseActionTokens(rawReply);

      const assistantMessage: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: cleanText || "I'm here to help! Let me know if you'd like to browse works or schedule a strategy call.",
        actions: actions.length > 0 ? actions : data.suggestedActions || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('AI concierge API request error, utilizing intelligent local response:', err);

      // Graceful local studio fallback so the assistant never leaves the user hanging
      const fallbackReply = generateLocalStudioResponse(query);
      const { cleanText, actions } = parseActionTokens(fallbackReply);

      setMessages((prev) => [
        ...prev,
        {
          id: 'fallback-' + Date.now(),
          role: 'assistant',
          content: cleanText,
          actions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Welcoming Floating Greeting Tooltip (First Session Visit) */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-4 sm:left-6 z-40 max-w-[340px] sm:max-w-[380px] rounded-2xl border border-[#2C302A] bg-[#141613]/95 backdrop-blur-md p-4 shadow-2xl shadow-black/60"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C8FF45]/15 text-[#C8FF45]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C8FF45]">
                  E-Tech AI Concierge
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismissGreeting}
                className="text-[#8A8E85] hover:text-[#F5F5F0] transition-colors p-1"
                aria-label="Dismiss welcome greeting"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs sm:text-sm text-[#F5F5F0] leading-relaxed">
              Hello there! Welcome to E-Tech Graphics. I'm your creative assistant. I can help you
              explore our designs, discover our services, or book a free 30-minute consultation. What
              would you like to explore?
            </p>

            <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#2C302A] pt-3">
              <button
                type="button"
                onClick={handleOpenChat}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8FF45] px-3.5 py-1.5 text-xs font-bold text-[#101110] hover:bg-[#bbf033] transition-colors cursor-pointer"
              >
                <span>Ask Concierge</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={handleDismissGreeting}
                className="text-[11px] text-[#8A8E85] hover:text-[#C5C8C1]"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Launcher Button (Bottom-Left) */}
      <aside aria-label="E-Tech AI Assistant" className="fixed bottom-6 left-6 z-35 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpenChat())}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI Creative Assistant' : 'Open AI Creative Assistant'}
          className={`group flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border transition-all duration-200 shadow-xl shadow-black/50 focus:outline-none focus:ring-2 focus:ring-[#C8FF45] focus:ring-offset-2 focus:ring-offset-[#101110] cursor-pointer ${
            isOpen
              ? 'bg-[#191B18] border-[#C8FF45] text-[#C8FF45]'
              : 'bg-[#101110] border-[#2C302A] text-[#F5F5F0] hover:border-[#C8FF45] hover:text-[#C8FF45]'
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <div className="relative">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
              {/* Green online pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF45] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8FF45]" />
              </span>
            </div>
          )}
        </button>

        {!isOpen && !showGreeting && (
          <span className="hidden md:inline-block pointer-events-none rounded-full bg-[#191B18]/90 border border-[#2C302A] px-3.5 py-1.5 text-xs font-mono font-medium text-[#C5C8C1] shadow-lg backdrop-blur-md">
            E-Tech AI
          </span>
        )}
      </aside>

      {/* 3. Responsive Chat Interface Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-3 bottom-22 sm:bottom-24 sm:left-6 sm:right-auto z-40 w-auto sm:w-[420px] max-w-[calc(100vw-24px)] h-[580px] max-h-[82vh] rounded-2xl border border-[#2C302A] bg-[#141613] shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="false"
            aria-labelledby="concierge-dialog-title"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2C302A] bg-[#101110] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8FF45]/15 text-[#C8FF45] border border-[#C8FF45]/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h2
                    id="concierge-dialog-title"
                    className="font-display text-sm font-bold text-[#F5F5F0] tracking-tight flex items-center gap-2"
                  >
                    <span>E-Tech AI Concierge</span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C8FF45]" />
                  </h2>
                  <p className="text-[10px] font-mono text-[#8A8E85]">
                    Studio Guide & Discovery Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg border border-[#2C302A] text-[#8A8E85] hover:text-[#F5F5F0] hover:border-[#C8FF45] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize (Escape)"
                  aria-label="Minimize concierge panel"
                  className="p-1.5 rounded-lg border border-[#2C302A] text-[#8A8E85] hover:text-[#F5F5F0] hover:border-[#C8FF45] transition-colors"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Message Thread Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#C8FF45] text-[#101110] font-medium rounded-br-xs'
                        : 'bg-[#191B18] text-[#F5F5F0] border border-[#2C302A] rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Interactive Action Badges */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#2C302A] flex flex-wrap gap-1.5">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => executeApprovedAction(action)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#101110] border border-[#2C302A] px-2.5 py-1.5 text-[11px] font-bold text-[#C8FF45] hover:border-[#C8FF45] hover:bg-[#C8FF45]/10 active:scale-95 transition-all cursor-pointer"
                          >
                            {action.type === 'modal' && <Calendar className="h-3 w-3" />}
                            {action.type === 'navigate' && <FolderOpen className="h-3 w-3" />}
                            {action.type === 'action' && <MessageCircle className="h-3 w-3" />}
                            {action.type === 'project' && <Eye className="h-3 w-3" />}
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="mt-1 text-[10px] font-mono text-[#8A8E85] px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#191B18] border border-[#2C302A] w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested quick pills */}
            <div className="px-4 py-2 border-t border-[#2C302A]/80 bg-[#101110]/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap shrink-0 rounded-full border border-[#2C302A] bg-[#191B18] px-2.5 py-1 text-[11px] text-[#C5C8C1] hover:text-[#C8FF45] hover:border-[#C8FF45]/50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-[#2C302A] bg-[#101110] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about design concepts, pricing, bookings..."
                maxLength={400}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-[#2C302A] bg-[#191B18] px-3.5 py-2.5 text-xs text-[#F5F5F0] placeholder-[#8A8E85] focus:outline-none focus:ring-2 focus:ring-[#C8FF45] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8FF45] text-[#101110] hover:bg-[#bbf033] disabled:opacity-40 disabled:hover:bg-[#C8FF45] transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Intelligent studio knowledge fallback when OpenAI key is absent or unreachable
function generateLocalStudioResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('book') || q.includes('call') || q.includes('schedule') || q.includes('consult')) {
    return (
      "We offer a 100% free 30-minute introductory strategy session! We'll review your project scope, target aesthetics, timeline, and deliverables over Google Meet with zero obligation.\n\n" +
      "Would you like to reserve a time slot right now?\n" +
      "[ACTION:modal:booking]"
    );
  }

  if (q.includes('whatsapp') || q.includes('phone') || q.includes('chat') || q.includes('contact')) {
    return (
      `You can reach E-Tech Graphics directly on WhatsApp at ${siteConfig.whatsapp.displayNumber} or send us a project inquiry through our contact page.\n\n` +
      "[ACTION:action:whatsapp] [ACTION:navigate:contact]"
    );
  }

  if (q.includes('service') || q.includes('offer') || q.includes('capability') || q.includes('what do you do')) {
    return (
      "E-Tech Graphics specializes in 5 core design disciplines:\n" +
      "1. Brand Identity Systems (Logos, visual identity, guidelines)\n" +
      "2. Cinematic Film & Exhibition Posters\n" +
      "3. Underground & Club Event Flyers\n" +
      "4. Social Media Campaign Graphics & Launch Sets\n" +
      "5. Digital & Print Design (Banners, editorial magazines, business stationery)\n\n" +
      "[ACTION:navigate:services] [ACTION:modal:booking]"
    );
  }

  if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('poster') || q.includes('flyer')) {
    return (
      "Our portfolio contains 16 curated visual concepts spanning sci-fi film key art (like Solaris Dusk and The Silent Abyss), brutalist electronic club flyers (like Echo System 2025), luxury brand identities, and wide-format digital banners.\n\n" +
      "Check out the full collection:\n" +
      "[ACTION:navigate:projects] [ACTION:project:solaris-dusk-poster]"
    );
  }

  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('budget')) {
    return (
      "Our project pricing is tailored to your scope—from single asset packages to complete multi-channel identity systems. The best place to start is our free 30-minute discovery call where we can discuss your budget and provide an exact quote.\n\n" +
      "[ACTION:modal:booking] [ACTION:navigate:contact]"
    );
  }

  if (q.includes('about') || q.includes('who') || q.includes('philosophy') || q.includes('etech') || q.includes('studio')) {
    return (
      `At ${siteConfig.brand.name}, design is not decorative veneer—it is the structural grammar through which an idea communicates its value. We work across branding, posters, digital media, and editorial print to shape distinctive visual identities that endure.\n\n` +
      "[ACTION:navigate:about] [ACTION:navigate:projects]"
    );
  }

  // General helpful response
  return (
    `I can help you explore our design services, browse through our ${sampleProjects.length} curated concept projects, or book a free 30-minute creative strategy call.\n\n` +
    "[ACTION:navigate:projects] [ACTION:modal:booking] [ACTION:navigate:services]"
  );
}
