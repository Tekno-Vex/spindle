'use client';
import { useState, useEffect, useCallback } from 'react';
import albumsData from '@/data/albums.json';
import type { Album } from '@/types';
import Masthead      from '@/components/Masthead';
import AlbumCard     from '@/components/AlbumCard';
import RollButton    from '@/components/RollButton';
import SlotAnimation from '@/components/SlotAnimation';
import YearTimeline  from '@/components/YearTimeline';

const allAlbums = albumsData as Album[];

const yearCounts: Record<number,number> = {};
allAlbums.forEach(a => { if (a.year) yearCounts[a.year] = (yearCounts[a.year]||0)+1; });

const allTitles = allAlbums.map(a => a.title);

export default function Home() {
  const [current,      setCurrent]     = useState<Album|null>(null);
  const [isRolling,    setIsRolling]   = useState(false);
  const [selectedYear, setYear]        = useState<number|null>(null);
  const [history,      setHistory]     = useState<Album[]>([]);
  const [histIdx,      setHistIdx]     = useState(-1);
  const [rolled,       setRolled]      = useState(0);
  const [cardKey,      setCardKey]     = useState(0);

  const pool = selectedYear ? allAlbums.filter(a => a.year === selectedYear) : allAlbums;

  const roll = useCallback(() => {
    if (isRolling || !pool.length) return;
    setIsRolling(true); setCurrent(null);
    setTimeout(() => {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(picked);
      setIsRolling(false);
      setRolled(c => c+1);
      setCardKey(k => k+1);
      setHistory(prev => {
        const next = [...prev.slice(0, histIdx+1), picked];
        setHistIdx(next.length-1);
        return next;
      });
    }, 1500);
  }, [isRolling, pool, histIdx]);

  const goBack = useCallback(() => {
    if (histIdx > 0) { const i = histIdx-1; setHistIdx(i); setCurrent(history[i]); setCardKey(k=>k+1); }
  }, [histIdx, history]);

  const goFwd = useCallback(() => {
    if (histIdx < history.length-1) { const i=histIdx+1; setHistIdx(i); setCurrent(history[i]); setCardKey(k=>k+1); }
  }, [histIdx, history]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code==='Space')      { e.preventDefault(); roll(); }
      if (e.code==='ArrowLeft')  goBack();
      if (e.code==='ArrowRight') goFwd();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [roll, goBack, goFwd]);

  return (
    <main style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'0 24px 100px' }}>

        <Masthead totalAlbums={allAlbums.length} rolledCount={rolled}/>

        <YearTimeline selectedYear={selectedYear} onYearSelect={setYear} yearCounts={yearCounts}/>

        {/* Roll + history */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'20px', margin:'48px 0' }}>
          <RollButton onClick={roll} isRolling={isRolling} poolSize={pool.length}/>

          {history.length > 1 && (
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <button
                onClick={goBack} disabled={histIdx<=0}
                className="pill" style={{ cursor: histIdx<=0 ? 'not-allowed' : 'pointer', opacity: histIdx<=0 ? .3 : 1 }}
              >← Back</button>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
                {histIdx+1} / {history.length}
              </span>
              <button
                onClick={goFwd} disabled={histIdx>=history.length-1}
                className="pill" style={{ cursor: histIdx>=history.length-1 ? 'not-allowed':'pointer', opacity: histIdx>=history.length-1 ? .3:1 }}
              >Forward →</button>
            </div>
          )}
        </div>

        {/* Slot */}
        <SlotAnimation isRolling={isRolling} albumTitles={allTitles}/>

        {/* Card */}
        {current && !isRolling && (
          <div key={cardKey}><AlbumCard album={current} isNew/></div>
        )}

        {/* Empty state */}
        {!current && !isRolling && (
          <div style={{
            textAlign:'center', padding:'80px 24px',
            border:'1px dashed var(--border-mid)',
            borderRadius:'24px',
            background:'var(--bg-card)',
          }}>
            <div style={{ fontSize:'56px', opacity:.1, marginBottom:'20px' }}>◎</div>
            <p style={{ fontFamily:'var(--font-playfair)', fontSize:'22px', color:'var(--text-sub)', marginBottom:'10px' }}>
              Your next favourite album is waiting
            </p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', letterSpacing:'.08em' }}>
              PRESS ROLL OR HIT SPACE TO BEGIN
            </p>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop:'80px', paddingTop:'28px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--text-muted)' }}>
            Spindle · {allAlbums.length.toLocaleString()} Albums · Rate Your Music
          </p>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', opacity:.4, marginTop:'6px' }}>
            ← → navigate history · Space to roll
          </p>
        </footer>

      </div>
    </main>
  );
}