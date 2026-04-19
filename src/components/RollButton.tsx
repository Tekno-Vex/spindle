'use client';

export default function RollButton({ onClick, isRolling, poolSize }: {
  onClick: () => void;
  isRolling: boolean;
  poolSize: number;
}) {
  const disabled = isRolling || poolSize === 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          fontFamily: 'var(--font-playfair)',
          fontWeight: 700,
          fontSize: '20px',
          letterSpacing: '.05em',
          color: disabled ? 'var(--text-muted)' : 'white',
          background: disabled
            ? 'var(--bg-surface)'
            : 'linear-gradient(135deg, #7b2ff7 0%, #9b5de5 40%, #f72585 100%)',
          border: disabled ? '1px solid var(--border-mid)' : 'none',
          borderRadius: '16px',
          padding: '16px 52px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : '0 0 48px rgba(155,93,229,.4), 0 8px 32px rgba(0,0,0,.5)',
          transition: 'all .2s ease',
          transform: 'translateY(0)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        onMouseDown={e  => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
      >
        {isRolling ? '◌  Rolling...' : '⟳  Roll'}
      </button>

      <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', letterSpacing:'.06em' }}>
        {poolSize === 0
          ? 'No albums match this filter'
          : `${poolSize.toLocaleString()} albums · Press Space`}
      </p>
    </div>
  );
}