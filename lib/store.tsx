'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MediaLog, FilterState } from './types';
import { INITIAL_MEDIA_LOGS } from './mock-data';

interface CineStoreContextType {
  mediaLogs: MediaLog[];
  isLoading: boolean;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  activeMedia: MediaLog | null;
  setActiveMedia: (media: MediaLog | null) => void;
  theaterMode: boolean;
  setTheaterMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  directorsCut: boolean;
  setDirectorsCut: (val: boolean | ((prev: boolean) => boolean)) => void;
  ticketModalOpen: boolean;
  setTicketModalOpen: (val: boolean) => void;
  totoroEasterEggOpen: boolean;
  setTotoroEasterEggOpen: (val: boolean) => void;
  addModalOpen: boolean;
  setAddModalOpen: (val: boolean) => void;
  editingMedia: MediaLog | null;
  setEditingMedia: (media: MediaLog | null) => void;
  detailMedia: MediaLog | null;
  setDetailMedia: (media: MediaLog | null) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  addLog: (log: Omit<MediaLog, 'id' | 'created_at'>) => Promise<void>;
  updateLog: (id: string, log: Partial<MediaLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  resetToSeed: () => void;
  isSupabaseConnected: boolean;
}

const CineStoreContext = createContext<CineStoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cinelog_media_entries_v1';
const ADMIN_SESSION_KEY = 'cinelog_admin_authenticated';

export const CineStoreProvider = ({ children }: { children: ReactNode }) => {
  const [mediaLogs, setMediaLogs] = useState<MediaLog[]>(INITIAL_MEDIA_LOGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdminState] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaLog | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [directorsCut, setDirectorsCut] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [totoroEasterEggOpen, setTotoroEasterEggOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaLog | null>(null);
  const [detailMedia, setDetailMedia] = useState<MediaLog | null>(null);

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    mediaType: 'all',
    selectedGenre: null,
    selectedTag: null,
    minRating: 0,
    sortBy: 'watched_date_desc'
  });

  // Admin state wrapper with localStorage persistence
  const setIsAdmin = (val: boolean) => {
    setIsAdminState(val);
    if (typeof window !== 'undefined') {
      if (val) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
  };

  // Initial Load: Read strictly from localStorage
  useEffect(() => {
    function loadData() {
      // Check admin session
      try {
        const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
        if (savedAdmin === 'true') {
          setIsAdminState(true);
        }

        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Respect whatever is in localStorage, even an empty array []
            setMediaLogs(parsed);
            setActiveMedia(parsed.length > 0 ? parsed[0] : null);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error reading localStorage', err);
      }

      // First time ever visiting: populate initial seed and persist to localStorage
      setMediaLogs(INITIAL_MEDIA_LOGS);
      setActiveMedia(INITIAL_MEDIA_LOGS[0] || null);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_LOGS));
      } catch (err) {
        console.warn('Failed to save initial seed to localStorage', err);
      }
      setIsLoading(false);
    }

    loadData();
  }, []);

  const addLog = async (newLogData: Omit<MediaLog, 'id' | 'created_at'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`;
    const newLog: MediaLog = {
      ...newLogData,
      id,
      created_at: new Date().toISOString()
    };

    setMediaLogs(prev => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
      return updated;
    });
    setActiveMedia(newLog);
  };

  const updateLog = async (id: string, updatedFields: Partial<MediaLog>) => {
    setMediaLogs(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updatedFields } : item);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
      return updated;
    });
    if (activeMedia?.id === id) {
      setActiveMedia(prev => prev ? { ...prev, ...updatedFields } : null);
    }
    if (detailMedia?.id === id) {
      setDetailMedia(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };

  const deleteLog = async (id: string) => {
    setMediaLogs(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
      return updated;
    });

    if (activeMedia?.id === id) {
      setActiveMedia(null);
    }
    if (detailMedia?.id === id) {
      setDetailMedia(null);
    }
    if (editingMedia?.id === id) {
      setEditingMedia(null);
    }
  };

  const resetToSeed = () => {
    setMediaLogs(INITIAL_MEDIA_LOGS);
    setActiveMedia(INITIAL_MEDIA_LOGS[0] || null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_LOGS));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }
  };

  return (
    <CineStoreContext.Provider
      value={{
        mediaLogs,
        isLoading,
        isAdmin,
        setIsAdmin,
        activeMedia,
        setActiveMedia,
        theaterMode,
        setTheaterMode,
        directorsCut,
        setDirectorsCut,
        ticketModalOpen,
        setTicketModalOpen,
        totoroEasterEggOpen,
        setTotoroEasterEggOpen,
        addModalOpen,
        setAddModalOpen,
        editingMedia,
        setEditingMedia,
        detailMedia,
        setDetailMedia,
        filterState,
        setFilterState,
        addLog,
        updateLog,
        deleteLog,
        resetToSeed,
        isSupabaseConnected: false
      }}
    >
      {children}
    </CineStoreContext.Provider>
  );
};

export const useCineStore = () => {
  const context = useContext(CineStoreContext);
  if (!context) {
    throw new Error('useCineStore must be used within a CineStoreProvider');
  }
  return context;
};
