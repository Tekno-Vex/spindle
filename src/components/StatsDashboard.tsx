'use client';
import type { User } from '@supabase/supabase-js';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) {
    return `/api/cover?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface HeardEntry {
  album_rank: number;
  album_title: string;
  album_artist: string;
  cover_url: string;
  heard_at: string;
}

interface FavoriteEntry {
  album_rank: number;
  album_title: string;
  album_artist: string;
  cover_url: string;
  favorited_at: string;
}

interface HistoryEntry {
  album_rank: number;
  album_title: string;
  album_artist: string;
  cover_url: string;
  rolled_at: string;
}

interface Props {
  user: User;
  heardList: HeardEntry[];
  favoritesList: FavoriteEntry[];
  rollHistory: HistoryEntry[];
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function StatsDashboard({ user, heardList, favoritesList, rollHistory, onClose }: Props) {
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You';

  const SECTIONS = [
    { title: 'Favorites', items: favoritesList, dateKey: 'favorited_at' as const, emptyMsg: 'No favorites yet — heart an album to save it here' },
    { title: 'Heard', items: heardList, dateKey: 'heard_at' as const, emptyMsg: 'No heard albums yet — mark albums as heard to exclude them from future rolls' },
    { title: 'Recent Rolls', items: rollHistory, dateKey: 'rolled_at' as const, emptyMsg: 'No roll history yet — start rolling!' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,4,12,.85)', backdropFilter: 'blur(12px)' }}
      />

      {/* Modal */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 101, overflowY: 'auto', padding: '24px 16px' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '900px', margin: '0 auto',
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            borderRadius: '28px', overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,.8)',
            animation: 'cardIn .4s cubic-bezier(.16,1,.3,1)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '20px', right: '20px', zIndex: 10,
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(7,7,15,.8)', border: '1px solid var(--border-mid)',
              color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{ padding: '36px 40px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Your Discovery Journey
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '36px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {name}&apos;s Stats
            </h2>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { label: 'Albums Rolled', value: rollHistory.length },
                { label: 'Albums Heard', value: heardList.length },
                { label: 'Favorites', value: favoritesList.length },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--accent-hi)' }}>{s.value}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map(section => (
            <div key={section.title} style={{ borderBottom: '1px solid var(--border)', padding: '28px 40px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {section.title} ({section.items.length})
              </h3>

              {section.items.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {section.emptyMsg}
                </p>
              ) : (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ flexShrink: 0, width: '100px' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-surface)', marginBottom: '6px' }}>
                        {item.cover_url ? (
                          <img src={proxyUrl(item.cover_url)} alt={item.album_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '28px', opacity: .1 }}>◎</span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.album_title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                        {timeAgo(item[section.dateKey])}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}