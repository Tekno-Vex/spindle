'use client';
import { useMemo, useState, useCallback } from 'react';
import type { Album } from '@/types';
import AlbumCard from './AlbumCard';

interface Props {
  allAlbums: Album[];
  isHeard: (rank: number) => boolean;
  isFavorite: (rank: number) => boolean;
  isLoggedIn: boolean;
  onMarkHeard: (album: Album) => void;
  onToggleFavorite: (album: Album) => void;
  onOpenModal: (album: Album) => void;
}

const DECADES = [
  { label: '1950s', min: 1950, max: 1959, emoji: '🎷', desc: 'Birth of rock & roll, cool jazz' },
  { label: '1960s', min: 1960, max: 1969, emoji: '🌸', desc: 'Psychedelia, British invasion, soul' },
  { label: '1970s', min: 1970, max: 1979, emoji: '🕺', desc: 'Prog, punk, funk, disco' },
  { label: '1980s', min: 1980, max: 1989, emoji: '🎸', desc: 'Post-punk, metal, synth, hip-hop' },
  { label: '1990s', min: 1990, max: 1999, emoji: '📼', desc: 'Grunge, shoegaze, gangsta rap, IDM' },
  { label: '2000s', min: 2000, max: 2009, emoji: '💿', desc: 'Indie boom, emo, hyphy, metal extremes' },
  { label: '2010s', min: 2010, max: 2019, emoji: '📱', desc: 'Streaming era, cloud rap, hyperpop' },
  { label: '2020s', min: 2020, max: 2026, emoji: '🔮', desc: 'Post-pandemic music, new classics' },
];

export default function DecadeSafari({
  allAlbums, isHeard, isFavorite, isLoggedIn,
  onMarkHeard, onToggleFavorite, onOpenModal,
}: Props) {
  const [decadeIdx,    setDecadeIdx]    = useState(0);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [showAll,      setShowAll]      = useState(false); // toggle to include heard

  // Build pools per decade
  const decadePools = useMemo(() => {
    return DECADES.map(d => ({
      ...d,
      all: allAlbums
        .filter(a => a.year !== null && a.year >= d.min && a.year <= d.max)
        .sort((a, b) => a.rym_rank - b.rym_rank)
        .slice(0, 100),
    }));
  }, [allAlbums]);

  const getPool = useCallback((idx: number) => {
    const { all } = decadePools[idx];
    if (!isLoggedIn || showAll) return all;
    const unheard = all.filter(a => !isHeard(a.rym_rank));
    return unheard.length > 0 ? unheard : null; // null = exhausted
  }, [decadePools, isHeard, isLoggedIn, showAll]);

  const pickRandom = useCallback((idx: number): Album | null => {
    const pool = getPool(idx);
    if (!pool) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [getPool]);

  // Initialize on first render
  useMemo(() => {
    const picked = pickRandom(0);
    setCurrentAlbum(picked);
  }, []); // eslint-disable-line

  const goToDecade = (idx: number) => {
    setDecadeIdx(idx);
    setCurrentAlbum(pickRandom(idx));
  };

  const shuffle = () => {
    setCurrentAlbum(pickRandom(decadeIdx));
  };

  const currentDecade = DECADES[decadeIdx];
  const pool = getPool(decadeIdx);
  const isExhausted = pool === null;
  const totalInDecade = decadePools[decadeIdx].all.length;
  const unheardCount  = isLoggedIn
    ? decadePools[decadeIdx].all.filter(a => !isHeard(a.rym_rank)).length
    : totalInDecade;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'4px' }}>
            Decade Safari
          </p>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
            {currentDecade.desc}
          </p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => { setShowAll(s => !s); setTimeout(() => setCurrentAlbum(pickRandom(decadeIdx)), 10); }}
            className={`pill ${showAll ? 'active' : ''}`}
            style={{ cursor:'pointer', fontSize:'10px', flexShrink:0 }}
          >
            {showAll ? 'All albums' : 'Unheard only'}
          </button>
        )}
      </div>

      {/* Decade tabs */}
      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'16px' }}>
        {DECADES.map((d, i) => {
          const dPool = getPool(i);
          const exhausted = dPool === null;
          return (
            <button
              key={d.label}
              onClick={() => goToDecade(i)}
              className={`pill ${i === decadeIdx ? 'active' : ''}`}
              style={{
                fontSize:'11px', cursor:'pointer',
                opacity: exhausted ? 0.4 : 1,
                position:'relative',
              }}
              title={exhausted ? `All ${decadePools[i].all.length} albums heard` : `${decadePools[i].all.length} albums`}
            >
              {d.emoji} {d.label}
              {exhausted && <span style={{ marginLeft:'4px', fontSize:'9px' }}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Current decade info */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontFamily:'var(--font-playfair)', fontSize:'20px', fontWeight:700, color:'var(--text)' }}>
            {currentDecade.emoji} {currentDecade.label}
          </span>
          {isLoggedIn && !showAll && (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
              {unheardCount} unheard of {totalInDecade}
            </span>
          )}
        </div>
        {!isExhausted && (
          <button onClick={shuffle} className="pill" style={{ cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}>
            ⟳ Shuffle
          </button>
        )}
      </div>

      {/* Exhausted state */}
      {isExhausted ? (
        <div style={{ textAlign:'center', padding:'48px 24px', borderRadius:'20px', border:'1px dashed var(--border-mid)', background:'var(--bg-card)' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎉</div>
          <p style={{ fontFamily:'var(--font-playfair)', fontSize:'22px', color:'var(--text-sub)', marginBottom:'8px' }}>
            You've heard all the {currentDecade.label} picks!
          </p>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>
            {totalInDecade} albums conquered in this decade
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="pill active"
            style={{ cursor:'pointer', fontSize:'12px' }}
          >
            Show all {currentDecade.label} albums anyway
          </button>
        </div>
      ) : currentAlbum ? (
        <div onClick={() => onOpenModal(currentAlbum)} style={{ cursor:'pointer' }}>
          <AlbumCard
            album={currentAlbum}
            isNew={false}
            isHeard={isHeard(currentAlbum.rym_rank)}
            isFavorite={isFavorite(currentAlbum.rym_rank)}
            isLoggedIn={isLoggedIn}
            onMarkHeard={() => onMarkHeard(currentAlbum)}
            onToggleFavorite={() => onToggleFavorite(currentAlbum)}
          />
        </div>
      ) : null}

      {/* Navigation */}
      {!isExhausted && (
        <div style={{ display:'flex', gap:'10px', marginTop:'14px', justifyContent:'space-between' }}>
          <button
            onClick={() => goToDecade(Math.max(0, decadeIdx - 1))}
            disabled={decadeIdx === 0}
            className="pill"
            style={{ cursor: decadeIdx === 0 ? 'not-allowed' : 'pointer', opacity: decadeIdx === 0 ? .3 : 1, fontSize:'11px' }}
          >
            ← {decadeIdx > 0 ? DECADES[decadeIdx-1].label : 'Back'}
          </button>
          <button
            onClick={() => goToDecade(Math.min(DECADES.length-1, decadeIdx+1))}
            disabled={decadeIdx === DECADES.length-1}
            className="pill"
            style={{ cursor: decadeIdx === DECADES.length-1 ? 'not-allowed' : 'pointer', opacity: decadeIdx === DECADES.length-1 ? .3 : 1, fontSize:'11px' }}
          >
            {decadeIdx < DECADES.length-1 ? DECADES[decadeIdx+1].label : 'Next'} →
          </button>
        </div>
      )}
    </div>
  );
}