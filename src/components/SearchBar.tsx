'use client';
import { useState, useRef, useEffect } from 'react';
import type { Album } from '@/types';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) {
    return `/api/cover?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface Props {
  allAlbums: Album[];
  onSelectAlbum: (album: Album) => void;
  onRollFromResults: (albums: Album[]) => void;
}

export default function SearchBar({ allAlbums, onSelectAlbum, onRollFromResults }: Props) {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState<Album[]>([]);
  const [isOpen,      setIsOpen]      = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsOpen(false); return; }

    const q = query.toLowerCase();
    const matches = allAlbums
      .filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q)
      )
      .slice(0, 8);

    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlighted(-1);
  }, [query, allAlbums]);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) {
        handleSelect(results[highlighted]);
      } else if (results.length > 0) {
        onRollFromResults(results);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (album: Album) => {
    onSelectAlbum(album);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '16px' }}>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg-card)',
        border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border-mid)'}`,
        borderRadius: isOpen && results.length > 0 ? '14px 14px 0 0' : '14px',
        padding: '10px 14px',
        transition: 'border-color .15s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search albums or artists..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            color: 'var(--text)',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-card)',
          border: '1px solid var(--accent)',
          borderTop: '1px solid var(--border)',
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,.4)',
        }}>
          {results.map((album, i) => (
            <div
              key={album.rym_rank}
              onClick={() => handleSelect(album)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                background: highlighted === i ? 'var(--bg-surface)' : 'transparent',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .1s',
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {/* Tiny cover */}
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-surface)', flexShrink: 0 }}>
                {album.cover_url ? (
                  <img src={proxyUrl(album.cover_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', opacity: .2 }}>◎</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {album.title}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {album.artist.split('/')[0].trim()} · {album.year}
                </p>
              </div>

              {/* Rank */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                #{album.rym_rank}
              </span>
            </div>
          ))}

          {/* Roll from results footer */}
          <div
            onClick={() => { onRollFromResults(results); setIsOpen(false); setQuery(''); }}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-hi)' }}>
              ⟳ Roll from these {results.length} results
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>or press Enter</span>
          </div>
        </div>
      )}
    </div>
  );
}