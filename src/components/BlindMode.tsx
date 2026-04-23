'use client';
import { useState } from 'react';
import type { Album } from '@/types';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) return `/api/cover?url=${encodeURIComponent(url)}`;
  return url;
}

interface Props {
  album: Album;
  onReveal: () => void;
  isNew: boolean;
  score: { points: number; total: number; streak: number };
  onScore: (points: number) => void;
}

function getPointsAndLabel(diff: number): { points: number; label: string; color: string } {
  if (diff <= 0.05) return { points: 100, label: '🎯 Perfect!',     color: '#fbbf24' };
  if (diff <= 0.10) return { points: 80,  label: '🔥 Incredible!',  color: '#f59e0b' };
  if (diff <= 0.20) return { points: 60,  label: '✓ Great guess!',  color: '#34d399' };
  if (diff <= 0.35) return { points: 40,  label: '~ Close!',        color: '#60a5fa' };
  if (diff <= 0.50) return { points: 20,  label: '○ Not bad',       color: '#a855f7' };
  return                    { points: 5,   label: '✗ Way off',       color: '#ef4444' };
}

export default function BlindMode({ album, onReveal, isNew, score, onScore }: Props) {
  const [guess,    setGuess]    = useState(3.50);
  const [locked,   setLocked]   = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [result,   setResult]   = useState<{ points: number; label: string; color: string; diff: number } | null>(null);
  const [imgLoaded, setLoaded]  = useState(false);

  const handleLock = () => {
    if (locked) return;
    setLocked(true);
    const diff = Math.abs(guess - album.avg_rating);
    const r    = getPointsAndLabel(diff);
    setResult({ ...r, diff });
    onScore(r.points);
  };

  const handleReveal = () => {
    setRevealed(true);
    onReveal();
  };

  const accuracy = result ? Math.max(0, 100 - Math.round(result.diff * 200)) : 0;

  return (
    <div className={isNew ? 'anim-card' : ''} style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', borderRadius:'24px', overflow:'hidden', boxShadow:'0 0 60px rgba(236,72,153,.1), 0 32px 64px rgba(0,0,0,.5)' }}>

      {/* Score bar */}
      <div style={{ padding:'14px 28px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Blind Mode — Rating Guesser
        </span>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          {score.streak >= 2 && (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'#f59e0b' }}>
              🔥 {score.streak} streak
            </span>
          )}
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--accent-hi)' }}>
            {score.points} pts
            {score.total > 0 && <span style={{ opacity:.6, marginLeft:'6px' }}>({score.total} guesses)</span>}
          </span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(260px, 360px) 1fr' }}>

        {/* Cover */}
        <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', background:'var(--bg-surface)' }}>
          {album.cover_url ? (
            <>
              {!imgLoaded && <div style={{ position:'absolute', inset:0, background:'var(--bg-surface)' }}/>}
              <img
                src={proxyUrl(album.cover_url)} alt="Album cover"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter: revealed ? 'none' : 'blur(28px) brightness(0.2)', transform: revealed ? 'scale(1)' : 'scale(1.15)', transition:'all 1s cubic-bezier(.16,1,.3,1)', opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div style={{ width:'100%', height:'100%', minHeight:'280px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-elevated)' }}>
              <span style={{ fontSize:'64px', opacity:.1 }}>◎</span>
            </div>
          )}
          {!revealed && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'72px', opacity:.4 }}>?</span>
            </div>
          )}
          {/* Show real rating bar on cover after lock */}
          {locked && !revealed && result && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px', background:'linear-gradient(to top, rgba(0,0,0,.9), transparent)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: result.color, fontWeight:700, textAlign:'center' }}>
                {result.label}
              </div>
            </div>
          )}
        </div>

        {/* Game panel */}
        <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'18px' }}>

          {/* Clues */}
          <div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'10px' }}>
              Your clues
            </p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'8px' }}>
              <span className="pill" style={{ fontSize:'12px' }}>{album.year}</span>
              <span className="pill" style={{ fontSize:'12px', textTransform:'capitalize' }}>{album.release_type}</span>
            </div>
            {album.genres?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                {album.genres.slice(0,3).map(g => (
                  <span key={g} className="pill" style={{ fontSize:'10px', borderColor:'rgba(168,85,247,.25)', background:'rgba(168,85,247,.07)', color:'var(--accent-hi)' }}>{g}</span>
                ))}
              </div>
            )}
          </div>

          {/* Slider guesser */}
          {!locked && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'6px' }}>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-sub)' }}>
                  Guess the RYM rating
                </p>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'24px', fontWeight:700, color:'var(--gold)' }}>
                  {guess.toFixed(2)}
                </span>
              </div>

              {/* Custom styled slider */}
              <div style={{ position:'relative', marginBottom:'8px' }}>
                <style>{`
                  .blind-slider { -webkit-appearance:none; width:100%; height:6px; border-radius:3px; background:linear-gradient(to right, var(--accent) 0%, var(--accent) ${((guess-2.5)/2.5)*100}%, var(--border-mid) ${((guess-2.5)/2.5)*100}%, var(--border-mid) 100%); outline:none; cursor:pointer; }
                  .blind-slider::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:var(--gold); border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,.4); cursor:pointer; }
                  .blind-slider::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:var(--gold); border:2px solid white; cursor:pointer; }
                `}</style>
                <input
                  type="range" min="2.5" max="5.0" step="0.01"
                  value={guess}
                  onChange={e => setGuess(parseFloat(e.target.value))}
                  className="blind-slider"
                />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)' }}>2.50</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)' }}>5.00</span>
                </div>
              </div>

              {/* Star preview */}
              <div style={{ display:'flex', gap:'2px', marginBottom:'16px' }}>
                {Array.from({length:5}).map((_,i) => {
                  const filled = guess / 5 * 5;
                  return (
                    <span key={i} style={{ color: i < Math.round(filled) ? 'var(--gold)' : 'var(--border-hi)', fontSize:'18px' }}>★</span>
                  );
                })}
              </div>

              <button onClick={handleLock}
                style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'14px', color:'white', background:'linear-gradient(135deg, #ec4899, #a855f7)', border:'none', borderRadius:'12px', padding:'12px 28px', cursor:'pointer', letterSpacing:'.06em' }}>
                Lock In My Guess →
              </button>
            </div>
          )}

          {/* After locking — show result */}
          {locked && result && !revealed && (
            <div className="anim-up">
              {/* Visual diff bar */}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>Your guess</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', fontWeight:700, color:'var(--gold)' }}>{guess.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>Actual rating</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', fontWeight:700, color: result.color }}>???</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>Points earned</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'14px', fontWeight:700, color: result.color }}>+{result.points}</span>
                </div>

                {/* Accuracy bar */}
                <div style={{ height:'6px', borderRadius:'3px', background:'var(--border-mid)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${accuracy}%`, background: result.color, borderRadius:'3px', transition:'width .5s ease' }}/>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: result.color, marginTop:'4px', textAlign:'right' }}>
                  {result.label}
                </div>
              </div>

              <button onClick={handleReveal}
                style={{ fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'16px', color:'white', background:'linear-gradient(135deg, #ec4899, #a855f7)', border:'none', borderRadius:'12px', padding:'12px 28px', cursor:'pointer', width:'100%' }}>
                ◐ Reveal Album & Rating
              </button>
            </div>
          )}

          {/* Revealed */}
          {revealed && result && (
            <div className="anim-up">
              <h2 style={{ fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'clamp(20px,3vw,32px)', letterSpacing:'-.02em', color:'var(--text)', marginBottom:'6px' }}>
                {album.title}
              </h2>
              <p style={{ fontFamily:'var(--font-inter)', fontWeight:600, fontSize:'clamp(14px,2vw,18px)', background:'linear-gradient(90deg, var(--accent-hi), var(--accent-pink))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'14px' }}>
                {album.artist}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'var(--bg-surface)', border:'1px solid var(--border-mid)', borderRadius:'10px', padding:'8px 14px' }}>
                  <span style={{ fontSize:'14px' }}>
                    {Array.from({length:5}).map((_,i) => <span key={i} style={{ color: i < Math.round(album.avg_rating) ? 'var(--gold)' : 'var(--border-hi)' }}>★</span>)}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'18px', color:'var(--gold)' }}>{album.avg_rating.toFixed(2)}</span>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: result.diff <= 0.1 ? 'var(--gold)' : 'var(--text-muted)' }}>
                  off by {result.diff.toFixed(2)}
                </div>
              </div>
              {album.spotify_id && (
                <a href={`https://open.spotify.com/album/${album.spotify_id}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily:'var(--font-mono)', fontSize:'12px', padding:'8px 20px', borderRadius:'99px', background:'#1DB954', color:'white', textDecoration:'none', letterSpacing:'.04em', display:'inline-block' }}>
                  ▶ Listen on Spotify
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}