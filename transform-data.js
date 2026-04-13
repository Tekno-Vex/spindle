const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'rym-raw-combined.json'), 'utf8')
);

function extractYear(yearStr) {
  if (!yearStr) return null;
  const match = String(yearStr).match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
}

let albums = raw.map((item) => {
  const title = item.album || 'Unknown';
  const artist = item.artist || 'Unknown';
  const year = extractYear(item.releaseDate);
  const avgRating = parseFloat(item.rating || 0);
  const rymRank = item.calculated_rank;
  const rymUrl = item.url || '';

  return {
    id: `album-${rymRank}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`,
    title,
    artist,
    year,
    genres: [],
    vibes: [],
    rym_rank: rymRank,
    avg_rating: avgRating,
    rating_count: null,
    cover_url: '',
    rym_url: rymUrl,
    spotify_id: null,
    apple_music_id: null,
    release_type: 'album',
    is_archival: false
  };
});

albums = albums.filter(a =>
  a.title !== 'Unknown' &&
  a.artist !== 'Unknown' &&
  a.year !== null
);

albums.sort((a, b) => a.rym_rank - b.rym_rank);

console.log(`Clean albums ready: ${albums.length}`);
console.log('Sample entry:');
console.log(JSON.stringify(albums[0], null, 2));

fs.writeFileSync(
  path.join(__dirname, 'albums.json'),
  JSON.stringify(albums, null, 2)
);

console.log('Saved to albums.json in spindle folder');