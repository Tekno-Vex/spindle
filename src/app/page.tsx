'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
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

const GENRE_FAMILIES: { label: string; color: string; genres: string[] }[] = [
  {
    label: 'Rock',
    color: '#f472b6',
    genres: [
      'Progressive Rock','Art Rock','Psychedelic Rock','Hard Rock','Blues Rock',
      'Alternative Rock','Indie Rock','Post-Rock','Noise Rock','Experimental Rock',
      'Glam Rock','Krautrock','Heavy Psych','Space Rock','Garage Rock','Grunge',
      'Post-Punk','Art Punk','Punk Rock','Power Pop','Jangle Pop','Slacker Rock',
      'Indie Pop','Shoegaze','Dream Pop','Math Rock','Slowcore',
      'Post-Hardcore','Hardcore Punk','Emo','Midwest Emo','Screamo',
      'Space Rock Revival','Neo-Psychedelia','Post-Punk Revival',
    ],
  },
  {
    label: 'Metal',
    color: '#ef4444',
    genres: [
      'Heavy Metal','Death Metal','Black Metal','Thrash Metal','Doom Metal',
      'Progressive Metal','Technical Death Metal','Avant-Garde Metal',
      'Atmospheric Black Metal','Sludge Metal','Death Doom Metal',
      'Melodic Death Metal','Melodic Black Metal','Alternative Metal',
      'Post-Metal','Speed Metal','Brutal Death Metal','Gothic Metal',
      'Metalcore','Mathcore','US Power Metal','Power Metal',
      'Viking Metal','Technical Thrash Metal',
    ],
  },
  {
    label: 'Hip Hop',
    color: '#a855f7',
    genres: [
      'Conscious Hip Hop','Boom Bap','Jazz Rap','Experimental Hip Hop',
      'Hardcore Hip Hop','Abstract Hip Hop','Instrumental Hip Hop',
      'Gangsta Rap','Political Hip Hop','Horrorcore','Industrial Hip Hop',
      'Cloud Rap','Glitch Hop','Pop Rap','Hip Hop','Plunderphonics',
      'Turntablism','Drumless',
    ],
  },
  {
    label: 'Jazz',
    color: '#f59e0b',
    genres: [
      'Post-Bop','Avant-Garde Jazz','Jazz Fusion','Jazz-Rock','Hard Bop',
      'Spiritual Jazz','Free Jazz','Modal Jazz','Cool Jazz','Vocal Jazz',
      'Jazz-Funk','Soul Jazz','Chamber Jazz','Latin Jazz','Big Band',
      'Third Stream','Experimental Big Band','Flamenco Jazz',
    ],
  },
  {
    label: 'Electronic',
    color: '#22d3ee',
    genres: [
      'Ambient','Electronic','Synthpop','IDM','Downtempo','Trip Hop',
      'Progressive Electronic','Electropop','Dark Ambient','Drone',
      'Noise','Glitch','Indietronica','Dance-Pop','Alternative Dance',
      'Ambient Techno','Space Ambient','New Age','Neoclassical New Age',
      'Glitch Pop','Post-Industrial','Industrial Rock','Electro-Industrial',
      'Sound Collage','Tape Music','Folktronica','Ambient Pop',
    ],
  },
  {
    label: 'Classical',
    color: '#34d399',
    genres: [
      'Modern Classical','Orchestral Music','Romanticism','Cinematic Classical',
      'Chamber Music','Minimalism','Baroque Music','Impressionism',
      'Symphony','Post-Minimalism','Choral','Film Score','Classical Period',
      'Concerto','Baroque Pop','Chamber Pop',
    ],
  },
  {
    label: 'Folk & Country',
    color: '#fb923c',
    genres: [
      'Singer-Songwriter','Contemporary Folk','Folk Rock','Psychedelic Folk',
      'Progressive Folk','Avant-Folk','Chamber Folk','Indie Folk',
      'Alt-Country','Country Rock','Country Folk','Americana',
      'Appalachian Folk Music','British Folk Music',
    ],
  },
  {
    label: 'Soul & R&B',
    color: '#e879f9',
    genres: [
      'Progressive Soul','Neo-Soul','Smooth Soul','Psychedelic Soul',
      'Pop Soul','Soul','Funk','Jazz-Funk','Rhythm & Blues',
      'Contemporary R&B','Alternative R&B','Synth Funk',
      'Southern Soul','Electric Blues',
    ],
  },
  {
    label: 'Pop & Art Pop',
    color: '#60a5fa',
    genres: [
      'Art Pop','Progressive Pop','Pop Rock','Baroque Pop','Psychedelic Pop',
      'Sophisti-Pop','Ambient Pop','Chamber Pop','Indie Pop',
      'Power Pop','Dance-Pop','Folk Pop','Jazz Pop','Piano Rock',
      'Soft Rock','Glam Rock',
    ],
  },
  {
    label: 'World & Latin',
    color: '#4ade80',
    genres: [
      'MPB','Bossa nova','Samba','Samba-jazz','Latin Jazz',
      'Ethio-Jazz','Afro-Cuban Jazz','Latin Alternative',
      'Roots Reggae','Dub','Chanson à texte','Nueva canción latinoamericana',
    ],
  },
  {
    label: 'Video Game & Film',
    color: '#94a3b8',
    genres: [
      'Video Game Music','Film Score','Television Music',
      'Cinematic Classical','Sequencer & Tracker',
    ],
  },
];

export default function Home() {
  const [current,     setCurrent]    = useState<Album|null>(null);
  const [isRolling,   setRolling]    = useState(false);
  const [selYear,     setSelYear]    = useState<number|null>(null);
  const [selGenres,   setSelGenres]  = useState<Set<string>>(new Set());
  const [history,     setHistory]    = useState<Album[]>([]);
  const [histIdx,     setHistIdx]    = useState(-1);
  const [rolled,      setRolled]     = useState(0);
  const [cardKey,     setCardKey]    = useState(0);
  const [openFamily,  setOpenFamily] = useState<string|null>(null);

  const pool = useMemo(() => {
    let result = allAlbums;
    if (selYear)            result = result.filter(a => a.year === selYear);
    if (selGenres.size > 0) result = result.filter(a => a.genres?.some(g => selGenres.has(g)));
    return result;
  }, [selYear, selGenres]);

  const toggleGenre = (genre: string) => {
    setSelGenres(prev => {
      const next = new Set(prev);
      next.has(genre) ? next.delete(genre) : next.add(genre);
      return next;
    });
  };

  const selectFamily = (family: typeof GENRE_FAMILIES[0]) => {
    setSelGenres(new Set(family.genres));
  };

  const clearAllFilters = () => { setSelYear(null); setSelGenres(new Set()); };

  const roll = useCallback(() => {
    if (isRolling || !pool.length) return;
    setRolling(true); setCurrent(null);
    setTimeout(() => {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(picked);
      setRolling(false);
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
    if (histIdx > 0) { const i=histIdx-1; setHistIdx(i); setCurrent(history[i]); setCardKey(k=>k+1); }
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

  const hasFilters = selYear !== null || selGenres.size > 0;

  return (
    <main style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 48px 40px' }}>

        <Masthead totalAlbums={allAlbums.length} rolledCount={rolled}/>

        <div className="desktop-grid" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'40px', alignItems:'start' }}>

          {/* ── Left column ── */}
          <div style={{ position:'sticky', top:'24px', maxHeight:'calc(100vh - 48px)', overflowY:'auto', paddingRight:'4px' }}>

            <YearTimeline selectedYear={selYear} onYearSelect={setSelYear} yearCounts={yearCounts}/>

            {/* Genre filter */}
            <div style={{
              background:'var(--bg-card)',
              border:'1px solid var(--border-mid)',
              borderRadius:'20px',
              padding:'16px',
              marginBottom:'16px',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
                  Filter by genre
                  {selGenres.size > 0 && (
                    <span style={{ marginLeft:'8px', background:'var(--accent)', color:'white', borderRadius:'99px', padding:'1px 8px', fontSize:'10px' }}>
                      {selGenres.size}
                    </span>
                  )}
                </span>
                {selGenres.size > 0 && (
                  <button onClick={() => setSelGenres(new Set())}
                    style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--accent-hi)', background:'none', border:'none', cursor:'pointer' }}>
                    Clear ×
                  </button>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {GENRE_FAMILIES.map(family => {
                  const isOpen      = openFamily === family.label;
                  const activeCount = family.genres.filter(g => selGenres.has(g)).length;

                  return (
                    <div key={family.label}>
                      <div
                        onClick={() => setOpenFamily(isOpen ? null : family.label)}
                        style={{
                          width:'100%', display:'flex', alignItems:'center',
                          justifyContent:'space-between',
                          padding:'8px 12px', borderRadius:'10px',
                          border:`1px solid ${activeCount > 0 ? family.color : isOpen ? 'var(--border-hi)' : 'var(--border-mid)'}`,
                          background: activeCount > 0
                            ? `${family.color}15`
                            : isOpen ? 'var(--bg-surface)' : 'transparent',
                          cursor:'pointer', transition:'all .15s',
                        }}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: family.color, flexShrink:0 }}/>
                          <span style={{
                            fontFamily:'var(--font-mono)', fontSize:'11px',
                            color: activeCount > 0 ? family.color : isOpen ? 'var(--text)' : 'var(--text-sub)',
                            letterSpacing:'.04em',
                          }}>
                            {family.label}
                          </span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          {activeCount > 0 && (
                            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: family.color }}>
                              {activeCount}
                            </span>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); selectFamily(family); }}
                            style={{
                              fontFamily:'var(--font-mono)', fontSize:'9px',
                              color:'var(--text-muted)', background:'none',
                              border:'1px solid var(--border)', borderRadius:'4px',
                              padding:'2px 6px', cursor:'pointer',
                            }}
                          >
                            all
                          </button>
                          <span style={{ color:'var(--text-muted)', fontSize:'10px', transform: isOpen ? 'rotate(180deg)' : 'none', display:'inline-block', transition:'transform .2s' }}>▾</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="anim-up" style={{
                          display:'flex', flexWrap:'wrap', gap:'4px',
                          padding:'8px 10px 4px',
                        }}>
                          {family.genres.map(genre => (
                            <button
                              key={genre}
                              onClick={() => toggleGenre(genre)}
                              className={`pill ${selGenres.has(genre) ? 'active' : ''}`}
                              style={{
                                fontSize:'10px', padding:'3px 9px',
                                ...(selGenres.has(genre) ? { borderColor: family.color, color: family.color, background:`${family.color}15` } : {}),
                              }}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active filter summary */}
            {hasFilters && (
              <div className="anim-up" style={{
                background:'rgba(168,85,247,.06)',
                border:'1px solid rgba(168,85,247,.2)',
                borderRadius:'14px', padding:'12px 16px',
                marginBottom:'16px',
                fontFamily:'var(--font-mono)', fontSize:'12px',
                color:'var(--accent-hi)',
              }}>
                <div style={{ marginBottom:'4px', fontWeight:600 }}>
                  ✦ {pool.length.toLocaleString()} albums in pool
                </div>
                {selYear && <div style={{ opacity:.7, fontSize:'11px' }}>Year: {selYear}</div>}
                {selGenres.size > 0 && (
                  <div style={{ opacity:.7, fontSize:'11px', marginTop:'2px' }}>
                    {selGenres.size} genre{selGenres.size > 1 ? 's' : ''} selected
                  </div>
                )}
                <button onClick={clearAllFilters}
                  style={{ marginTop:'8px', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Clear all filters →
                </button>
              </div>
            )}

            <RollButton onClick={roll} isRolling={isRolling} poolSize={pool.length}/>

            {history.length > 1 && (
              <div className="anim-up" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'12px' }}>
                <button onClick={goBack} disabled={histIdx<=0} className="pill"
                  style={{ cursor:histIdx<=0?'not-allowed':'pointer', opacity:histIdx<=0?.3:1, fontSize:'11px' }}>
                  ← Back
                </button>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
                  {histIdx+1} / {history.length}
                </span>
                <button onClick={goFwd} disabled={histIdx>=history.length-1} className="pill"
                  style={{ cursor:histIdx>=history.length-1?'not-allowed':'pointer', opacity:histIdx>=history.length-1?.3:1, fontSize:'11px' }}>
                  Forward →
                </button>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div>
            <SlotAnimation isRolling={isRolling} albumTitles={allTitles}/>

            {current && !isRolling && (
              <div key={cardKey}><AlbumCard album={current} isNew/></div>
            )}

            {!current && !isRolling && (
              <div style={{
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                minHeight:'calc(100vh - 200px)', borderRadius:'24px',
                border:'1px dashed var(--border-mid)', background:'var(--bg-card)',
              }}>
                <div style={{ fontSize:'72px', opacity:.08, marginBottom:'24px' }}>◎</div>
                <p style={{ fontFamily:'var(--font-playfair)', fontSize:'28px', color:'var(--text-sub)', marginBottom:'12px' }}>
                  Your next favourite album is waiting
                </p>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  Press Roll or hit Space to begin
                </p>
              </div>
            )}
          </div>
        </div>

        <footer style={{ marginTop:'40px', paddingTop:'20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
            Spindle · {allAlbums.length.toLocaleString()} Albums · Rate Your Music
          </p>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', opacity:.5 }}>
            ← → history · Space to roll
          </p>
        </footer>

      </div>
    </main>
  );
}