'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MediaLog, FilterState } from './types';
import { INITIAL_MEDIA_LOGS } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase/client';

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
  resetToSeed: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const CineStoreContext = createContext<CineStoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cinelog_media_entries_v3';
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

  // Fetch authoritative media list from Supabase or server API
  const refreshFromServer = useCallback(async () => {
    // 1. Try Supabase first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('media_logs')
          .select('*')
          .order('watched_date', { ascending: false });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          const mapped: MediaLog[] = data.map((d: any) => ({
            id: d.id,
            tmdb_id: d.tmdb_id,
            title: d.title,
            media_type: d.media_type,
            release_year: d.release_year,
            runtime_minutes: d.runtime_minutes,
            poster_url: d.poster_url,
            backdrop_url: d.backdrop_url,
            director: d.director,
            cast: d.cast_members || d.cast || [],
            genres: d.genres || [],
            watched_date: d.watched_date,
            personal_rating: Number(d.personal_rating),
            gut_reaction: d.gut_reaction,
            full_review: d.full_review,
            mood_coordinates: d.mood_coordinates || { x: 0, y: 0 },
            custom_tags: d.custom_tags || [],
            dominant_color: d.dominant_color || '#eab308',
            rewatch_count: d.rewatch_count || 1,
            created_at: d.created_at
          }));

          setMediaLogs(mapped);
          setActiveMedia(prev => {
            if (!prev) return mapped[0] || null;
            const found = mapped.find(m => m.id === prev.id);
            return found || mapped[0] || null;
          });
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
          } catch (e) {
            console.warn('LocalStorage save failed', e);
          }
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to server API', err);
      }
    }

    // 2. Fetch from Next.js server API
    try {
      const res = await fetch('/api/media', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
          setMediaLogs(data.logs);
          setActiveMedia(prev => {
            if (!prev) return data.logs[0] || null;
            const found = data.logs.find((m: MediaLog) => m.id === prev.id);
            return found || data.logs[0] || null;
          });
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.logs));
          } catch (e) {
            console.warn('LocalStorage save failed', e);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Could not sync with /api/media, using cached store', err);
    }

    // 3. Fallback to INITIAL_MEDIA_LOGS
    setMediaLogs(INITIAL_MEDIA_LOGS);
    setActiveMedia(INITIAL_MEDIA_LOGS[0] || null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_LOGS));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, []);

  // Initial Load: check admin session and fetch server media
  useEffect(() => {
    async function loadData() {
      // 1. Check admin session & clean up old stale storage keys
      try {
        const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
        if (savedAdmin === 'true') {
          setIsAdminState(true);
        }

        // Purge previous obsolete caches so visitors don't see deleted data
        localStorage.removeItem('cinelog_media_entries_v1');
        localStorage.removeItem('cinelog_media_entries_v2');

        // 2. Load cached data for instant paint
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMediaLogs(parsed);
            setActiveMedia(parsed[0] || null);
          }
        }
      } catch (err) {
        console.warn('Error reading localStorage', err);
      }

      // 3. Sync with live shared server storage / Supabase
      await refreshFromServer();
      setIsLoading(false);
    }

    loadData();
  }, [refreshFromServer]);

  const addLog = async (newLogData: Omit<MediaLog, 'id' | 'created_at'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`;
    const newLog: MediaLog = {
      ...newLogData,
      id,
      created_at: new Date().toISOString()
    };

    // Optimistic local update
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

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { cast, ...rest } = newLog;
        await supabase.from('media_logs').insert([{
          ...rest,
          cast_members: cast || []
        }]);
      } catch (e) {
        console.error('Supabase insert exception:', e);
      }
    }

    // Persist to server
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error('Server sync error on addLog:', err);
    }
  };

  const updateLog = async (id: string, updatedFields: Partial<MediaLog>) => {
    // Optimistic local update
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

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = { ...updatedFields };
        if (updatedFields.cast) {
          updatePayload.cast_members = updatedFields.cast;
          delete updatePayload.cast;
        }
        await supabase.from('media_logs').update(updatePayload).eq('id', id);
      } catch (e) {
        console.error('Supabase update exception:', e);
      }
    }

    // Persist to server
    try {
      await fetch('/api/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields })
      });
    } catch (err) {
      console.error('Server sync error on updateLog:', err);
    }
  };

  const deleteLog = async (id: string) => {
    // Optimistic local update
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

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('media_logs').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete exception:', e);
      }
    }

    // Persist to server
    try {
      await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Server sync error on deleteLog:', err);
    }
  };

  const resetToSeed = async () => {
    setMediaLogs(INITIAL_MEDIA_LOGS);
    setActiveMedia(INITIAL_MEDIA_LOGS[0] || null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_LOGS));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }

    // Persist reset to server
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
    } catch (err) {
      console.error('Server sync error on resetToSeed:', err);
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
        refreshFromServer,
        isSupabaseConnected: isSupabaseConfigured
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
