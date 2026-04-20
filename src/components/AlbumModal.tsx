'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { Album } from '@/types';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) {
    return `/api/cover?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface Track {
  number: number;
  title: string;
  duration: string | null;
}

interface MBRelease {
  label: string | null;
  country: string | null;
  tracks: Track[];
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getPlatformPreference(): 'spotify' | 'apple' | 'youtube' {
  if (typeof window === 'undefined') return 'spotify';
  return (localStorage.getItem('spindle_platform') as 'spotify' | 'apple' | 'youtube') || 'spotify';
}

function setPlatformPreference(p: 'spotify' | 'apple' | 'youtube') {
  localStorage.setItem('spindle_platform', p);
}

// Real SVG logos for each platform
function SpotifyLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  );
}

function YoutubeLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface Props {
  album: Album;
  allAlbums: Album[];
  onClose: () => void;
}

export default function AlbumModal({ album, allAlbums, onClose }: Props) {
  const [mbData,    setMbData]    = useState<MBRelease | null>(null);
  const [mbLoading, setMbLoading] = useState(true);
  const [platform,  setPlatform]  = useState<'spotify' | 'apple' | 'youtube'>('spotify');
  const [copied,    setCopied]    = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Fix similar albums — compute once on mount, never recompute
  const similarAlbums = useRef<Album[]>(
    allAlbums
      .filter(a =>
        a.rym_rank !== album.rym_rank &&
        a.genres?.length > 0 &&
        album.genres?.length > 0 &&
        a.genres.some(g => album.genres.includes(g))
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
  ).current;

  useEffect(() => {
    setPlatform(getPlatformPreference());
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setMbLoading(true);
    setMbData(null);

    const fetchMB = async () => {
      try {
        const searchUrl = `https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(album.title)}+artist:${encodeURIComponent(album.artist.split('/')[0].trim())}&limit=5&fmt=json`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'User-Agent': 'Spindle/1.0 (music discovery app)' }
        });
        if (!searchRes.ok) { setMbLoading(false); return; }
        const searchData = await searchRes.json();

        const releases = searchData.releases;
        if (!releases || releases.length === 0) { setMbLoading(false); return; }

        const match = releases.find((r: { date?: string }) =>
          r.date && r.date.startsWith(String(album.year))
        ) || releases[0];

        if (!match?.id) { setMbLoading(false); return; }

        await new Promise(r => setTimeout(r, 500));
        const releaseRes = await fetch(
          `https://musicbrainz.org/ws/2/release/${match.id}?inc=recordings+labels&fmt=json`,
          { headers: { 'User-Agent': 'Spindle/1.0 (music discovery app)' } }
        );
        if (!releaseRes.ok) { setMbLoading(false); return; }
        const releaseData = await releaseRes.json();

        const media = releaseData.media?.[0];
        const tracks: Track[] = (media?.tracks || []).map((t: {
          number: string;
          title: string;
          recording?: { length?: number };
          length?: number;
        }, i: number) => ({
          number: i + 1,
          title: t.title,
          duration: t.length ? formatDuration(t.length) :
                   t.recording?.length ? formatDuration(t.recording.length) : null,
        }));

        const labelInfo = releaseData['label-info']?.[0]?.label?.name || null;
        setMbData({ label: labelInfo, country: releaseData.country || null, tracks });
      } catch {
        // silent fail
      } finally {
        setMbLoading(false);
      }
    };

    fetchMB();
  }, [album]);

  const spotifyUrl      = album.spotify_id ? `https://open.spotify.com/album/${album.spotify_id}` : null;
  const appleMusicUrl   = `https://music.apple.com/search?term=${encodeURIComponent(album.title + ' ' + album.artist)}`;
  const youtubeMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(album.title + ' ' + album.artist)}`;

  const primaryUrl = platform === 'spotify' ? spotifyUrl :
                     platform === 'apple'   ? appleMusicUrl :
                                              youtubeMusicUrl;

  const handlePlatformChange = (p: 'spotify' | 'apple' | 'youtube') => {
    setPlatform(p);
    setPlatformPreference(p);
  };

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/?album=${album.rym_rank}`;
    const text = `${album.title} by ${album.artist}`;
    try {
      await navigator.clipboard.writeText(`${text} — ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  }, [album]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(4,4,12,.85)',
          backdropFilter:'blur(12px)',
          animation:'fadeIn .2s ease',
        }}
      />

      {/* Modal */}
      <div style={{ position:'fixed', inset:0, zIndex:101, overflowY:'auto', padding:'24px 16px' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth:'960px', margin:'0 auto',
            background:'var(--bg-card)',
            border:'1px solid var(--border-mid)',
            borderRadius:'28px', overflow:'hidden',
            boxShadow:'0 40px 80px rgba(0,0,0,.8)',
            animation:'cardIn .4s cubic-bezier(.16,1,.3,1)',
            position:'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position:'absolute', top:'20px', right:'20px', zIndex:10,
              width:'36px', height:'36px', borderRadius:'50%',
              background:'rgba(7,7,15,.8)', border:'1px solid var(--border-mid)',
              color:'var(--text-muted)', fontSize:'18px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              backdropFilter:'blur(8px)',
            }}
          >
            ×
          </button>

          {/* Hero */}
          <div className="modal-hero" style={{ display:'grid', gridTemplateColumns:'300px 1fr' }}>

            {/* Cover */}
            <div style={{ position:'relative', aspectRatio:'1/1', background:'var(--bg-surface)', flexShrink:0 }}>
              {album.cover_url ? (
                <>
                  {!imgLoaded && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)' }}>
                      <div className="anim-spin" style={{ width:'28px', height:'28px', borderRadius:'50%', border:'2px solid var(--border-hi)', borderTopColor:'var(--accent)' }}/>
                    </div>
                  )}
                  <img
                    src={proxyUrl(album.cover_url)}
                    alt={album.title}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity: imgLoaded ? 1 : 0, transition:'opacity .3s' }}
                    onLoad={() => setImgLoaded(true)}
                  />
                </>
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)' }}>
                  <span style={{ fontSize:'48px', opacity:.1 }}>◎</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding:'36px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div>
                {/* Pills */}
                <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontSize:'11px',
                    padding:'4px 12px', borderRadius:'99px',
                    background:'rgba(168,85,247,.12)', color:'var(--accent-hi)',
                    border:'1px solid rgba(168,85,247,.25)',
                  }}>
                    #{album.rym_rank} All-Time
                  </span>
                  <span className="pill" style={{ fontSize:'11px' }}>{album.release_date || album.year}</span>
                  <span className="pill" style={{ fontSize:'11px', textTransform:'capitalize' }}>{album.release_type}</span>
                  {mbData?.label && <span className="pill" style={{ fontSize:'11px' }}>{mbData.label}</span>}
                  {mbData?.country && <span className="pill" style={{ fontSize:'11px' }}>{mbData.country}</span>}
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily:'var(--font-playfair)', fontWeight:700,
                  fontSize:'clamp(24px, 3.5vw, 44px)',
                  letterSpacing:'-.02em', lineHeight:1.05,
                  color:'var(--text)', marginBottom:'8px',
                }}>
                  {album.title}
                </h2>

                {/* Artist */}
                <p style={{
                  fontFamily:'var(--font-inter)', fontWeight:600,
                  fontSize:'clamp(16px, 2vw, 22px)',
                  background:'linear-gradient(90deg, var(--accent-hi), var(--accent-pink))',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  backgroundClip:'text', marginBottom:'20px',
                }}>
                  {album.artist}
                </p>

                {/* Rating */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:'10px',
                  background:'var(--bg-surface)', border:'1px solid var(--border-mid)',
                  borderRadius:'12px', padding:'10px 16px', marginBottom:'20px',
                }}>
                  <span style={{ fontSize:'15px' }}>
                    {Array.from({length:5}).map((_,i) => (
                      <span key={i} style={{ color: i < Math.round(album.avg_rating) ? 'var(--gold)' : 'var(--border-hi)' }}>★</span>
                    ))}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'22px', color:'var(--gold)' }}>
                    {album.avg_rating.toFixed(2)}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>/ 5.00</span>
                  {album.rating_count && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', borderLeft:'1px solid var(--border-mid)', paddingLeft:'10px' }}>
                      {(album.rating_count / 1000).toFixed(0)}k ratings
                    </span>
                  )}
                </div>

                {/* Genres */}
                {album.genres?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'24px' }}>
                    {album.genres.map(g => (
                      <span key={g} className="pill" style={{
                        fontSize:'11px',
                        borderColor:'rgba(168,85,247,.25)',
                        background:'rgba(168,85,247,.07)',
                        color:'var(--accent-hi)',
                      }}>
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Streaming section */}
              <div>
                {/* Platform selector with real logos */}
                <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                  {(['spotify', 'apple', 'youtube'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePlatformChange(p)}
                      style={{
                        display:'flex', alignItems:'center', gap:'6px',
                        fontFamily:'var(--font-mono)', fontSize:'11px',
                        padding:'6px 14px', borderRadius:'99px',
                        border:`1px solid ${platform === p ? (p === 'spotify' ? '#1DB954' : p === 'apple' ? '#fc3c44' : '#FF0000') : 'var(--border-mid)'}`,
                        background: platform === p
                          ? (p === 'spotify' ? 'rgba(29,185,84,.12)' : p === 'apple' ? 'rgba(252,60,68,.12)' : 'rgba(255,0,0,.12)')
                          : 'transparent',
                        color: platform === p ? 'var(--text)' : 'var(--text-muted)',
                        cursor:'pointer', transition:'all .15s',
                      }}
                    >
                      {p === 'spotify' ? <SpotifyLogo/> : p === 'apple' ? <AppleLogo/> : <YoutubeLogo/>}
                      <span>{p === 'spotify' ? 'Spotify' : p === 'apple' ? 'Apple Music' : 'YouTube'}</span>
                    </button>
                  ))}
                </div>

                {/* Listen Now button */}
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                  <a
                    href={primaryUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily:'var(--font-mono)', fontSize:'13px',
                      padding:'11px 28px', borderRadius:'99px',
                      background: platform === 'spotify' ? '#1DB954' : platform === 'apple' ? '#fc3c44' : '#FF0000',
                      color:'white', textDecoration:'none',
                      letterSpacing:'.04em', transition:'opacity .15s',
                      opacity: primaryUrl ? 1 : 0.4,
                      pointerEvents: primaryUrl ? 'auto' : 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity='.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity='1')}
                  >
                    Listen Now
                  </a>

                  {/* Share button — separate from streaming */}
                  <button
                    onClick={handleShare}
                    style={{
                      fontFamily:'var(--font-mono)', fontSize:'12px',
                      padding:'11px 20px', borderRadius:'99px',
                      border:'1px solid var(--border-mid)',
                      background:'transparent', color:'var(--text-muted)',
                      cursor:'pointer', transition:'all .15s',
                      display:'flex', alignItems:'center', gap:'6px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent-hi)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.color='var(--text-muted)'; }}
                  >
                    {copied ? '✓ Copied!' : '⎘ Share Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tracklist */}
          <div style={{ borderTop:'1px solid var(--border)', padding:'32px 40px' }}>
            <h3 style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'20px' }}>
              Tracklist
            </h3>

            {mbLoading ? (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>
                <div className="anim-spin" style={{ width:'14px', height:'14px', borderRadius:'50%', border:'1.5px solid var(--border-hi)', borderTopColor:'var(--accent)', flexShrink:0 }}/>
                Looking up tracklist...
              </div>
            ) : mbData?.tracks && mbData.tracks.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'0' }}>
                {mbData.tracks.map(track => (
                  <div key={track.number} style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'8px 0', borderBottom:'1px solid var(--border)',
                  }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', minWidth:'20px', textAlign:'right' }}>
                      {track.number}
                    </span>
                    <span style={{ fontFamily:'var(--font-inter)', fontSize:'13px', color:'var(--text)', flex:1 }}>
                      {track.title}
                    </span>
                    {track.duration && (
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
                        {track.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>
                Tracklist not available —&nbsp;
                <a
                  href={`https://musicbrainz.org/search?query=${encodeURIComponent(album.title)}&type=release`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color:'var(--accent-hi)', textDecoration:'none' }}
                >
                  Search on MusicBrainz →
                </a>
              </div>
            )}
          </div>

          {/* Similar albums */}
          {similarAlbums.length > 0 && (
            <div style={{ borderTop:'1px solid var(--border)', padding:'32px 40px' }}>
              <h3 style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'20px' }}>
                You might also like
              </h3>
              <div style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'8px' }}>
                {similarAlbums.map(a => (
                  <div
                    key={a.rym_rank}
                    style={{ flexShrink:0, width:'120px', cursor:'pointer' }}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('spindle:openAlbum', { detail: a }));
                      onClose();
                    }}
                  >
                    <div style={{ width:'120px', height:'120px', borderRadius:'12px', overflow:'hidden', background:'var(--bg-surface)', marginBottom:'8px' }}>
                      {a.cover_url ? (
                        <img
                          src={proxyUrl(a.cover_url)}
                          alt={a.title}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        />
                      ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontSize:'32px', opacity:.1 }}>◎</span>
                        </div>
                      )}
                    </div>
                    <p style={{ fontFamily:'var(--font-inter)', fontSize:'11px', fontWeight:600, color:'var(--text)', lineHeight:1.3, marginBottom:'2px' }}>
                      {a.title.length > 22 ? a.title.slice(0,22)+'…' : a.title}
                    </p>
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
                      {a.artist.split('/')[0].trim().slice(0,20)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}