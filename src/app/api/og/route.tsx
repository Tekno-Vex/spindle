import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Lightweight album lookup — no albums.json import
async function getAlbum(rank: number, baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/album?rank=${rank}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const rank  = parseInt(searchParams.get('rank') || '1');
  const album = await getAlbum(rank, origin);

  const title    = album?.title      || 'Spindle';
  const artist   = album?.artist     || 'Music Discovery';
  const rating   = album?.avg_rating || 0;
  const year     = album?.year       || '';
  const genre    = album?.genres?.[0] || '';
  const rymRank  = album?.rym_rank   || rank;
  const coverUrl = album?.cover_url
    ? `${origin}/api/cover?url=${encodeURIComponent(album.cover_url)}`
    : null;

  return new ImageResponse(
    (
      <div style={{ width:'1200px', height:'630px', display:'flex', background:'#07070f', fontFamily:'system-ui, sans-serif', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.2) 0%, transparent 60%)', display:'flex' }}/>

        {/* Cover */}
        <div style={{ width:'630px', height:'630px', flexShrink:0, position:'relative', display:'flex' }}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} width={630} height={630} style={{ objectFit:'cover', display:'block' }}/>
          ) : (
            <div style={{ width:'100%', height:'100%', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:'120px', opacity:0.1, display:'flex' }}>◎</div>
            </div>
          )}
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'160px', background:'linear-gradient(to right, transparent, #07070f)', display:'flex' }}/>
        </div>

        {/* Info */}
        <div style={{ flex:1, padding:'52px 48px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.4)', borderRadius:'99px', padding:'6px 18px', color:'#c084fc', fontSize:'14px', fontWeight:700, letterSpacing:'0.08em', display:'flex' }}>
              #{rymRank} All-Time
            </div>
            <div style={{ color:'#4a4870', fontSize:'14px', letterSpacing:'0.2em', display:'flex' }}>SPINDLE</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ fontSize: title.length > 25 ? '36px' : '44px', fontWeight:700, color:'#f2f0ff', lineHeight:1.05, letterSpacing:'-0.02em', display:'flex', flexWrap:'wrap' }}>
              {title}
            </div>
            <div style={{ fontSize:'22px', fontWeight:600, color:'#c084fc', display:'flex' }}>
              {artist.split('/')[0].trim()}
            </div>
            <div style={{ color:'#6b678a', fontSize:'16px', display:'flex' }}>
              {year}{genre ? ` · ${genre}` : ''}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ display:'flex', gap:'4px' }}>
              {Array.from({length:5}).map((_,i) => (
                <div key={i} style={{ color: i < Math.round(rating) ? '#fbbf24' : '#2a2a4a', fontSize:'24px', display:'flex' }}>★</div>
              ))}
            </div>
            <div style={{ color:'#fbbf24', fontSize:'28px', fontWeight:700, display:'flex' }}>{rating.toFixed(2)}</div>
            <div style={{ color:'#4a4870', fontSize:'16px', display:'flex' }}>/ 5.00</div>
          </div>
        </div>
      </div>
    ),
    { width:1200, height:630 }
  );
}