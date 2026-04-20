export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  release_date: string;
  genres: string[];
  vibes: string[];
  rym_rank: number;
  avg_rating: number;
  rating_count: number | null;
  cover_url: string;
  rym_url: string;
  spotify_id: string | null;
  apple_music_id: string | null;
  release_type: 'album' | 'live' | 'soundtrack' | 'compilation' | 'ep' | 'unknown';
  is_archival: boolean;
}