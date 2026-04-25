import { NextRequest, NextResponse } from 'next/server';
import albumsData from '@/data/albums.json';

type Album = { rym_rank: number; title: string; artist: string; avg_rating: number; cover_url: string; year: number; genres: string[] };

export async function GET(request: NextRequest) {
  const rank   = parseInt(request.nextUrl.searchParams.get('rank') || '1');
  const albums = albumsData as Album[];
  const album  = albums.find(a => a.rym_rank === rank);

  if (!album) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(album, {
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
  });
}