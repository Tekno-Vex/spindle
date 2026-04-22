'use client';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
  loading: boolean;
  onShowDashboard: () => void;
}

export default function UserMenu({ user, loading, onShowDashboard }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <a
        href="/auth/signin"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '.08em',
          padding: '7px 16px',
          borderRadius: '99px',
          border: '1px solid var(--border-mid)',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'all .15s',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-hi)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        Sign in
      </a>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(m => !m)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: '1px solid var(--border-mid)',
          borderRadius: '99px', padding: '4px 12px 4px 4px',
          cursor: 'pointer', transition: 'all .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}/>
        ) : (
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 600 }}>
            {name[0].toUpperCase()}
          </div>
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-sub)' }}>
          {name.split(' ')[0]}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px', transform: menuOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform .2s' }}>▾</span>
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            borderRadius: '16px', overflow: 'hidden', minWidth: '180px',
            boxShadow: '0 8px 32px rgba(0,0,0,.4)',
            animation: 'fadeUp .2s ease',
          }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{name}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</p>
          </div>

          <button
            onClick={() => { setMenuOpen(false); onShowDashboard(); }}
            style={{
              width: '100%', padding: '11px 16px', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-sub)',
              borderBottom: '1px solid var(--border)', transition: 'background .1s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>📊</span> My Stats
          </button>

          <form action="/auth/signout" method="post">
            <button
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              style={{
                width: '100%', padding: '11px 16px', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
                transition: 'background .1s',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span>→</span> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}