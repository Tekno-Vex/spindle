import albumsData from '@/data/albums.json';

type Album = { rym_rank: number; title: string; artist: string; avg_rating: number; cover_url: string; year: number; genres: string[] };

export function getAlbumMeta(rank: number) {
  const albums = albumsData as Album[];
  const album  = albums.find(a => a.rym_rank === rank);
  if (!album) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spindle-amber.vercel.app';

  return {
    title:       `${album.title} by ${album.artist.split('/')[0].trim()}`,
    description: `Rated ${album.avg_rating.toFixed(2)}/5 on Rate Your Music. #${album.rym_rank} all-time. ${album.genres.slice(0,2).join(', ')}. Discover it on Spindle.`,
    ogImage:     `${siteUrl}/api/og?rank=${album.rym_rank}`,
    album,
  };
}