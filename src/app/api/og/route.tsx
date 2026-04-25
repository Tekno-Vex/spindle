import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import albumsData from '@/data/albums.json';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rank = parseInt(searchParams.get('rank') || '1');

  const albums = albumsData as { rym_rank: number; title: string; artist: string; avg_rating: number; cover_url: string; year: number; genres: string[] }[];
  const album  = albums.find(a => a.rym_rank === rank) || albums[0];

  const proxyUrl = album.cover_url
    ? `${new URL(request.url).origin}/api/cover?url=${encodeURIComponent(album.cover_url)}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: '#07070f',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.2) 0%, transparent 60%)',
          display: 'flex',
        }}/>

        {/* Cover art */}
        <div style={{ width: '630px', height: '630px', flexShrink: 0, position: 'relative', display: 'flex' }}>
          {proxyUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyUrl}
              width={630}
              height={630}
              style={{ objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '120px', opacity: 0.1, display: 'flex' }}>◎</div>
            </div>
          )}
          {/* Gradient overlay on right edge of image */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '160px',
            background: 'linear-gradient(to right, transparent, #07070f)',
            display: 'flex',
          }}/>
        </div>

        {/* Info panel */}
        <div style={{
          flex: 1,
          padding: '52px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Top — rank + site name */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '99px',
              padding: '6px 18px',
              color: '#c084fc',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              display: 'flex',
            }}>
              #{album.rym_rank} All-Time
            </div>
            <div style={{ color: '#4a4870', fontSize: '14px', letterSpacing: '0.2em', display: 'flex' }}>
              SPINDLE
            </div>
          </div>

          {/* Middle — title + artist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: album.title.length > 25 ? '36px' : '44px',
              fontWeight: 700,
              color: '#f2f0ff',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              display: 'flex',
              flexWrap: 'wrap',
            }}>
              {album.title}
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#c084fc',
              display: 'flex',
            }}>
              {album.artist.split('/')[0].trim()}
            </div>
            <div style={{ color: '#6b678a', fontSize: '16px', display: 'flex' }}>
              {album.year}
              {album.genres?.[0] ? ` · ${album.genres[0]}` : ''}
            </div>
          </div>

          {/* Bottom — rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  color: i < Math.round(album.avg_rating) ? '#fbbf24' : '#2a2a4a',
                  fontSize: '24px',
                  display: 'flex',
                }}>★</div>
              ))}
            </div>
            <div style={{ color: '#fbbf24', fontSize: '28px', fontWeight: 700, display: 'flex' }}>
              {album.avg_rating.toFixed(2)}
            </div>
            <div style={{ color: '#4a4870', fontSize: '16px', display: 'flex' }}>/ 5.00</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}