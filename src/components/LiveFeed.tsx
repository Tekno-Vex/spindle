'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

function proxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://e.snmc.io/')) return `/api/cover?url=${encodeURIComponent(url)}`;
  return url;
}

interface FeedEntry {
  id: string;
  album_rank: number;
  album_title: string;
  album_artist: string;
  cover_url: string;
  rolled_at: string;
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours/24)}d ago`;
}

interface Props {
  onSelectAlbum: (rank: number) => void;
}

export default function LiveFeed({ onSelectAlbum }: Props) {
  const [feed,    setFeed]    = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadFeed = useCallback(async () => {
    const { data } = await supabase
      .from('public_feed')
      .select('*')
      .order('rolled_at', { ascending: false })
      .limit(50);
    if (data) setFeed(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadFeed();

    // Real-time subscription
    const channel = supabase
      .channel('public_feed_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_feed' },
        payload => {
          setFeed(prev => [payload.new as FeedEntry, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadFeed, supabase]);

  if (loading) return (
    <div style={{ padding:'20px', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
      Loading feed...
    </div>
  );

  if (feed.length === 0) return (
    <div style={{ padding:'20px', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>
      No rolls yet today — be the first!
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {feed.map((entry, i) => (
        <div
          key={entry.id}
          onClick={() => onSelectAlbum(entry.album_rank)}
          style={{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'8px 12px', cursor:'pointer',
            borderBottom:'1px solid var(--border)',
            transition:'background .1s',
            animation: i === 0 ? 'fadeUp .3s ease' : 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ width:'36px', height:'36px', borderRadius:'6px', overflow:'hidden', flexShrink:0, background:'var(--bg-surface)' }}>
            {entry.cover_url ? (
              <img src={proxyUrl(entry.cover_url)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'14px', opacity:.2 }}>◎</span>
              </div>
            )}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:'var(--font-inter)', fontSize:'12px', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {entry.album_title}
            </p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {entry.album_artist.split('/')[0].trim()}
            </p>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', flexShrink:0 }}>
            {timeAgo(entry.rolled_at)}
          </span>
        </div>
      ))}
    </div>
  );
}