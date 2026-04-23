'use client';
import { useState, useMemo } from 'react';
import type { Album } from '@/types';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) return `/api/cover?url=${encodeURIComponent(url)}`;
  return url;
}

interface Props {
  pool: Album[];
  onChampion: (album: Album) => void;
  onReset: () => void;
}

function pickEight(pool: Album[]): Album[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(8, shuffled.length));
}

function BracketCard({ album, onPick, isWinner, isLoser, isChampion }: {
  album: Album;
  onPick: () => void;
  isWinner: boolean;
  isLoser: boolean;
  isChampion: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={isLoser || isWinner ? undefined : onPick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', borderRadius: '12px',
        border: `2px solid ${isChampion ? 'var(--gold)' : isWinner ? 'var(--accent)' : isLoser ? 'var(--border)' : 'var(--border-mid)'}`,
        background: isChampion ? 'rgba(251,191,36,.1)' : isWinner ? 'rgba(168,85,247,.1)' : isLoser ? 'transparent' : 'var(--bg-card)',
        cursor: isLoser || isWinner ? 'default' : 'pointer',
        opacity: isLoser ? 0.35 : 1,
        transition: 'all .2s ease',
        transform: isWinner ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isChampion ? '0 0 20px rgba(251,191,36,.3)' : isWinner ? '0 0 12px rgba(168,85,247,.2)' : 'none',
      }}
      onMouseEnter={e => { if (!isLoser && !isWinner) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { if (!isLoser && !isWinner) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-mid)'; }}
    >
      <div style={{ width:'44px', height:'44px', borderRadius:'8px', overflow:'hidden', flexShrink:0, background:'var(--bg-surface)' }}>
        {album.cover_url ? (
          <img src={proxyUrl(album.cover_url)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: loaded ? 1 : 0, transition:'opacity .3s' }} onLoad={() => setLoaded(true)}/>
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'20px', opacity:.1 }}>◎</span>
          </div>
        )}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:'var(--font-inter)', fontSize:'12px', fontWeight:700, color: isChampion ? 'var(--gold)' : 'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px' }}>
          {isChampion && '🏆 '}{album.title}
        </p>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {album.artist.split('/')[0].trim()} · {album.avg_rating.toFixed(2)}★
        </p>
      </div>
    </div>
  );
}

export default function VersusMode({ pool, onChampion, onReset }: Props) {
  const initialEight = useMemo(() => pickEight(pool), [pool]);

  // Bracket state: rounds[0] = quarterfinals (4 matches of 2), rounds[1] = semis (2 matches), rounds[2] = final (1 match)
  const [rounds, setRounds] = useState<Album[][]>([initialEight]);
  const [winners, setWinners] = useState<Album[][]>([]);
  const [champion, setChampion] = useState<Album | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [picks, setPicks] = useState<number[]>([]); // indices of winners in current round

  const currentPool = rounds[currentRound] || [];
  const matchCount  = Math.floor(currentPool.length / 2);
  const currentMatch = picks.length; // which match we're on (0-indexed)

  const roundNames = ['Quarterfinals', 'Semifinals', 'Final'];

  const handlePick = (winnerIdx: number) => {
    const newPicks = [...picks, winnerIdx];
    setPicks(newPicks);

    if (newPicks.length === matchCount) {
      // Round complete — collect winners
      const roundWinners = newPicks.map((idx, matchIdx) => currentPool[matchIdx * 2 + idx]);

      if (roundWinners.length === 1) {
        // Tournament complete
        setChampion(roundWinners[0]);
        onChampion(roundWinners[0]);
      } else {
        // Next round
        setRounds(prev => [...prev, roundWinners]);
        setWinners(prev => [...prev, roundWinners]);
        setCurrentRound(r => r + 1);
        setPicks([]);
      }
    }
  };

  const reset = () => {
    const fresh = pickEight(pool);
    setRounds([fresh]);
    setWinners([]);
    setChampion(null);
    setCurrentRound(0);
    setPicks([]);
    onReset();
  };

  if (pool.length < 2) {
    return (
      <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
        Need at least 2 albums in pool for tournament mode
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', borderRadius:'24px', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'4px' }}>
            vs. Mode — Album Tournament
          </p>
          <p style={{ fontFamily:'var(--font-playfair)', fontSize:'18px', fontWeight:700, color: champion ? 'var(--gold)' : 'var(--text)' }}>
            {champion ? '🏆 Champion Found!' : roundNames[currentRound] || 'Tournament'}
          </p>
        </div>
        <button onClick={reset} className="pill" style={{ cursor:'pointer', fontSize:'11px' }}>
          ⟳ New Tournament
        </button>
      </div>

      <div style={{ padding:'24px 28px' }}>

        {/* Champion state */}
        {champion && (
          <div className="anim-up" style={{ textAlign:'center', padding:'20px 0 8px' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'16px' }}>
              Your taste has spoken
            </p>
            <div style={{ maxWidth:'400px', margin:'0 auto', marginBottom:'20px' }}>
              <BracketCard album={champion} onPick={() => {}} isWinner={false} isLoser={false} isChampion={true}/>
            </div>
            {champion.cover_url && (
              <img src={proxyUrl(champion.cover_url)} alt={champion.title} style={{ width:'200px', height:'200px', objectFit:'cover', borderRadius:'16px', marginBottom:'16px', boxShadow:'0 0 40px rgba(251,191,36,.3)' }}/>
            )}
            <p style={{ fontFamily:'var(--font-playfair)', fontSize:'28px', fontWeight:700, color:'var(--gold)', marginBottom:'4px' }}>{champion.title}</p>
            <p style={{ fontFamily:'var(--font-inter)', fontSize:'16px', color:'var(--text-sub)', marginBottom:'16px' }}>{champion.artist}</p>
            {champion.spotify_id && (
              <a href={`https://open.spotify.com/album/${champion.spotify_id}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily:'var(--font-mono)', fontSize:'12px', padding:'10px 24px', borderRadius:'99px', background:'#1DB954', color:'white', textDecoration:'none' }}>
                ▶ Listen Now
              </a>
            )}
          </div>
        )}

        {/* Active tournament */}
        {!champion && (
          <div>
            {/* Progress indicator */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
              {[0,1,2].slice(0, Math.ceil(Math.log2(initialEight.length))).map(r => (
                <div key={r} style={{ flex:1, height:'3px', borderRadius:'99px', background: r < currentRound ? 'var(--accent)' : r === currentRound ? 'var(--accent-hi)' : 'var(--border-mid)', transition:'background .3s' }}/>
              ))}
            </div>

            {/* Current match */}
            {currentMatch < matchCount && (
              <div>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', marginBottom:'16px' }}>
                  Match {currentMatch + 1} of {matchCount} — Pick your favourite
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxWidth:'480px' }}>
                  {[0, 1].map(offset => {
                    const album = currentPool[currentMatch * 2 + offset];
                    if (!album) return null;
                    return (
                      <div key={album.rym_rank}>
                        <BracketCard
                          album={album}
                          onPick={() => handlePick(offset)}
                          isWinner={false} isLoser={false} isChampion={false}
                        />
                        {offset === 0 && (
                          <div style={{ textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', fontWeight:700 }}>
                            vs
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Previous matches in this round */}
            {picks.length > 0 && (
              <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'12px' }}>
                  Advancing from this round
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxWidth:'480px' }}>
                  {picks.map((winnerOffset, matchIdx) => {
                    const album = currentPool[matchIdx * 2 + winnerOffset];
                    return (
                      <BracketCard key={album.rym_rank} album={album} onPick={() => {}} isWinner={true} isLoser={false} isChampion={false}/>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}