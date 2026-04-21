'use client';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface Props {
  minRating: number;
  onChange: (min: number) => void;
}

const RATING_PRESETS = [
  { label: 'Any', value: 0 },
  { label: '3.5+', value: 3.5 },
  { label: '3.8+', value: 3.8 },
  { label: '4.0+', value: 4.0 },
  { label: '4.2+', value: 4.2 },
];

export default function RatingFilter({ minRating, onChange }: Props) {
  const isFiltered = minRating > 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-mid)',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Min rating
          {isFiltered && (
            <span style={{ marginLeft: '8px', background: 'var(--accent)', color: 'white', borderRadius: '99px', padding: '1px 8px', fontSize: '10px' }}>
              {minRating}+
            </span>
          )}
        </span>
        {isFiltered && (
          <button onClick={() => onChange(0)} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-hi)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear ×
          </button>
        )}
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {RATING_PRESETS.map(p => {
          const isActive = minRating === p.value;
          return (
            <button
              key={p.label}
              onClick={() => onChange(p.value)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '99px',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border-mid)'}`,
                background: isActive ? 'rgba(251,191,36,.1)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Stars display */}
      {isFiltered && (
        <div style={{ marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          {Array.from({length: 5}).map((_,i) => (
            <span key={i} style={{ color: i < Math.floor(minRating) ? 'var(--gold)' : 'var(--border-hi)' }}>★</span>
          ))} and above
        </div>
      )}
    </div>
  );
}