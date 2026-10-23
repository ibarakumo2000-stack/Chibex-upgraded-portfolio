import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { Project } from '../types/portfolio';
import { trackActivity } from '../lib/analytics';

export interface BookingRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceInterest: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface SavedProjectRecord {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  category: string;
  imageUrl?: string;
  notes?: string;
  savedAt: string;
}

export interface PortalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  currentUser: User | PortalUser | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoClient: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithDemoClient: (clientName?: string, clientEmail?: string) => void;
  logout: () => Promise<void>;
  // Saved Projects (Moodboard)
  savedProjects: SavedProjectRecord[];
  isProjectSaved: (projectId: string) => boolean;
  toggleSaveProject: (project: Project, notes?: string) => Promise<boolean>;
  removeSavedProject: (projectId: string) => Promise<void>;
  // Consultation Bookings
  userBookings: BookingRecord[];
  createBooking: (data: {
    userName: string;
    userEmail: string;
    serviceInterest: string;
    date: string;
    timeSlot: string;
    notes?: string;
  }) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  // Inquiries
  submitInquiry: (data: {
    name: string;
    email: string;
    service: string;
    budget?: string;
    timeline?: string;
    message: string;
  }) => Promise<string>;
  // UI Helpers
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isHubOpen: boolean;
  openHub: () => void;
  closeHub: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [demoUser, setDemoUser] = useState<PortalUser | null>(() => {
    try {
      const saved = localStorage.getItem('etech_demo_client_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProjectRecord[]>(() => {
    try {
      const saved = localStorage.getItem('etech_demo_saved_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userBookings, setUserBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('etech_demo_user_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isHubOpen, setIsHubOpen] = useState<boolean>(false);

  // Effective user is either real Firebase user or preview demo user
  const currentUser = firebaseUser || demoUser;
  const isDemoClient = Boolean(!firebaseUser && demoUser);

  // Check admin privileges (only emperorstech885@gmail.com and ibarakumo2000@gmail.com)
  const isAdmin = useMemo(() => {
    const adminList = ['ibarakumo2000@gmail.com', 'emperorstech885@gmail.com'];
    return Boolean(currentUser?.email && adminList.includes(currentUser.email.toLowerCase().trim()));
  }, [currentUser]);
  // Initial connection test
  useEffect(() => {
    testConnection().catch((err) => {
      console.warn('Firebase initial connection note:', err);
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setLoading(false);

      if (user) {
        // Clear any demo user if real firebase user signs in
        setDemoUser(null);
        try {
          localStorage.removeItem('etech_demo_client_user');
          const cachedSaved = localStorage.getItem(`etech_saved_${user.uid}`);
          if (cachedSaved) setSavedProjects(JSON.parse(cachedSaved));
          const cachedBookings = localStorage.getItem(`etech_bookings_${user.uid}`);
          if (cachedBookings) setUserBookings(JSON.parse(cachedBookings));
        } catch {}

        // Sync or initialize UserProfile document safely
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Client',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('User profile sync notice:', error);
        }
      } else {
        // If not firebase user and not demo user, clear state
        const savedDemo = localStorage.getItem('etech_demo_client_user');
        if (!savedDemo) {
          setSavedProjects([]);
          setUserBookings([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Saved Projects (Moodboard) in real-time from Firestore when Firebase user is active
  useEffect(() => {
    if (!firebaseUser) return;

    const path = 'savedProjects';
    try {
      const q = query(collection(db, path), where('userId', '==', firebaseUser.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: SavedProjectRecord[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as SavedProjectRecord);
          });
          setSavedProjects(items);
          try {
            localStorage.setItem(`etech_saved_${firebaseUser.uid}`, JSON.stringify(items));
          } catch {}
        },
        (error) => {
          console.warn(`[Firestore ${path} notice]:`, error.message);
          try {
            const cached = localStorage.getItem(`etech_saved_${firebaseUser.uid}`);
            if (cached) {
              setSavedProjects(JSON.parse(cached));
            }
          } catch {}
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('Failed to attach savedProjects listener:', error);
    }
  }, [firebaseUser]);

  // Sync Bookings in real-time from Firestore when Firebase user is active
  useEffect(() => {
    if (!firebaseUser) return;

    const path = 'bookings';
    try {
      const q = query(collection(db, path), where('userId', '==', firebaseUser.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: BookingRecord[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as BookingRecord);
          });
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setUserBookings(items);
          try {
            localStorage.setItem(`etech_bookings_${firebaseUser.uid}`, JSON.stringify(items));
          } catch {}
        },
        (error) => {
          console.warn(`[Firestore ${path} notice]:`, error.message);
          try {
            const cached = localStorage.getItem(`etech_bookings_${firebaseUser.uid}`);
            if (cached) {
              setUserBookings(JSON.parse(cached));
            }
          } catch {}
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('Failed to attach bookings listener:', error);
    }
  }, [firebaseUser]);

  // Google Sign-In with robust domain error detection
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
      trackActivity('user_sign_in', `Signed in via Google (${cred.user.email || 'Client'})`);
    } catch (error: any) {
      console.warn('Google sign-in attempt notice:', error);
      const code = error?.code || '';
      const msg = error?.message || '';

      if (code === 'auth/unauthorized-domain' || msg.includes('auth/unauthorized-domain')) {
        setAuthError('auth/unauthorized-domain');
      } else if (code === 'auth/popup-closed-by-user') {
        // User voluntarily dismissed popup
        setAuthError(null);
      } else {
        setAuthError(msg || 'Failed to complete Google Sign-In.');
      }
    }
  };

  // Instant Preview / Demo Client Sign-In (Allows testing portal without external OAuth constraints)
  const signInWithDemoClient = (clientName?: string, clientEmail?: string) => {
    const demo: PortalUser = {
      uid: 'demo_client_' + (clientEmail ? clientEmail.replace(/[^a-zA-Z0-9]/g, '') : 'ibarakumo'),
      displayName: clientName || 'Ibarakumo (Client)',
      email: clientEmail || 'ibarakumo2000@gmail.com',
      photoURL: null,
      isDemo: true,
    };

    setDemoUser(demo);
    try {
      localStorage.setItem('etech_demo_client_user', JSON.stringify(demo));
      const cachedSaved = localStorage.getItem(`etech_saved_${demo.uid}`);
      if (cachedSaved) setSavedProjects(JSON.parse(cachedSaved));
      const cachedBookings = localStorage.getItem(`etech_bookings_${demo.uid}`);
      if (cachedBookings) setUserBookings(JSON.parse(cachedBookings));
    } catch {}

    setAuthError(null);
    setIsAuthModalOpen(false);
    setIsHubOpen(true);
    trackActivity('client_sign_in', `Client authenticated as ${demo.email}`);
  };

  // Sign-Out
  const logout = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setFirebaseUser(null);
      setDemoUser(null);
      try {
        localStorage.removeItem('etech_demo_client_user');
      } catch {}
      setSavedProjects([]);
      setUserBookings([]);
      setIsHubOpen(false);
    }
  };

  // Check if project is saved
  const isProjectSaved = (projectId: string) => {
    return savedProjects.some((item) => item.projectId === projectId);
  };

  // Toggle Save Project (Supports both Firebase Cloud & Local Client Storage)
  const toggleSaveProject = async (project: Project, notes?: string): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    const existing = savedProjects.find((item) => item.projectId === project.id);
    let nextProjects: SavedProjectRecord[];
    let isSaved: boolean;

    if (existing) {
      nextProjects = savedProjects.filter((item) => item.projectId !== project.id);
      isSaved = false;
    } else {
      const saveId = `save_${currentUser.uid}_${project.id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const newRecord: SavedProjectRecord = {
        id: saveId,
        userId: currentUser.uid,
        projectId: project.id,
        projectTitle: project.title,
        category: project.category,
        imageUrl: typeof project.imagePath === 'string' ? project.imagePath : '',
        notes: notes || '',
        savedAt: new Date().toISOString(),
      };
      nextProjects = [newRecord, ...savedProjects];
      isSaved = true;
    }

    setSavedProjects(nextProjects);
    try {
      localStorage.setItem(`etech_saved_${currentUser.uid}`, JSON.stringify(nextProjects));
    } catch {}

    // Track moodboard interaction telemetry
    trackActivity(
      isSaved ? 'moodboard_add' : 'moodboard_remove',
      `${isSaved ? 'Saved' : 'Removed'} "${project.title}" (${project.category})`
    );

    // Cloud Firestore write when Firebase auth is available
    if (firebaseUser) {
      const path = 'savedProjects';
      try {
        if (existing) {
          await deleteDoc(doc(db, path, existing.id));
        } else {
          const saveId = `save_${currentUser.uid}_${project.id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          const newRecord: SavedProjectRecord = {
            id: saveId,
            userId: currentUser.uid,
            projectId: project.id,
            projectTitle: project.title,
            category: project.category,
            imageUrl: typeof project.imagePath === 'string' ? project.imagePath : '',
            notes: notes || '',
            savedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, path, saveId), newRecord);
        }
      } catch (error) {
        console.warn('Firestore cloud sync notice (saved locally):', error);
      }
    }

    return isSaved;
  };

  // Remove Saved Project
  const removeSavedProject = async (projectId: string) => {
    if (!currentUser) return;
    const existing = savedProjects.find((item) => item.projectId === projectId);
    if (!existing) return;

    const nextProjects = savedProjects.filter((item) => item.projectId !== projectId);
    setSavedProjects(nextProjects);
    try {
      localStorage.setItem(`etech_saved_${currentUser.uid}`, JSON.stringify(nextProjects));
    } catch {}

    if (firebaseUser) {
      const path = 'savedProjects';
      try {
        await deleteDoc(doc(db, path, existing.id));
      } catch (error) {
        console.warn('Firestore delete notice (removed locally):', error);
      }
    }
  };

  // Create Consultation Booking (Supports both Firebase Cloud & Local Client Storage)
  const createBooking = async (data: {
    userName: string;
    userEmail: string;
    serviceInterest: string;
    date: string;
    timeSlot: string;
    notes?: string;
  }): Promise<string> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      throw new Error('User must be signed in to book a consultation');
    }

    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: BookingRecord = {
      id: bookingId,
      userId: currentUser.uid,
      userName: data.userName.trim().slice(0, 100),
      userEmail: data.userEmail.trim().slice(0, 100),
      serviceInterest: data.serviceInterest.trim().slice(0, 100),
      date: data.date.slice(0, 20),
      timeSlot: data.timeSlot.slice(0, 20),
      notes: (data.notes || '').slice(0, 1000),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const nextBookings = [newBooking, ...userBookings];
    setUserBookings(nextBookings);
    try {
      localStorage.setItem(`etech_bookings_${currentUser.uid}`, JSON.stringify(nextBookings));
    } catch {}

    // Record booking activity telemetry
    trackActivity(
      'booking_created',
      `Reserved ${data.serviceInterest} on ${data.date} at ${data.timeSlot}`
    );

    if (firebaseUser) {
      const path = 'bookings';
      try {
        await setDoc(doc(db, path, bookingId), newBooking);
      } catch (error) {
        console.warn('Firestore cloud booking notice (saved locally):', error);
      }
    }

    return bookingId;
  };

  // Cancel Booking
  const cancelBooking = async (bookingId: string) => {
    if (!currentUser) return;

    const nextBookings = userBookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    setUserBookings(nextBookings);
    try {
      localStorage.setItem(`etech_bookings_${currentUser.uid}`, JSON.stringify(nextBookings));
    } catch {}

    // Record booking cancellation telemetry
    trackActivity('booking_cancelled', `Cancelled call reservation ID ${bookingId}`);

    if (firebaseUser) {
      const path = 'bookings';
      try {
        await updateDoc(doc(db, path, bookingId), {
          status: 'cancelled',
        });
      } catch (error) {
        console.warn('Firestore cloud cancel notice (updated locally):', error);
      }
    }
  };

  // Submit Inquiry
  const submitInquiry = async (data: {
    name: string;
    email: string;
    service: string;
    budget?: string;
    timeline?: string;
    message: string;
  }): Promise<string> => {
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Record inquiry activity telemetry
    trackActivity(
      'inquiry_submitted',
      `Brief sent by ${data.name} (${data.email}) for ${data.service} (Budget: ${data.budget || 'Flexible'})`
    );

    // Always deliver to backend contact endpoint
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.name,
        email: data.email,
        serviceNeeded: data.service,
        budgetRange: data.budget || 'Flexible',
        preferredDeadline: data.timeline || 'Flexible',
        projectDetails: data.message,
      }),
    }).catch((err) => console.warn('Inquiry background dispatch:', err));

    if (firebaseUser) {
      const path = 'inquiries';
      const newInquiry: Record<string, any> = {
        id: inquiryId,
        name: data.name.trim().slice(0, 100),
        email: data.email.trim().slice(0, 100),
        service: data.service.slice(0, 100),
        message: data.message.trim().slice(0, 2000),
        status: 'new',
        userId: firebaseUser.uid,
        createdAt: new Date().toISOString(),
      };
      if (data.budget) newInquiry.budget = data.budget.slice(0, 50);
      if (data.timeline) newInquiry.timeline = data.timeline.slice(0, 50);

      try {
        await setDoc(doc(db, path, inquiryId), newInquiry);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    return inquiryId;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        isDemoClient,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signInWithDemoClient,
        logout,
        savedProjects,
        isProjectSaved,
        toggleSaveProject,
        removeSavedProject,
        userBookings,
        createBooking,
        cancelBooking,
        submitInquiry,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => {
          setIsAuthModalOpen(false);
          setAuthError(null);
        },
        isHubOpen,
        openHub: () => setIsHubOpen(true),
        closeHub: () => setIsHubOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
