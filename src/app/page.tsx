'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import albumsData from '@/data/albums.json';
import type { Album } from '@/types';
import Masthead        from '@/components/Masthead';
import AlbumCard       from '@/components/AlbumCard';
import RollButton      from '@/components/RollButton';
import SlotAnimation   from '@/components/SlotAnimation';
import AlbumModal      from '@/components/AlbumModal';
import YearRangeFilter from '@/components/YearRangeFilter';
import RatingFilter    from '@/components/RatingFilter';
import SearchBar       from '@/components/SearchBar';
import UserMenu        from '@/components/UserMenu';
import StatsDashboard  from '@/components/StatsDashboard';
import ModesBar, { type Mode } from '@/components/ModesBar';
import BlindMode       from '@/components/BlindMode';
import VersusMode      from '@/components/VersusMode';
import DecadeSafari    from '@/components/DecadeSafari';
import { useUser }     from '@/hooks/useUser';
import { useUserData } from '@/hooks/useUserData';
import LiveFeed        from '@/components/LiveFeed';

const allAlbums = albumsData as Album[];
const allTitles = allAlbums.map(a => a.title);

const ABSOLUTE_MIN_YEAR = 1950;
const ABSOLUTE_MAX_YEAR = 2026;

const GENRE_FAMILIES: { label: string; color: string; genres: string[] }[] = [
  { label: 'Rock', color: '#f472b6', genres: ['Progressive Rock','Art Rock','Psychedelic Rock','Hard Rock','Blues Rock','Alternative Rock','Indie Rock','Post-Rock','Noise Rock','Experimental Rock','Glam Rock','Krautrock','Heavy Psych','Space Rock','Garage Rock','Grunge','Post-Punk','Art Punk','Punk Rock','Power Pop','Jangle Pop','Slacker Rock','Indie Pop','Shoegaze','Dream Pop','Math Rock','Slowcore','Post-Hardcore','Hardcore Punk','Emo','Midwest Emo','Screamo','Space Rock Revival','Neo-Psychedelia','Post-Punk Revival'] },
  { label: 'Metal', color: '#ef4444', genres: ['Heavy Metal','Death Metal','Black Metal','Thrash Metal','Doom Metal','Progressive Metal','Technical Death Metal','Avant-Garde Metal','Atmospheric Black Metal','Sludge Metal','Death Doom Metal','Melodic Death Metal','Melodic Black Metal','Alternative Metal','Post-Metal','Speed Metal','Brutal Death Metal','Gothic Metal','Metalcore','Mathcore','US Power Metal','Power Metal','Viking Metal','Technical Thrash Metal'] },
  { label: 'Hip Hop', color: '#a855f7', genres: ['Conscious Hip Hop','Boom Bap','Jazz Rap','Experimental Hip Hop','Hardcore Hip Hop','Abstract Hip Hop','Instrumental Hip Hop','Gangsta Rap','Political Hip Hop','Horrorcore','Industrial Hip Hop','Cloud Rap','Glitch Hop','Pop Rap','Hip Hop','Plunderphonics','Turntablism','Drumless'] },
  { label: 'Jazz', color: '#f59e0b', genres: ['Post-Bop','Avant-Garde Jazz','Jazz Fusion','Jazz-Rock','Hard Bop','Spiritual Jazz','Free Jazz','Modal Jazz','Cool Jazz','Vocal Jazz','Jazz-Funk','Soul Jazz','Chamber Jazz','Latin Jazz','Big Band','Third Stream','Experimental Big Band','Flamenco Jazz'] },
  { label: 'Electronic', color: '#22d3ee', genres: ['Ambient','Electronic','Synthpop','IDM','Downtempo','Trip Hop','Progressive Electronic','Electropop','Dark Ambient','Drone','Noise','Glitch','Indietronica','Dance-Pop','Alternative Dance','Ambient Techno','Space Ambient','New Age','Neoclassical New Age','Glitch Pop','Post-Industrial','Industrial Rock','Electro-Industrial','Sound Collage','Tape Music','Folktronica','Ambient Pop'] },
  { label: 'Classical', color: '#34d399', genres: ['Modern Classical','Orchestral Music','Romanticism','Cinematic Classical','Chamber Music','Minimalism','Baroque Music','Impressionism','Symphony','Post-Minimalism','Choral','Film Score','Classical Period','Concerto','Baroque Pop','Chamber Pop'] },
  { label: 'Folk & Country', color: '#fb923c', genres: ['Singer-Songwriter','Contemporary Folk','Folk Rock','Psychedelic Folk','Progressive Folk','Avant-Folk','Chamber Folk','Indie Folk','Alt-Country','Country Rock','Country Folk','Americana','Appalachian Folk Music','British Folk Music'] },
  { label: 'Soul & R&B', color: '#e879f9', genres: ['Progressive Soul','Neo-Soul','Smooth Soul','Psychedelic Soul','Pop Soul','Soul','Funk','Jazz-Funk','Rhythm & Blues','Contemporary R&B','Alternative R&B','Synth Funk','Southern Soul','Electric Blues'] },
  { label: 'Pop', color: '#60a5fa', genres: ['Art Pop','Progressive Pop','Pop Rock','Baroque Pop','Psychedelic Pop','Sophisti-Pop','Ambient Pop','Chamber Pop','Indie Pop','Power Pop','Dance-Pop','Folk Pop','Jazz Pop','Piano Rock','Soft Rock','Glam Rock'] },
  { label: 'World & Latin', color: '#4ade80', genres: ['MPB','Bossa nova','Samba','Samba-jazz','Latin Jazz','Ethio-Jazz','Afro-Cuban Jazz','Latin Alternative','Roots Reggae','Dub','Chanson à texte','Nueva canción latinoamericana'] },
  { label: 'Video Game & Film', color: '#94a3b8', genres: ['Video Game Music','Film Score','Television Music','Cinematic Classical','Sequencer & Tracker'] },
];

function getInitialFilters() {
  if (typeof window === 'undefined') return { minYear: ABSOLUTE_MIN_YEAR, maxYear: ABSOLUTE_MAX_YEAR, genres: new Set<string>(), minRating: 0 };
  const p = new URLSearchParams(window.location.search);
  return {
    minYear:   parseInt(p.get('minYear')  || String(ABSOLUTE_MIN_YEAR)),
    maxYear:   parseInt(p.get('maxYear')  || String(ABSOLUTE_MAX_YEAR)),
    genres:    new Set<string>(p.get('genres') ? p.get('genres')!.split(',').filter(Boolean) : []),
    minRating: parseFloat(p.get('rating') || '0'),
  };
}

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'standard';
  return (new URLSearchParams(window.location.search).get('mode') as Mode) || 'standard';
}

export default function Home() {
  const initial = useMemo(() => getInitialFilters(), []);

  const [current,       setCurrent]      = useState<Album|null>(null);
  const [isRolling,     setRolling]      = useState(false);
  const [minYear,       setMinYear]      = useState(initial.minYear);
  const [maxYear,       setMaxYear]      = useState(initial.maxYear);
  const [selGenres,     setSelGenres]    = useState<Set<string>>(initial.genres);
  const [minRating,     setMinRating]    = useState(initial.minRating);
  const [history,       setHistory]      = useState<Album[]>([]);
  const [histIdx,       setHistIdx]      = useState(-1);
  const [rolled,        setRolled]       = useState(0);
  const [cardKey,       setCardKey]      = useState(0);
  const [openFamily,    setOpenFamily]   = useState<string|null>(null);
  const [modalAlbum,    setModalAlbum]   = useState<Album|null>(null);
  const [genreMode,     setGenreMode]    = useState<'any'|'all'>('any');
  const [showDashboard, setShowDashboard]= useState(false);
  const [excludeHeard,  setExcludeHeard] = useState(true);
  const [activeMode,    setActiveMode]   = useState<Mode>(getInitialMode);
  const [blindAlbum,    setBlindAlbum]   = useState<Album|null>(null);
  const [versusA,       setVersusA]      = useState<Album|null>(null);
  const [versusB,       setVersusB]      = useState<Album|null>(null);
  const [blindScore, setBlindScore] = useState({ points: 0, total: 0, streak: 0 });
  const [showFeed,      setShowFeed]     = useState(false);

  const { user, loading: userLoading } = useUser();
  const { heard, favorites, heardList, favoritesList, rollHistory, markHeard, toggleFavorite, addToHistory } = useUserData(user);

  const pool = useMemo(() => {
    let result = allAlbums;
    if (minYear !== ABSOLUTE_MIN_YEAR || maxYear !== ABSOLUTE_MAX_YEAR) {
      result = result.filter(a => a.year !== null && a.year >= minYear && a.year <= maxYear);
    }
    if (selGenres.size > 0) {
      if (genreMode === 'all') {
        result = result.filter(a => Array.from(selGenres).every(g => a.genres?.includes(g)));
      } else {
        result = result.filter(a => a.genres?.some(g => selGenres.has(g)));
      }
    }
    if (minRating > 0) result = result.filter(a => a.avg_rating >= minRating);
    if (user && excludeHeard && heard.size > 0) result = result.filter(a => !heard.has(a.rym_rank));
    return result;
  }, [minYear, maxYear, selGenres, minRating, genreMode, user, excludeHeard, heard]);

  // Sync filters + mode to URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (minYear !== ABSOLUTE_MIN_YEAR)  p.set('minYear', String(minYear));
    if (maxYear !== ABSOLUTE_MAX_YEAR)  p.set('maxYear', String(maxYear));
    if (selGenres.size > 0)             p.set('genres', Array.from(selGenres).join(','));
    if (minRating > 0)                  p.set('rating', String(minRating));
    if (activeMode !== 'standard')      p.set('mode', activeMode);
    const str = p.toString();
    window.history.replaceState({}, '', str ? `/?${str}` : '/');
  }, [minYear, maxYear, selGenres, minRating, activeMode]);

  const toggleGenre = (genre: string) => {
    setSelGenres(prev => { const next = new Set(prev); next.has(genre) ? next.delete(genre) : next.add(genre); return next; });
  };
  const selectFamily = (family: typeof GENRE_FAMILIES[0]) => { setSelGenres(new Set(family.genres)); };
  const clearAllFilters = () => { setMinYear(ABSOLUTE_MIN_YEAR); setMaxYear(ABSOLUTE_MAX_YEAR); setSelGenres(new Set()); setMinRating(0); };

  const pickRandom = useCallback((source: Album[]): Album => {
    return source[Math.floor(Math.random() * source.length)];
  }, []);

  const roll = useCallback((overridePool?: Album[]) => {
    const source = overridePool || pool;
    if (isRolling || !source.length) return;

    if (activeMode === 'blind') {
      const picked = pickRandom(source);
      setBlindAlbum(picked);
      setCardKey(k => k+1);
      addToHistory(picked);
      setRolled(c => c+1);
      return;
    }

    if (activeMode === 'versus') {
      const a = pickRandom(source);
      let b = pickRandom(source);
      while (b.rym_rank === a.rym_rank && source.length > 1) b = pickRandom(source);
      setVersusA(a);
      setVersusB(b);
      setCardKey(k => k+1);
      setRolled(c => c+1);
      return;
    }

    setRolling(true); setCurrent(null);
    setTimeout(() => {
      const picked = pickRandom(source);
      setCurrent(picked);
      setRolling(false);
      setRolled(c => c+1);
      setCardKey(k => k+1);
      setHistory(prev => {
        const next = [...prev.slice(0, histIdx+1), picked];
        setHistIdx(next.length-1);
        return next;
      });
      addToHistory(picked);
      window.history.replaceState({}, '', `/?album=${picked.rym_rank}`);
    }, 1500);
  }, [isRolling, pool, histIdx, addToHistory, activeMode, pickRandom]);

  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
    setCurrent(null);
    setBlindAlbum(null);
    setVersusA(null);
    setVersusB(null);
  };

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

  useEffect(() => {
    const fn = (e: Event) => { setModalAlbum((e as CustomEvent).detail as Album); };
    window.addEventListener('spindle:openAlbum', fn);
    return () => window.removeEventListener('spindle:openAlbum', fn);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rankStr = params.get('album');
    if (rankStr) {
      const found = allAlbums.find(a => a.rym_rank === parseInt(rankStr));
      if (found) { setCurrent(found); setModalAlbum(found); }
    }
  }, []);

  const hasFilters = minYear !== ABSOLUTE_MIN_YEAR || maxYear !== ABSOLUTE_MAX_YEAR || selGenres.size > 0 || minRating > 0;
  const activeFilterCount = (minYear !== ABSOLUTE_MIN_YEAR || maxYear !== ABSOLUTE_MAX_YEAR ? 1 : 0) + (selGenres.size > 0 ? 1 : 0) + (minRating > 0 ? 1 : 0);

  // Render right column content based on mode
  const renderRightColumn = () => {
    if (activeMode === 'blind') {
      return (
        <div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px' }}>
            <button
              onClick={() => roll()}
              style={{ fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'20px', color:'white', letterSpacing:'.04em', background:'linear-gradient(135deg, #ec4899, #a855f7)', border:'none', borderRadius:'16px', padding:'16px 48px', cursor:'pointer', boxShadow:'0 0 32px rgba(236,72,153,.3)' }}
            >
              ◐ Draw Blind
            </button>
          </div>
          {blindAlbum && (
            <div key={cardKey}>
              <BlindMode
                album={blindAlbum}
                isNew={true}
                score={blindScore}
                onScore={points => setBlindScore(prev => ({
                  points: prev.points + points,
                  total: prev.total + 1,
                  streak: points >= 60 ? prev.streak + 1 : 0,
                }))}
                onReveal={() => setModalAlbum(blindAlbum)}
              />
            </div>
          )}
          {!blindAlbum && <EmptyState message="Draw a blind album — guess the rating before you reveal"/>}
        </div>
      );
    }

    if (activeMode === 'versus') {
      return (
        <VersusMode
          pool={pool}
          onChampion={album => { setCurrent(album); setModalAlbum(album); }}
          onReset={() => setCurrent(null)}
        />
      );
    }

    if (activeMode === 'safari') {
      return (
        <DecadeSafari
          allAlbums={allAlbums}
          isHeard={rank => heard.has(rank)}
          isFavorite={rank => favorites.has(rank)}
          isLoggedIn={!!user}
          onMarkHeard={markHeard}
          onToggleFavorite={toggleFavorite}
          onOpenModal={setModalAlbum}
        />
      );
    }

    // Standard mode
    return (
      <div>
        <SlotAnimation isRolling={isRolling} albumTitles={allTitles}/>
        {current && !isRolling && (
          <div key={cardKey} onClick={() => setModalAlbum(current)} style={{ cursor: 'pointer' }}>
            <AlbumCard
              album={current} isNew
              isHeard={heard.has(current.rym_rank)}
              isFavorite={favorites.has(current.rym_rank)}
              isLoggedIn={!!user}
              onMarkHeard={() => markHeard(current)}
              onToggleFavorite={() => toggleFavorite(current)}
            />
          </div>
        )}
        {!current && !isRolling && (
          <EmptyState message="Press Roll or hit Space to begin"/>
        )}
      </div>
    );
  };

  return (
    <main style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 clamp(16px, 4vw, 48px) 40px' }}>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <Masthead totalAlbums={allAlbums.length} rolledCount={rolled}/>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', paddingTop:'24px' }}>
            <UserMenu user={user} loading={userLoading} onShowDashboard={() => setShowDashboard(true)}/>
            {user && heard.size > 0 && (
              <button
                onClick={() => setExcludeHeard(e => !e)}
                style={{
                  fontFamily:'var(--font-mono)', fontSize:'10px',
                  padding:'4px 12px', borderRadius:'99px',
                  border:`1px solid ${excludeHeard ? 'var(--accent)' : 'var(--border-mid)'}`,
                  background: excludeHeard ? 'rgba(168,85,247,.1)' : 'transparent',
                  color: excludeHeard ? 'var(--accent-hi)' : 'var(--text-muted)',
                  cursor:'pointer', transition:'all .15s',
                }}
              >
                {excludeHeard ? `Hiding ${heard.size} heard` : 'Including heard'}
              </button>
            )}
          </div>
        </div>

        <div className="desktop-grid" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'40px', alignItems:'start' }}>

          {/* Left column */}
          <div style={{ position:'sticky', top:'24px', maxHeight:'calc(100vh - 48px)', overflowY:'auto', paddingRight:'4px' }}>

            <ModesBar activeMode={activeMode} onChange={handleModeChange}/>

            <SearchBar
              allAlbums={allAlbums}
              onSelectAlbum={album => { setCurrent(album); setModalAlbum(album); setCardKey(k=>k+1); }}
              onRollFromResults={albums => roll(albums)}
            />

            <YearRangeFilter minYear={minYear} maxYear={maxYear} onChange={(min, max) => { setMinYear(min); setMaxYear(max); }}/>

            <RatingFilter minRating={minRating} onChange={setMinRating}/>

            {/* Genre filter */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', borderRadius:'20px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
                  Filter by genre
                  {selGenres.size > 0 && <span style={{ marginLeft:'8px', background:'var(--accent)', color:'white', borderRadius:'99px', padding:'1px 8px', fontSize:'10px' }}>{selGenres.size}</span>}
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  {selGenres.size > 1 && (
                    <button onClick={() => setGenreMode(m => m === 'any' ? 'all' : 'any')}
                      style={{ fontFamily:'var(--font-mono)', fontSize:'9px', padding:'2px 8px', borderRadius:'99px', border:'1px solid var(--border-mid)', background: genreMode === 'all' ? 'rgba(168,85,247,.12)' : 'transparent', color: genreMode === 'all' ? 'var(--accent-hi)' : 'var(--text-muted)', cursor:'pointer' }}>
                      {genreMode === 'any' ? 'ANY' : 'ALL'}
                    </button>
                  )}
                  {selGenres.size > 0 && (
                    <button onClick={() => setSelGenres(new Set())} style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--accent-hi)', background:'none', border:'none', cursor:'pointer' }}>Clear ×</button>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {GENRE_FAMILIES.map(family => {
                  const isOpen = openFamily === family.label;
                  const activeCount = family.genres.filter(g => selGenres.has(g)).length;
                  return (
                    <div key={family.label}>
                      <div onClick={() => setOpenFamily(isOpen ? null : family.label)}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:'10px', border:`1px solid ${activeCount > 0 ? family.color : isOpen ? 'var(--border-hi)' : 'var(--border-mid)'}`, background: activeCount > 0 ? `${family.color}15` : isOpen ? 'var(--bg-surface)' : 'transparent', cursor:'pointer', transition:'all .15s' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: family.color, flexShrink:0 }}/>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: activeCount > 0 ? family.color : isOpen ? 'var(--text)' : 'var(--text-sub)', letterSpacing:'.04em' }}>{family.label}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          {activeCount > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: family.color }}>{activeCount}</span>}
                          <button onClick={e => { e.stopPropagation(); selectFamily(family); }} style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)', background:'none', border:'1px solid var(--border)', borderRadius:'4px', padding:'2px 6px', cursor:'pointer' }}>all</button>
                          <span style={{ color:'var(--text-muted)', fontSize:'10px', transform: isOpen ? 'rotate(180deg)' : 'none', display:'inline-block', transition:'transform .2s' }}>▾</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="anim-up" style={{ display:'flex', flexWrap:'wrap', gap:'4px', padding:'8px 10px 4px' }}>
                          {family.genres.map(genre => (
                            <button key={genre} onClick={() => toggleGenre(genre)} className={`pill ${selGenres.has(genre) ? 'active' : ''}`}
                              style={{ fontSize:'10px', padding:'3px 9px', ...(selGenres.has(genre) ? { borderColor: family.color, color: family.color, background:`${family.color}15` } : {}) }}>
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

            {hasFilters && (
              <div className="anim-up" style={{ background:'rgba(168,85,247,.06)', border:'1px solid rgba(168,85,247,.2)', borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--accent-hi)' }}>
                <div style={{ marginBottom:'4px', fontWeight:600 }}>
                  ✦ {pool.length.toLocaleString()} albums in pool
                  <span style={{ marginLeft:'8px', background:'var(--accent)', color:'white', borderRadius:'99px', padding:'1px 8px', fontSize:'10px' }}>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</span>
                </div>
                {(minYear !== ABSOLUTE_MIN_YEAR || maxYear !== ABSOLUTE_MAX_YEAR) && <div style={{ opacity:.7, fontSize:'11px' }}>Years: {minYear}–{maxYear}</div>}
                {selGenres.size > 0 && <div style={{ opacity:.7, fontSize:'11px', marginTop:'2px' }}>{selGenres.size} genre{selGenres.size > 1 ? 's' : ''} · {genreMode === 'all' ? 'intersection' : 'any match'}</div>}
                {minRating > 0 && <div style={{ opacity:.7, fontSize:'11px', marginTop:'2px' }}>Rating: {minRating}+</div>}
                <button onClick={clearAllFilters} style={{ marginTop:'8px', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Clear all filters →</button>
              </div>
            )}

            {/* Only show standard roll button in standard mode */}
            {activeMode === 'standard' && (
              <>
                <RollButton onClick={() => roll()} isRolling={isRolling} poolSize={pool.length}/>
                {history.length > 1 && (
                  <div className="anim-up" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'12px' }}>
                    <button onClick={goBack} disabled={histIdx<=0} className="pill" style={{ cursor:histIdx<=0?'not-allowed':'pointer', opacity:histIdx<=0?.3:1, fontSize:'11px' }}>← Back</button>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>{histIdx+1} / {history.length}</span>
                    <button onClick={goFwd} disabled={histIdx>=history.length-1} className="pill" style={{ cursor:histIdx>=history.length-1?'not-allowed':'pointer', opacity:histIdx>=history.length-1?.3:1, fontSize:'11px' }}>Forward →</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column */}
          <div>{renderRightColumn()}</div>
        </div>

        <footer style={{ marginTop:'40px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showFeed ? '16px' : '0' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
              Spindle · {allAlbums.length.toLocaleString()} Albums · Rate Your Music
            </p>
            <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
              <button
                onClick={() => setShowFeed(s => !s)}
                className={`pill ${showFeed ? 'active' : ''}`}
                style={{ cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px' }}
              >
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background: showFeed ? 'var(--accent)' : '#34d399', display:'inline-block', animation: showFeed ? 'none' : 'glowPulse 2s ease-in-out infinite' }}/>
                Live Feed
              </button>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', opacity:.5 }}>
                ← → history · Space to roll
              </p>
            </div>
          </div>

          {showFeed && (
            <div className="anim-up" style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#34d399', display:'inline-block' }}/>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
                    Community Live Feed
                  </span>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
                  Last 50 rolls · Updates in real-time
                </span>
              </div>
              <LiveFeed
                onSelectAlbum={rank => {
                  const found = allAlbums.find(a => a.rym_rank === rank);
                  if (found) { setCurrent(found); setModalAlbum(found); setCardKey(k=>k+1); }
                }}
              />
            </div>
          )}
        </footer>
      </div>

      {modalAlbum && (
        <AlbumModal
          album={modalAlbum}
          allAlbums={allAlbums}
          onClose={() => { setModalAlbum(null); window.history.replaceState({}, '', '/'); }}
        />
      )}

      {showDashboard && user && (
        <StatsDashboard
          user={user}
          heardList={heardList}
          favoritesList={favoritesList}
          rollHistory={rollHistory}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 200px)', borderRadius:'24px', border:'1px dashed var(--border-mid)', background:'var(--bg-card)' }}>
      <div style={{ fontSize:'72px', opacity:.08, marginBottom:'24px' }}>◎</div>
      <p style={{ fontFamily:'var(--font-playfair)', fontSize:'24px', color:'var(--text-sub)', marginBottom:'12px', textAlign:'center', maxWidth:'400px' }}>
        {message}
      </p>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>
        Press Space or use the controls
      </p>
    </div>
  );
}