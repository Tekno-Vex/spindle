import albumsData from '@/data/albums.json';
import type { Album } from '@/types';

const albums = albumsData as Album[];

export default function Home() {
  const total = albums.length;
  const sample = albums.slice(0, 5);

  return (
    <main style={{ fontFamily: 'Georgia, serif', padding: '40px', background: '#f2ede4', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>Spindle</h1>
      <p style={{ color: '#7a7068', marginBottom: '32px' }}>
        {total.toLocaleString()} albums loaded · Sprint 1 complete
      </p>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Top 5 albums from your dataset:</h2>
      {sample.map(album => (
        <div key={album.id} style={{ 
          background: 'white', 
          padding: '16px', 
          marginBottom: '12px', 
          borderLeft: '4px solid #c0392b' 
        }}>
          <strong>#{album.rym_rank} — {album.title}</strong> by {album.artist} ({album.year})
          <br />
          <small style={{ color: '#7a7068' }}>
            Rating: {album.avg_rating} · Genres: {album.genres.join(', ')}
          </small>
        </div>
      ))}
      <p style={{ marginTop: '32px', color: '#7a7068', fontSize: '14px' }}>
        Sprint 2 will build the actual UI. This page just confirms data is flowing correctly.
      </p>
    </main>
  );
}