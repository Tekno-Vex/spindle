export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        color: 'var(--text-muted)',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
      }}>
        Loading Spindle...
      </div>
    </div>
  );
}