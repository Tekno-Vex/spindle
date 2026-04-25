'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Album } from '@/types';

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

export function useUserData(user: User | null) {
  const [heard,     setHeard]     = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [heardList,     setHeardList]     = useState<HeardEntry[]>([]);
  const [favoritesList, setFavoritesList] = useState<FavoriteEntry[]>([]);
  const [rollHistory,   setRollHistory]   = useState<HistoryEntry[]>([]);
  const supabase = createClient();

  const loadUserData = useCallback(async () => {
    if (!user) {
      setHeard(new Set());
      setFavorites(new Set());
      setHeardList([]);
      setFavoritesList([]);
      setRollHistory([]);
      return;
    }

    const [heardRes, favsRes, histRes] = await Promise.all([
      supabase.from('heard').select('*').eq('user_id', user.id).order('heard_at', { ascending: false }),
      supabase.from('favorites').select('*').eq('user_id', user.id).order('favorited_at', { ascending: false }),
      supabase.from('roll_history').select('*').eq('user_id', user.id).order('rolled_at', { ascending: false }).limit(20),
    ]);

    if (heardRes.data) {
      setHeard(new Set(heardRes.data.map((h: HeardEntry) => h.album_rank)));
      setHeardList(heardRes.data);
    }
    if (favsRes.data) {
      setFavorites(new Set(favsRes.data.map((f: FavoriteEntry) => f.album_rank)));
      setFavoritesList(favsRes.data);
    }
    if (histRes.data) setRollHistory(histRes.data);
  }, [user]);

  useEffect(() => { loadUserData(); }, [loadUserData]);

  const markHeard = useCallback(async (album: Album) => {
    if (!user) return;
    const isHeard = heard.has(album.rym_rank);

    if (isHeard) {
      await supabase.from('heard').delete().eq('user_id', user.id).eq('album_rank', album.rym_rank);
      setHeard(prev => { const next = new Set(prev); next.delete(album.rym_rank); return next; });
      setHeardList(prev => prev.filter(h => h.album_rank !== album.rym_rank));
    } else {
      await supabase.from('heard').upsert({
        user_id: user.id,
        album_rank: album.rym_rank,
        album_title: album.title,
        album_artist: album.artist,
        cover_url: album.cover_url || '',
      });
      setHeard(prev => new Set([...prev, album.rym_rank]));
      setHeardList(prev => [{
        album_rank: album.rym_rank,
        album_title: album.title,
        album_artist: album.artist,
        cover_url: album.cover_url || '',
        heard_at: new Date().toISOString(),
      }, ...prev]);
    }
  }, [user, heard]);

  const toggleFavorite = useCallback(async (album: Album) => {
    if (!user) return;
    const isFav = favorites.has(album.rym_rank);

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('album_rank', album.rym_rank);
      setFavorites(prev => { const next = new Set(prev); next.delete(album.rym_rank); return next; });
      setFavoritesList(prev => prev.filter(f => f.album_rank !== album.rym_rank));
    } else {
      await supabase.from('favorites').upsert({
        user_id: user.id,
        album_rank: album.rym_rank,
        album_title: album.title,
        album_artist: album.artist,
        cover_url: album.cover_url || '',
      });
      setFavorites(prev => new Set([...prev, album.rym_rank]));
      setFavoritesList(prev => [{
        album_rank: album.rym_rank,
        album_title: album.title,
        album_artist: album.artist,
        cover_url: album.cover_url || '',
        favorited_at: new Date().toISOString(),
      }, ...prev]);
    }
  }, [user, favorites]);

  const addToHistory = useCallback(async (album: Album) => {
    // Write to public feed (no auth needed)
    const anonSupabase = createClient();
    await anonSupabase.from('public_feed').insert({
      album_rank:   album.rym_rank,
      album_title:  album.title,
      album_artist: album.artist,
      cover_url:    album.cover_url || '',
    });

    // Write to personal history if logged in
    if (!user) return;
    await supabase.from('roll_history').insert({
      user_id:      user.id,
      album_rank:   album.rym_rank,
      album_title:  album.title,
      album_artist: album.artist,
      cover_url:    album.cover_url || '',
    });
    setRollHistory(prev => [{
      album_rank:   album.rym_rank,
      album_title:  album.title,
      album_artist: album.artist,
      cover_url:    album.cover_url || '',
      rolled_at:    new Date().toISOString(),
    }, ...prev].slice(0, 20));
  }, [user, supabase]);

  return {
    heard, favorites, heardList, favoritesList, rollHistory,
    markHeard, toggleFavorite, addToHistory,
  };
}