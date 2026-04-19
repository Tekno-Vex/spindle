'use client';
import { useEffect, useState } from 'react';

export default function Masthead({ totalAlbums, rolledCount }: { totalAlbums: number; rolledCount: number }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{ position:'relative', textAlign:'center', padding:'72px 0 56px', overflow:'hidden' }}>

      {/* Ambient orb */}
      <div style={{
        position:'absolute', top:'40%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'500px', height:'300px',
        background:'radial-gradient(ellipse, rgba(155,93,229,.22) 0%, transparent 70%)',
        filter:'blur(48px)',
        animation:'orbFloat 8s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* Meta line */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'48px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Rate Your Music · All-Time
        </span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.12em', color:'var(--text-muted)' }}>
          {time}
        </span>
      </div>

      {/* Wordmark */}
      <h1 className="shimmer" style={{
        fontFamily: 'var(--font-playfair)',
        fontWeight: 700,
        fontSize: 'clamp(80px, 16vw, 180px)',
        lineHeight: 1,
        letterSpacing: '-0.03em',
        position: 'relative',
      }}>
        Spindle
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily:'var(--font-mono)',
        fontSize:'11px',
        letterSpacing:'.22em',
        textTransform:'uppercase',
        color:'var(--text-muted)',
        marginTop:'20px',
      }}>
        {totalAlbums.toLocaleString()} Albums &nbsp;·&nbsp; 1954 – 2026 &nbsp;·&nbsp; Discover Everything
      </p>

      {rolledCount > 0 && (
        <p className="anim-up" style={{
          fontFamily:'var(--font-mono)',
          fontSize:'11px',
          color:'var(--accent-hi)',
          marginTop:'10px',
          letterSpacing:'.06em',
        }}>
          {rolledCount} {rolledCount === 1 ? 'album' : 'albums'} discovered this session
        </p>
      )}

      {/* Rule */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px', marginTop:'48px' }}>
        <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, var(--border-hi))' }}/>
        <span style={{ color:'var(--border-hi)', fontSize:'9px' }}>✦</span>
        <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, var(--border-hi))' }}/>
      </div>
    </header>
  );
}