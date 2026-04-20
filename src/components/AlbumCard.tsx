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
        <span key={i} style={{ color: i < filled ? 'var(--gold)' : 'var(--border-hi)', fontSize:'16px' }}>★</span>
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
          ? '0 0 80px rgba(168,85,247,.15), 0 32px 64px rgba(0,0,0,.6)'
          : '0 8px 32px rgba(0,0,0,.4)',
      }}
    >
      {/* Two column layout on desktop */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(280px, 420px) 1fr' }}>

        {/* ── Cover ── */}
        <div style={{ position:'relative', aspectRatio:'1/1', background:'var(--bg-surface)' }}>
          <div style={{
            position:'absolute', top:'16px', left:'16px', zIndex:10,
            fontFamily:'var(--font-mono)', fontSize:'12px', letterSpacing:'.08em',
            padding:'6px 14px', borderRadius:'99px',
            background:'rgba(7,7,15,.85)', color:'var(--accent-hi)',
            border:'1px solid var(--border-mid)', backdropFilter:'blur(12px)',
          }}>
            #{album.rym_rank}
          </div>

          {album.cover_url && !imgErr ? (
            <>
              {!imgLoaded && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)' }}>
                  <div className="anim-spin" style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--border-hi)', borderTopColor:'var(--accent)' }}/>
                </div>
              )}
              <img
                src={proxyUrl(album.cover_url)}
                alt={`${album.title} by ${album.artist}`}
                style={{ width:'100%', height:'100%', objectFit:'cover', opacity: imgLoaded?1:0, transition:'opacity .4s ease', display:'block' }}
                onLoad={() => setLoaded(true)}
                onError={() => setImgErr(true)}
              />
            </>
          ) : (
            <div style={{
              width:'100%', height:'100%', minHeight:'320px',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg, var(--bg-surface), var(--bg-card))',
            }}>
              <div style={{ fontSize:'56px', opacity:.1, marginBottom:'12px' }}>◎</div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>No cover art</span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ padding:'40px 48px', display:'flex', flexDirection:'column', justifyContent:'center' }}>

          {/* Pills */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
            <span className="pill" style={{ fontSize:'13px' }}>{album.release_date || album.year}</span>
            <span className="pill" style={{ fontSize:'12px', textTransform:'capitalize' }}>{album.release_type}</span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily:'var(--font-playfair)',
            fontWeight:700,
            fontSize:'clamp(28px, 3.5vw, 52px)',
            letterSpacing:'-.02em',
            lineHeight:1.05,
            color:'var(--text)',
            marginBottom:'10px',
          }}>
            {album.title}
          </h2>

          {/* Artist */}
          <p style={{
            fontFamily:'var(--font-inter)',
            fontWeight:600,
            fontSize:'clamp(16px, 2vw, 22px)',
            background:'linear-gradient(90deg, var(--accent-hi), var(--accent-pink))',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            marginBottom:'28px',
          }}>
            {album.artist}
          </p>

          {/* Rating */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'12px',
            background:'var(--bg-surface)',
            border:'1px solid var(--border-mid)',
            borderRadius:'14px',
            padding:'12px 20px',
            marginBottom:'24px',
            alignSelf:'flex-start',
          }}>
            <Stars rating={album.avg_rating}/>
            <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'22px', color:'var(--gold)' }}>
              {album.avg_rating.toFixed(2)}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>/ 5.00</span>
            {album.rating_count && (
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', borderLeft:'1px solid var(--border-mid)', paddingLeft:'12px' }}>
                {(album.rating_count / 1000).toFixed(0)}k ratings
              </span>
            )}
          </div>

          {/* Genres */}
          {album.genres?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'28px' }}>
              {album.genres.slice(0,6).map(g => (
                <span key={g} className="pill" style={{
                  borderColor:'rgba(168,85,247,.25)',
                  background:'rgba(168,85,247,.07)',
                  color:'var(--accent-hi)',
                  fontSize:'12px',
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Links row */}
          <div style={{ display:'flex', gap:'16px', alignItems:'center', flexWrap:'wrap' }}>
            {/* Click hint */}
            <div style={{
              marginTop:'20px',
              display:'flex', alignItems:'center', gap:'6px',
              fontFamily:'var(--font-mono)', fontSize:'11px',
              color:'var(--text-muted)', opacity:.6,
            }}>
              <span>Click to explore tracklist, streaming links & more</span>
              <span>→</span>
            </div>
            {album.rym_url && (
              <a href={album.rym_url} target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily:'var(--font-mono)', fontSize:'12px',
                  color:'var(--text-muted)', textDecoration:'none',
                  letterSpacing:'.04em', opacity:.7, transition:'opacity .15s',
                }}
                onMouseEnter={e=>(e.currentTarget.style.opacity='1')}
                onMouseLeave={e=>(e.currentTarget.style.opacity='.7')}
              >
                View on RateYourMusic →
              </a>
            )}
          </div>

          {/* Click hint */}
          <div style={{
            marginTop:'16px',
            fontFamily:'var(--font-mono)', fontSize:'10px',
            color:'var(--text-muted)', opacity:.5,
            letterSpacing:'.06em',
          }}>
            Click card to explore →
          </div>
        </div>
      </div>
    </div>
  );
}