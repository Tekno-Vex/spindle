'use client';

export default function RollButton({ onClick, isRolling, poolSize }: {
  onClick: () => void;
  isRolling: boolean;
  poolSize: number;
}) {
  const disabled = isRolling || poolSize === 0;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', margin:'40px 0' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          fontFamily:'var(--font-playfair)',
          fontWeight:700,
          fontSize:'24px',
          letterSpacing:'.04em',
          color:'white',
          background: disabled ? 'var(--bg-surface)' : 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
          border: disabled ? '1px solid var(--border-mid)' : 'none',
          borderRadius:'18px',
          padding:'20px 72px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: poolSize === 0 ? .4 : 1,
          boxShadow: disabled ? 'none' : '0 0 48px rgba(168,85,247,.4), 0 8px 32px rgba(0,0,0,.5)',
          transition:'all .2s ease',
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        onMouseDown={e  => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
      >
        {isRolling ? '◌  Rolling...' : '⟳  Roll'}
      </button>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', letterSpacing:'.06em' }}>
        {poolSize === 0 ? 'No albums match' : `${poolSize.toLocaleString()} albums · Press Space`}
      </p>
    </div>
  );
}