'use client';
import { useState } from 'react';
import type { Album } from '@/types';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) {
    return `/api/cover?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round((rating / 5) * 5);
  return (
    <span>
      {Array.from({length:5}).map((_,i) => (
        <span key={i} style={{ color: i < filled ? 'var(--gold)' : 'var(--border-hi)', fontSize:'15px' }}>★</span>
      ))}
    </span>
  );
}

export default function AlbumCard({ album, isNew=false }: { album: Album; isNew?: boolean }) {
  const [imgErr, setImgErr]    = useState(false);
  const [imgLoaded, setLoaded] = useState(false);

  const spotifyUrl = album.spotify_id
    ? `https://open.spotify.com/album/${album.spotify_id}`
    : null;

  return (
    <div
      className={isNew ? 'anim-card' : ''}
      style={{
        background:   'var(--bg-card)',
        border:       '1px solid var(--border-mid)',
        borderRadius: '24px',
        overflow:     'hidden',
        boxShadow:    isNew
          ? '0 0 80px rgba(155,93,229,.18), 0 32px 64px rgba(0,0,0,.6)'
          : '0 8px 32px rgba(0,0,0,.35)',
      }}
    >
      <div style={{ display:'flex', flexDirection:'column' }}>

        {/* ── Cover ── */}
        <div style={{ position:'relative', width:'100%', aspectRatio:'1/1', background:'var(--bg-surface)' }}>

          {/* Rank badge */}
          <div style={{
            position:'absolute', top:'16px', left:'16px', zIndex:10,
            fontFamily:'var(--font-mono)', fontSize:'11px',
            letterSpacing:'.08em',
            padding:'5px 12px',
            borderRadius:'99px',
            background:'rgba(7,7,15,.8)',
            color:'var(--accent-hi)',
            border:'1px solid var(--border-mid)',
            backdropFilter:'blur(12px)',
          }}>
            #{album.rym_rank}
          </div>

          {/* Spotify badge */}
          {spotifyUrl && (
            <a
              href={spotifyUrl} target="_blank" rel="noopener noreferrer"
              style={{
                position:'absolute', top:'16px', right:'16px', zIndex:10,
                fontFamily:'var(--font-mono)', fontSize:'10px',
                letterSpacing:'.06em',
                padding:'5px 12px',
                borderRadius:'99px',
                background:'#1DB954',
                color:'white',
                textDecoration:'none',
                backdropFilter:'blur(12px)',
                transition:'opacity .15s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='.8')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >
              ▶ Spotify
            </a>
          )}

          {/* Image */}
          {album.cover_url && !imgErr ? (
            <>
              {!imgLoaded && (
                <div style={{
                  position:'absolute', inset:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:'var(--bg-surface)',
                }}>
                  <div className="anim-spin" style={{
                    width:'28px', height:'28px', borderRadius:'50%',
                    border:'2px solid var(--border-hi)',
                    borderTopColor:'var(--accent)',
                  }}/>
                </div>
              )}
              <img
                src={proxyUrl(album.cover_url)}
                alt={`${album.title} by ${album.artist}`}
                style={{ width:'100%', height:'100%', objectFit:'cover', opacity: imgLoaded ? 1 : 0, transition:'opacity .4s ease', display:'block' }}
                onLoad={() => setLoaded(true)}
                onError={() => setImgErr(true)}
              />
              {imgLoaded && (
                <div style={{
                  position:'absolute', bottom:0, left:0, right:0, height:'80px',
                  background:'linear-gradient(to top, var(--bg-card), transparent)',
                  pointerEvents:'none',
                }}/>
              )}
            </>
          ) : (
            <div style={{
              width:'100%', height:'100%', minHeight:'260px',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg, var(--bg-surface), var(--bg-card))',
            }}>
              <div style={{ fontSize:'48px', opacity:.12, marginBottom:'10px' }}>◎</div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
                No cover art
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ padding:'28px 28px 24px' }}>

          {/* Year + type */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <span className="pill">{album.year}</span>
            <span className="pill" style={{ textTransform:'capitalize' }}>{album.release_type}</span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily:'var(--font-playfair)',
            fontWeight:700,
            fontSize:'clamp(26px,5vw,40px)',
            letterSpacing:'-.02em',
            lineHeight:1.1,
            color:'var(--text)',
            marginBottom:'8px',
          }}>
            {album.title}
          </h2>

          {/* Artist */}
          <p style={{
            fontFamily:'var(--font-inter)',
            fontWeight:600,
            fontSize:'clamp(15px,2.5vw,18px)',
            background:'linear-gradient(90deg, var(--accent-hi), var(--accent-pink))',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            marginBottom:'20px',
          }}>
            {album.artist}
          </p>

          {/* Rating */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'10px',
            background:'var(--bg-surface)',
            border:'1px solid var(--border)',
            borderRadius:'12px',
            padding:'10px 16px',
            marginBottom:'20px',
          }}>
            <Stars rating={album.avg_rating}/>
            <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'18px', color:'var(--gold)' }}>
              {album.avg_rating.toFixed(2)}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>/ 5.00</span>
          </div>

          {/* Genre pills */}
          {album.genres?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px' }}>
              {album.genres.slice(0,5).map(g => (
                <span key={g} className="pill" style={{
                  borderColor:'rgba(155,93,229,.25)',
                  background:'rgba(155,93,229,.07)',
                  color:'var(--accent-hi)',
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* RYM link */}
          {album.rym_url && (
            <a
              href={album.rym_url} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily:'var(--font-mono)', fontSize:'11px',
                color:'var(--text-muted)', textDecoration:'none',
                letterSpacing:'.04em', opacity:.7,
                transition:'opacity .15s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='1')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='.7')}
            >
              View on RateYourMusic →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}