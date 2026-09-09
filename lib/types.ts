export type MediaType = 'movie' | 'tv' | 'anime' | 'kdrama';

export interface MoodCoordinates {
  x: number; // -100 (Cerebral / Analytical) to +100 (Pure Visceral Fun)
  y: number; // -100 (Soul-Crushing / Bleak) to +100 (Uplifting / Cathartic)
}

export interface MediaLog {
  id: string;
  tmdb_id: number;
  title: string;
  media_type: MediaType;
  release_year: number;
  runtime_minutes?: number;
  poster_url: string;
  backdrop_url: string;
  director: string;
  cast?: string[];
  genres: string[];
  watched_date: string; // YYYY-MM-DD
  personal_rating: number; // 0 to 10 (or 0 to 5)
  gut_reaction: string; // One-sentence punchy take
  full_review: string; // Analytical full review with editorial formatting
  mood_coordinates: MoodCoordinates;
  custom_tags: string[]; // e.g. 'Mind-Melting', '3 AM Melancholy', 'Neon Noir'
  created_at: string;
  dominant_color?: string; // hex or rgb for dynamic ambient glow
  aspect_ratio?: string;
  rewatch_count?: number;
}

export interface TMDbSearchResult {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // for TV
  media_type: 'movie' | 'tv' | 'anime' | 'kdrama';
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDbDetails {
  id: number;
  title: string;
  media_type: MediaType;
  release_year: number;
  runtime_minutes: number;
  poster_url: string;
  backdrop_url: string;
  director: string;
  cast: string[];
  genres: string[];
  overview: string;
  vote_average: number;
}

export type ViewMode = 'grid' | 'matrix' | 'timeline' | 'compact';

export interface FilterState {
  searchQuery: string;
  mediaType: 'all' | 'movie' | 'tv' | 'anime' | 'kdrama';
  selectedGenre: string | null;
  selectedTag: string | null;
  minRating: number;
  sortBy: 'watched_date_desc' | 'watched_date_asc' | 'rating_desc' | 'year_desc' | 'title_asc';
}
