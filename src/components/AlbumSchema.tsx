interface Props {
  album: {
    title: string;
    artist: string;
    year: number | null;
    avg_rating: number;
    genres: string[];
    cover_url: string;
    rym_url: string;
  };
}

export default function AlbumSchema({ album }: Props) {
  const schema = {
    '@context':    'https://schema.org',
    '@type':       'MusicAlbum',
    'name':        album.title,
    'byArtist':    { '@type': 'MusicGroup', 'name': album.artist },
    'datePublished': album.year?.toString(),
    'genre':       album.genres,
    'aggregateRating': {
      '@type':       'AggregateRating',
      'ratingValue': album.avg_rating,
      'bestRating':  '5',
      'worstRating': '1',
    },
    ...(album.cover_url ? { 'image': album.cover_url } : {}),
    ...(album.rym_url   ? { 'url':   album.rym_url }   : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}