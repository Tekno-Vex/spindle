export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genres: string[];          // empty for now — populated via Spotify API in Sprint 2
  vibes: string[];           // empty — not used yet
  rym_rank: number;
  avg_rating: number;
  rating_count: number | null;  // null — populated via Spotify API in Sprint 2
  cover_url: string;            // empty — populated via Spotify API in Sprint 2
  rym_url: string;
  spotify_id: string | null;    // null — populated in Sprint 2
  apple_music_id: string | null;
  release_type: 'album' | 'live' | 'soundtrack' | 'compilation' | 'ep' | 'unknown';
  is_archival: boolean;         // display metadata only, never an exclude filter
}