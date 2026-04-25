import type { MetadataRoute } from 'next';
import albumsData from '@/data/albums.json';

type Album = { rym_rank: number };

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spindle-amber.vercel.app';
  const albums  = albumsData as Album[];

  const albumUrls = albums.map(album => ({
    url:              `${siteUrl}/?album=${album.rym_rank}`,
    lastModified:     new Date('2026-01-01'),
    changeFrequency:  'monthly' as const,
    priority:         0.6,
  }));

  return [
    {
      url:             siteUrl,
      lastModified:    new Date(),
      changeFrequency: 'daily' as const,
      priority:        1.0,
    },
    ...albumUrls,
  ];
}