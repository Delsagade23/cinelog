import { TMDbDetails, TMDbSearchResult } from './types';

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Curated offline mock search dictionary for instant seamless testing
const POPULAR_SEARCH_FALLBACK: TMDbDetails[] = [
  {
    id: 900667,
    title: 'One Piece Film Red',
    media_type: 'anime',
    release_year: 2022,
    runtime_minutes: 120,
    poster_url: 'https://image.tmdb.org/t/p/w780/8ibfhe4P7rhmn3lrPhOZzIJHA2B.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/wghKvEjM7UzQzQcKnGbDjOyQO13.jpg',
    director: 'Echiro Oda',
    cast: ['Mayumi Tanaka', 'Kaori Nazuka', 'Ado', 'Shuichi Ikeda'],
    genres: ['Animation', 'Action', 'Adventure', 'Fantasy'],
    overview: 'A new adventure begins for Luffy and his crew when mysterious pop superstar Uta unveils her identity.',
    vote_average: 8.6
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    media_type: 'movie',
    release_year: 2024,
    runtime_minutes: 166,
    poster_url: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
    genres: ['Science Fiction', 'Adventure'],
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge.',
    vote_average: 8.5
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    media_type: 'movie',
    release_year: 2023,
    runtime_minutes: 180,
    poster_url: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    genres: ['Drama', 'History'],
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    vote_average: 8.4
  },
  {
    id: 157336,
    title: 'Interstellar',
    media_type: 'movie',
    release_year: 2014,
    runtime_minutes: 169,
    poster_url: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    vote_average: 8.4
  },
  {
    id: 496243,
    title: 'Parasite',
    media_type: 'movie',
    release_year: 2019,
    runtime_minutes: 132,
    poster_url: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdFiF7BkWQmQm.jpg',
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    genres: ['Comedy', 'Thriller', 'Drama'],
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood.',
    vote_average: 8.5
  },
  {
    id: 119051,
    title: 'Wednesday',
    media_type: 'tv',
    release_year: 2022,
    runtime_minutes: 45,
    poster_url: 'https://image.tmdb.org/t/p/w780/9PFonQhy4cQy7Jz20NpYGg9W11P.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg',
    director: 'Tim Burton',
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome'],
    genres: ['Sci-Fi & Fantasy', 'Mystery', 'Comedy'],
    overview: 'Wednesday Addams misadventures as a student at Nevermore Academy.',
    vote_average: 8.1
  },
  {
    id: 1396,
    title: 'Breaking Bad',
    media_type: 'tv',
    release_year: 2008,
    runtime_minutes: 47,
    poster_url: 'https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    director: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    genres: ['Drama', 'Crime'],
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.',
    vote_average: 8.9
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    media_type: 'tv',
    release_year: 2011,
    runtime_minutes: 57,
    poster_url: 'https://image.tmdb.org/t/p/w780/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    director: 'David Benioff, D.B. Weiss',
    cast: ['Emilia Clarke', 'Peter Dinklage', 'Kit Harington'],
    genres: ['Sci-Fi & Fantasy', 'Drama', 'Action & Adventure'],
    overview: 'Nine noble families fight for control over the lands of Westeros.',
    vote_average: 8.4
  },
  {
    id: 124364,
    title: 'The Bear',
    media_type: 'tv',
    release_year: 2022,
    runtime_minutes: 32,
    poster_url: 'https://image.tmdb.org/t/p/w780/sHFlw1q08h97W7o92gDqV9cWqG4.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/c4m9Wn5r8h97W7o92gDqV9cWqG4.jpg',
    director: 'Christopher Storer',
    cast: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri'],
    genres: ['Drama', 'Comedy'],
    overview: 'A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop.',
    vote_average: 8.6
  },
  {
    id: 1429,
    title: 'Attack on Titan',
    media_type: 'anime',
    release_year: 2013,
    runtime_minutes: 24,
    poster_url: 'https://image.tmdb.org/t/p/w780/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/b9h88rQ0fU0lQ28mC9g2ZlC2r7D.jpg',
    director: 'Tetsurō Araki',
    cast: ['Yuki Kaji', 'Yui Ishikawa', 'Marina Inoue', 'Hiroshi Kamiya'],
    genres: ['Animation', 'Action', 'Sci-Fi & Fantasy'],
    overview: 'Centuries ago, mankind was slaughtered by monstrous humanoid creatures called Titans.',
    vote_average: 8.9
  },
  {
    id: 105248,
    title: 'Cyberpunk: Edgerunners',
    media_type: 'anime',
    release_year: 2022,
    runtime_minutes: 24,
    poster_url: 'https://image.tmdb.org/t/p/w780/7jswOcU8y60zL15jL45KgnqH4yB.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/70Rm9m1mb9T05115d7v71NDNswE.jpg',
    director: 'Hiroyuki Imaishi',
    cast: ['KENN', 'Aoi Yuki', 'Hiroki Touchi', 'Michiko Kaiden'],
    genres: ['Animation', 'Sci-Fi & Fantasy', 'Action'],
    overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.',
    vote_average: 8.6
  },
  {
    id: 93405,
    title: 'Squid Game',
    media_type: 'kdrama',
    release_year: 2021,
    runtime_minutes: 55,
    poster_url: 'https://image.tmdb.org/t/p/w780/dDlGgwXb6823L5nQ6lF3x7k727Y.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    director: 'Hwang Dong-hyuk',
    cast: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon', 'Jung Ho-yeon'],
    genres: ['Drama', 'Mystery', 'Action & Adventure'],
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.',
    vote_average: 8.4
  },
  {
    id: 94796,
    title: 'Crash Landing on You',
    media_type: 'kdrama',
    release_year: 2019,
    runtime_minutes: 80,
    poster_url: 'https://image.tmdb.org/t/p/w780/k7NlK6lX9cT0iA2P3N3WvE4F6uG.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/ilRyAZstrMptVeNa29nOBNsIQ97.jpg',
    director: 'Lee Jeong-hyo',
    cast: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye', 'Kim Jung-hyun'],
    genres: ['Drama', 'Romance', 'Comedy'],
    overview: 'A paragliding mishap drops a South Korean heiress into North Korea -- and into the life of an army officer.',
    vote_average: 8.7
  }
];

export async function searchTMDb(query: string, mediaType: 'movie' | 'tv' | 'multi' = 'multi'): Promise<TMDbSearchResult[]> {
  if (!query.trim()) return [];

  // 1. If real TMDB_API_KEY is available, hit TMDb API
  if (TMDB_API_KEY && TMDB_API_KEY !== 'your_tmdb_api_key') {
    try {
      const endpoint = mediaType === 'multi' 
        ? `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        : `${TMDB_BASE_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        return (data.results || []).filter((item: any) => item.media_type !== 'person' && (item.poster_path || item.backdrop_path));
      }
    } catch (err) {
      console.warn('TMDb live API search failed, falling back to local search engine', err);
    }
  }

  // 2. Intelligent Mock Fallback Engine
  const qLower = query.toLowerCase();
  const matched = POPULAR_SEARCH_FALLBACK.filter(item => 
    item.title.toLowerCase().includes(qLower) || 
    item.director.toLowerCase().includes(qLower) ||
    item.genres.some(g => g.toLowerCase().includes(qLower))
  );

  if (matched.length > 0) {
    return matched.map(m => ({
      id: m.id,
      title: m.title,
      name: m.media_type === 'tv' ? m.title : undefined,
      media_type: m.media_type,
      release_date: m.media_type === 'movie' ? `${m.release_year}-01-01` : undefined,
      first_air_date: m.media_type === 'tv' ? `${m.release_year}-01-01` : undefined,
      poster_path: m.poster_url.replace('https://image.tmdb.org/t/p/w780', ''),
      backdrop_path: m.backdrop_url.replace('https://image.tmdb.org/t/p/original', ''),
      overview: m.overview,
      vote_average: m.vote_average,
      genre_ids: [18, 878]
    }));
  }

  // If no direct preset match, generate a realistic instant candidate for user testing
  return [
    {
      id: Math.floor(Math.random() * 900000) + 100000,
      title: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      name: mediaType === 'tv' ? query : undefined,
      media_type: mediaType === 'tv' ? 'tv' : 'movie',
      release_date: '2024-01-01',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
      overview: `A compelling narrative exploring visionary themes, directorial boldness, and human emotional depth.`,
      vote_average: 8.5,
      genre_ids: [18, 878]
    }
  ];
}

export async function getTMDbDetails(id: number, mediaType: import('./types').MediaType = 'movie'): Promise<TMDbDetails | null> {
  const tmdbEndpointType = (mediaType === 'tv' || mediaType === 'anime' || mediaType === 'kdrama') ? 'tv' : 'movie';
  if (TMDB_API_KEY && TMDB_API_KEY !== 'your_tmdb_api_key') {
    try {
      const endpoint = `${TMDB_BASE_URL}/${tmdbEndpointType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        
        let director = 'Unknown';
        if (tmdbEndpointType === 'movie' && data.credits?.crew) {
          const dirObj = data.credits.crew.find((c: any) => c.job === 'Director');
          if (dirObj) director = dirObj.name;
        } else if (tmdbEndpointType === 'tv' && data.created_by?.length) {
          director = data.created_by.map((c: any) => c.name).join(', ');
        }

        const cast = data.credits?.cast ? data.credits.cast.slice(0, 5).map((c: any) => c.name) : [];
        const genres = data.genres ? data.genres.map((g: any) => g.name) : [];

        return {
          id: data.id,
          title: data.title || data.name,
          media_type: mediaType,
          release_year: new Date(data.release_date || data.first_air_date || Date.now()).getFullYear(),
          runtime_minutes: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 60) || 120,
          poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
          backdrop_url: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
          director: director || 'Visionary Director',
          cast,
          genres,
          overview: data.overview || '',
          vote_average: Number((data.vote_average || 8.0).toFixed(1))
        };
      }
    } catch (err) {
      console.warn('TMDb live details fetch failed', err);
    }
  }

  // Fallback preset details
  const fallback = POPULAR_SEARCH_FALLBACK.find(m => m.id === id);
  if (fallback) return fallback;

  return {
    id,
    title: 'Cinematic Work',
    media_type: mediaType,
    release_year: 2024,
    runtime_minutes: 124,
    poster_url: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
    director: 'Auteur Director',
    cast: ['Lead Actor', 'Supporting Actor'],
    genres: ['Drama', 'Cinema'],
    overview: 'A distinctive cinematic exploration.',
    vote_average: 8.5
  };
}
