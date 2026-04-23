'use client';

export type Mode = 'standard' | 'blind' | 'versus' | 'safari';

interface ModeConfig {
  id: Mode;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const MODES: ModeConfig[] = [
  { id: 'standard', label: 'Standard',     icon: '⟳',  description: 'Classic random roll',                  color: 'var(--accent)' },
  { id: 'blind',    label: 'Blind Mode',   icon: '◐',  description: 'Hidden until you reveal',              color: '#ec4899' },
  { id: 'versus',   label: 'vs. Mode',     icon: '⚔',  description: 'Two albums, you pick one',             color: '#22d3ee' },
  { id: 'safari',   label: 'Decade Safari',icon: '🗺', description: 'Journey through the decades',          color: '#4ade80' },
];

interface Props {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModesBar({ activeMode, onChange }: Props) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-mid)',
      borderRadius: '20px',
      padding: '12px',
      marginBottom: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '10px',
        paddingLeft: '4px',
      }}>
        Roll Mode
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {MODES.map(mode => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '12px',
                border: `1px solid ${isActive ? mode.color : 'transparent'}`,
                background: isActive ? `${mode.color}15` : 'transparent',
                cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '14px', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                {mode.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: isActive ? mode.color : 'var(--text-sub)',
                  letterSpacing: '.04em', fontWeight: isActive ? 600 : 400,
                }}>
                  {mode.label}
                </div>
                {isActive && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {mode.description}
                  </div>
                )}
              </div>
              {isActive && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mode.color, flexShrink: 0 }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}