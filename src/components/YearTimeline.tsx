'use client';
import { useState } from 'react';

interface Props {
  selectedYear: number | null;
  onYearSelect: (y: number | null) => void;
  yearCounts: Record<number, number>;
}

const DECADES = [
  { label:'1950s', years: Array.from({length:10},(_,i)=>1950+i) },
  { label:'1960s', years: Array.from({length:10},(_,i)=>1960+i) },
  { label:'1970s', years: Array.from({length:10},(_,i)=>1970+i) },
  { label:'1980s', years: Array.from({length:10},(_,i)=>1980+i) },
  { label:'1990s', years: Array.from({length:10},(_,i)=>1990+i) },
  { label:'2000s', years: Array.from({length:10},(_,i)=>2000+i) },
  { label:'2010s', years: Array.from({length:10},(_,i)=>2010+i) },
  { label:'2020s', years: Array.from({length:7}, (_,i)=>2020+i) },
];

export default function YearTimeline({ selectedYear, onYearSelect, yearCounts }: Props) {
  const [openDecade, setOpenDecade] = useState<string|null>(null);
  const total = (years: number[]) => years.reduce((s,y) => s+(yearCounts[y]||0), 0);

  return (
    <div style={{
      background:'var(--bg-card)',
      border:'1px solid var(--border-mid)',
      borderRadius:'20px',
      padding:'16px',
      marginBottom:'16px',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Filter by era
        </span>
        {selectedYear && (
          <button onClick={() => { onYearSelect(null); setOpenDecade(null); }}
            style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--accent-hi)', background:'none', border:'none', cursor:'pointer' }}>
            Clear {selectedYear} ×
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'6px', marginBottom: openDecade ? '12px' : '0' }}>
        {DECADES.map(({ label, years }) => {
          const isOpen    = openDecade === label;
          const hasActive = selectedYear !== null && years.includes(selectedYear);
          const count     = total(years);
          return (
            <button
              key={label}
              onClick={() => setOpenDecade(isOpen ? null : label)}
              style={{
                fontFamily:'var(--font-mono)',
                fontSize:'11px',
                letterSpacing:'.06em',
                padding:'8px 12px',
                borderRadius:'10px',
                border:`1px solid ${hasActive ? 'var(--accent)' : isOpen ? 'var(--border-hi)' : 'var(--border-mid)'}`,
                background: hasActive ? 'rgba(168,85,247,.12)' : isOpen ? 'var(--bg-surface)' : 'transparent',
                color: hasActive ? 'var(--accent-hi)' : isOpen ? 'var(--text)' : 'var(--text-sub)',
                cursor:'pointer',
                transition:'all .15s',
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
              }}
            >
              <span>{label}</span>
              <span style={{ opacity:.5, fontSize:'10px' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {openDecade && (() => {
        const decade = DECADES.find(d => d.label === openDecade);
        if (!decade) return null;
        return (
          <div className="anim-up" style={{
            borderTop:'1px solid var(--border)',
            paddingTop:'12px',
            display:'flex', flexWrap:'wrap', gap:'6px',
          }}>
            {decade.years.map(year => {
              const cnt = yearCounts[year] || 0;
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => onYearSelect(isSelected ? null : year)}
                  className={`pill ${isSelected ? 'active' : ''}`}
                  style={{ opacity: cnt === 0 ? 0.3 : 1, fontSize:'12px', padding:'5px 14px' }}
                  title={`${year} — ${cnt} albums`}
                >
                  {year}
                  <span style={{ marginLeft:'5px', opacity:.5, fontSize:'9px' }}>{cnt}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {selectedYear && (
        <div className="anim-up" style={{
          marginTop:'12px', paddingTop:'10px',
          borderTop:'1px solid var(--border)',
          fontFamily:'var(--font-mono)', fontSize:'11px',
          color:'var(--accent-hi)', letterSpacing:'.06em',
        }}>
          ✦ {selectedYear} · {yearCounts[selectedYear]||0} albums in pool
        </div>
      )}
    </div>
  );
}