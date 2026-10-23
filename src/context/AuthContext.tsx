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

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProjectRecord[]>([]);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isHubOpen, setIsHubOpen] = useState<boolean>(false);

  // Check admin privileges (runtime user email)
  const isAdmin = useMemo(() => {
    return currentUser?.email === 'ibarakumo2000@gmail.com';
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
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Sync or initialize UserProfile document
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
          console.warn('Error syncing user profile to Firestore:', error);
        }
      } else {
        setSavedProjects([]);
        setUserBookings([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Saved Projects (Moodboard) in real-time
  useEffect(() => {
    if (!currentUser) return;

    const path = 'savedProjects';
    try {
      const q = query(collection(db, path), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: SavedProjectRecord[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as SavedProjectRecord);
          });
          setSavedProjects(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('Failed to attach savedProjects listener:', error);
    }
  }, [currentUser]);

  // Sync Bookings in real-time
  useEffect(() => {
    if (!currentUser) return;

    const path = 'bookings';
    try {
      const q = query(collection(db, path), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: BookingRecord[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as BookingRecord);
          });
          // Sort by creation date descending
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setUserBookings(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('Failed to attach bookings listener:', error);
    }
  }, [currentUser]);

  // Google Sign-In
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setAuthError(error?.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  // Sign-Out
  const logout = async () => {
    try {
      await signOut(auth);
      setSavedProjects([]);
      setUserBookings([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if project is saved
  const isProjectSaved = (projectId: string) => {
    return savedProjects.some((item) => item.projectId === projectId);
  };

  // Toggle Save Project
  const toggleSaveProject = async (project: Project, notes?: string): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    const path = 'savedProjects';
    const existing = savedProjects.find((item) => item.projectId === project.id);

    try {
      if (existing) {
        await deleteDoc(doc(db, path, existing.id));
        return false;
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
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, existing ? OperationType.DELETE : OperationType.CREATE, path);
      return false;
    }
  };

  // Remove Saved Project
  const removeSavedProject = async (projectId: string) => {
    if (!currentUser) return;
    const existing = savedProjects.find((item) => item.projectId === projectId);
    if (!existing) return;

    const path = 'savedProjects';
    try {
      await deleteDoc(doc(db, path, existing.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Create Consultation Booking
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

    const path = 'bookings';
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

    try {
      await setDoc(doc(db, path, bookingId), newBooking);
      return bookingId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Cancel Booking
  const cancelBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const path = 'bookings';
    try {
      await updateDoc(doc(db, path, bookingId), {
        status: 'cancelled',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
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
    const path = 'inquiries';
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newInquiry: Record<string, any> = {
      id: inquiryId,
      name: data.name.trim().slice(0, 100),
      email: data.email.trim().slice(0, 100),
      service: data.service.slice(0, 100),
      message: data.message.trim().slice(0, 2000),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    if (currentUser) {
      newInquiry.userId = currentUser.uid;
    }
    if (data.budget) newInquiry.budget = data.budget.slice(0, 50);
    if (data.timeline) newInquiry.timeline = data.timeline.slice(0, 50);

    try {
      await setDoc(doc(db, path, inquiryId), newInquiry);
      return inquiryId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        authError,
        signInWithGoogle,
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
        closeAuthModal: () => setIsAuthModalOpen(false),
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
