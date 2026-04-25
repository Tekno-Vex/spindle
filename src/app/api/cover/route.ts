import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) return new NextResponse('Missing url', { status: 400 });
  if (!url.startsWith('https://e.snmc.io/')) return new NextResponse('Invalid url', { status: 403 });

  try {
    const response = await fetch(url, {
      headers: {
        'Referer':        'https://rateyourmusic.com/',
        'Origin':         'https://rateyourmusic.com',
        'User-Agent':     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':         'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language':'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      // Cache the upstream fetch at the edge for 7 days
      next: { revalidate: 604800 },
    });

    if (!response.ok) return new NextResponse(`CDN returned ${response.status}`, { status: 502 });

    const buffer      = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':  contentType,
        // Browser caches for 7 days, CDN caches for 30 days
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable',
        'Vary':          'Accept',
      },
    });
  } catch (err) {
    return new NextResponse(`Error: ${err}`, { status: 500 });
  }
}