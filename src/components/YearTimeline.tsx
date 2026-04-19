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
  const [openDecade, setOpenDecade] = useState<string | null>(null);

  const toggleDecade = (label: string) => {
    setOpenDecade(prev => prev === label ? null : label);
  };

  const totalInDecade = (years: number[]) =>
    years.reduce((s, y) => s + (yearCounts[y] || 0), 0);

  return (
    <div className="card-surface" style={{ padding:'28px 28px 24px', marginBottom:'32px' }}>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Filter by era
        </span>
        {selectedYear && (
          <button
            onClick={() => { onYearSelect(null); setOpenDecade(null); }}
            style={{
              fontFamily:'var(--font-mono)', fontSize:'10px',
              color:'var(--accent-hi)', background:'none', border:'none',
              cursor:'pointer', letterSpacing:'.06em',
            }}
          >
            Clear {selectedYear} ×
          </button>
        )}
      </div>

      {/* Decade rows */}
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {DECADES.map(({ label, years }) => {
          const isOpen   = openDecade === label;
          const hasActive = selectedYear !== null && years.includes(selectedYear);
          const count    = totalInDecade(years);

          return (
            <div key={label}>
              {/* Decade header button */}
              <button
                onClick={() => toggleDecade(label)}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  background:'none', border:'none', cursor:'pointer',
                  padding:'4px 0', width:'100%', textAlign:'left',
                }}
              >
                <span style={{
                  fontFamily:'var(--font-mono)',
                  fontSize:'11px',
                  letterSpacing:'.12em',
                  color: hasActive ? 'var(--accent-hi)' : isOpen ? 'var(--text)' : 'var(--text-sub)',
                  transition:'color .15s',
                  minWidth:'52px',
                }}>
                  {label}
                </span>
                <div style={{
                  flex:1, height:'1px',
                  background: hasActive
                    ? 'linear-gradient(to right, var(--accent), transparent)'
                    : 'linear-gradient(to right, var(--border-mid), transparent)',
                }}/>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
                  {count}
                </span>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:'10px',
                  color:'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition:'transform .2s',
                  display:'inline-block',
                }}>▾</span>
              </button>

              {/* Year pills — shown when decade is open */}
              {isOpen && (
                <div className="anim-up" style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px', paddingLeft:'62px' }}>
                  {years.map(year => {
                    const cnt       = yearCounts[year] || 0;
                    const isSelected = selectedYear === year;
                    return (
                      <button
                        key={year}
                        onClick={() => onYearSelect(isSelected ? null : year)}
                        className={`pill ${isSelected ? 'active' : ''}`}
                        style={{ opacity: cnt === 0 ? 0.3 : 1 }}
                        title={`${year} — ${cnt} albums`}
                      >
                        {year}
                        {cnt > 0 && (
                          <span style={{ marginLeft:'5px', opacity:.55, fontSize:'9px' }}>{cnt}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active filter summary */}
      {selectedYear && (
        <div className="anim-up" style={{
          marginTop:'20px',
          paddingTop:'16px',
          borderTop:'1px solid var(--border)',
          fontFamily:'var(--font-mono)',
          fontSize:'11px',
          color:'var(--accent-hi)',
          letterSpacing:'.06em',
        }}>
          ✦ Showing {yearCounts[selectedYear] || 0} albums from {selectedYear}
        </div>
      )}
    </div>
  );
}