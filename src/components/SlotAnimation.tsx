'use client';
import { useEffect, useState } from 'react';

export default function SlotAnimation({ isRolling, albumTitles }: { isRolling: boolean; albumTitles: string[] }) {
  const [title, setTitle] = useState('');
  const [frame, setFrame]  = useState(0);

  useEffect(() => {
    if (!isRolling) { setTitle(''); setFrame(0); return; }
    let f = 0;
    const id = setInterval(() => {
      f++;
      setTitle(albumTitles[Math.floor(Math.random() * albumTitles.length)]);
      setFrame(f);
      if (f >= 20) clearInterval(id);
    }, 75);
    return () => clearInterval(id);
  }, [isRolling, albumTitles]);

  if (!isRolling) return null;

  const blur    = Math.max(0, 5 - frame * 0.3);
  const opacity = frame > 14 ? Math.max(0, 1 - (frame - 14) / 7) : 1;

  return (
    <div style={{ textAlign:'center', padding:'40px 0', opacity }}>
      <p style={{
        fontFamily: 'var(--font-playfair)',
        fontWeight: 700,
        fontSize: 'clamp(18px, 3.5vw, 28px)',
        color: 'var(--text-sub)',
        filter: `blur(${blur}px)`,
        transition: 'filter .07s',
        letterSpacing: '-.01em',
        maxWidth: '600px',
        margin: '0 auto',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {title}
      </p>
    </div>
  );
}