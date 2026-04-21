'use client';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface Props {
  minYear: number;
  maxYear: number;
  onChange: (min: number, max: number) => void;
}

const DECADE_PRESETS = [
  { label: '50s', min: 1950, max: 1959 },
  { label: '60s', min: 1960, max: 1969 },
  { label: '70s', min: 1970, max: 1979 },
  { label: '80s', min: 1980, max: 1989 },
  { label: '90s', min: 1990, max: 1999 },
  { label: '00s', min: 2000, max: 2009 },
  { label: '10s', min: 2010, max: 2019 },
  { label: '20s', min: 2020, max: 2026 },
];

const ABSOLUTE_MIN = 1950;
const ABSOLUTE_MAX = 2026;

export default function YearRangeFilter({ minYear, maxYear, onChange }: Props) {
  const [localMin, setLocalMin] = useState(minYear);
  const [localMax, setLocalMax] = useState(maxYear);

  useEffect(() => { setLocalMin(minYear); }, [minYear]);
  useEffect(() => { setLocalMax(maxYear); }, [maxYear]);

  const isFiltered = minYear !== ABSOLUTE_MIN || maxYear !== ABSOLUTE_MAX;

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setLocalMin(value[0]);
      setLocalMax(value[1]);
    }
  };

  const handleSliderAfterChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      onChange(value[0], value[1]);
    }
  };

  const applyPreset = (min: number, max: number) => {
    setLocalMin(min);
    setLocalMax(max);
    onChange(min, max);
  };

  const reset = () => {
    setLocalMin(ABSOLUTE_MIN);
    setLocalMax(ABSOLUTE_MAX);
    onChange(ABSOLUTE_MIN, ABSOLUTE_MAX);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-mid)',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Filter by era
          {isFiltered && (
            <span style={{ marginLeft: '8px', background: 'var(--accent)', color: 'white', borderRadius: '99px', padding: '1px 8px', fontSize: '10px' }}>
              active
            </span>
          )}
        </span>
        {isFiltered && (
          <button onClick={reset} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-hi)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear ×
          </button>
        )}
      </div>

      {/* Year display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: isFiltered ? 'var(--accent-hi)' : 'var(--text-sub)' }}>
          {localMin}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: isFiltered ? 'var(--accent-hi)' : 'var(--text-sub)' }}>
          {localMax}
        </span>
      </div>

      {/* Slider */}
      <div style={{ padding: '0 4px', marginBottom: '16px' }}>
        <style>{`
          .spindle-slider .rc-slider-track { background: var(--accent) !important; }
          .spindle-slider .rc-slider-handle { border-color: var(--accent) !important; background: var(--accent) !important; opacity: 1 !important; width: 16px !important; height: 16px !important; margin-top: -6px !important; }
          .spindle-slider .rc-slider-handle:focus { box-shadow: 0 0 0 4px rgba(168,85,247,.25) !important; }
          .spindle-slider .rc-slider-rail { background: var(--border-mid) !important; }
        `}</style>
        <div className="spindle-slider">
          <Slider
            range
            min={ABSOLUTE_MIN}
            max={ABSOLUTE_MAX}
            value={[localMin, localMax]}
            onChange={handleSliderChange}
            onChangeComplete={handleSliderAfterChange}
            allowCross={false}
          />
        </div>
      </div>

      {/* Decade presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {DECADE_PRESETS.map(d => {
          const isActive = localMin === d.min && localMax === d.max;
          return (
            <button
              key={d.label}
              onClick={() => applyPreset(d.min, d.max)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                padding: '5px 0',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-mid)'}`,
                background: isActive ? 'rgba(168,85,247,.12)' : 'transparent',
                color: isActive ? 'var(--accent-hi)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}