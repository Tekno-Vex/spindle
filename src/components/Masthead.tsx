'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function Masthead({ totalAlbums, rolledCount }: { totalAlbums: number; rolledCount: number }) {
  const [time, setTime] = useState('');
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{ position:'relative', padding:'24px 0 20px', overflow:'hidden' }}>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'800px', height:'400px',
        background:'radial-gradient(ellipse, rgba(168,85,247,.15) 0%, transparent 65%)',
        filter:'blur(60px)',
        animation:'orbFloat 8s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', position:'relative' }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'13px', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'8px' }}>
            Rate Your Music · All-Time Charts
          </div>
          <h1 className="shimmer" style={{ fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'clamp(48px, 8vw, 100px)', lineHeight:1, letterSpacing:'-.03em' }}>
            Spindle
          </h1>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-muted)', marginTop:'10px' }}>
            {totalAlbums.toLocaleString()} Albums &nbsp;·&nbsp; 1954–2026
          </p>
        </div>

        <div style={{ textAlign:'right', paddingBottom:'4px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                width:'36px', height:'20px', borderRadius:'10px',
                background: theme === 'light' ? 'var(--accent)' : 'var(--border-mid)',
                border:'none', cursor:'pointer', position:'relative',
                transition:'background .2s ease',
                flexShrink:0,
              }}
            >
              <div style={{
                position:'absolute', top:'3px',
                left: theme === 'light' ? '19px' : '3px',
                width:'14px', height:'14px', borderRadius:'50%',
                background:'white',
                transition:'left .2s ease',
                boxShadow:'0 1px 3px rgba(0,0,0,.3)',
              }}/>
            </button>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
              {theme === 'dark' ? '◐ Dark' : '○ Light'}
            </span>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'24px', color:'var(--text)', letterSpacing:'-.02em', fontWeight:600 }}>
            {time}
          </div>
          {rolledCount > 0 && (
            <div className="anim-up" style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--accent-hi)', letterSpacing:'.06em' }}>
              {rolledCount} discovered this session
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'16px', marginTop:'16px' }}>
        <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, var(--accent), transparent)' }}/>
        <span style={{ color:'var(--accent)', fontSize:'10px' }}>✦</span>
        <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, var(--accent), transparent)' }}/>
      </div>
    </header>
  );
}