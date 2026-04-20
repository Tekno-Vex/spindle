const fs   = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'rym-raw-combined-csv.json'), 'utf8')
);

function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
}

function cleanGenres(genreStr) {
  if (!genreStr) return [];
  // Genres are already clean and comma-separated from RYM directly
  // Just deduplicate and trim
  const seen   = new Set();
  const result = [];
  for (const g of genreStr.split(',')) {
    const trimmed = g.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      result.push(trimmed);
    }
  }
  return result.slice(0, 8); // keep up to 8 genres
}

function upgradeImageUrl(url) {
  if (!url) return '';
  return url;
}

function cleanBilingualField(str) {
  if (!str) return str;
  // If field contains a newline-replaced space between latin and non-latin scripts,
  // check if we can split on that boundary
  // Pattern: latin text SPACE non-latin text — keep whichever half has latin chars
  // This handles "Uchu Nippon Setagaya 宇宙 日本 世田谷" → "Uchu Nippon Setagaya"
  // And "Akira Yamaoka 山岡晃" → "Akira Yamaoka"
  // But leaves purely latin titles untouched
  const parts = str.split(' ');
  const latinParts = [];
  for (const part of parts) {
    // Stop collecting once we hit a part that is purely non-latin script
    if (/^[\u3000-\u9fff\uac00-\ud7af\u0400-\u04ff]+$/.test(part)) break;
    latinParts.push(part);
  }
  const latin = latinParts.join(' ').trim();
  // Only use the latin version if it's meaningful (more than 1 char)
  return latin.length > 1 ? latin : str;
}

let albums = raw.map(item => {
  const title  = cleanBilingualField(item.title  || 'Unknown');
  const artist = cleanBilingualField(item.artist || 'Unknown');
  const year    = extractYear(item.release_date);
  const genres  = cleanGenres(item.genres);
  const rymRank = item.calculated_rank;

  return {
    id: `album-${rymRank}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`,
    title,
    artist,
    year,
    release_date:  item.release_date || '',
    genres,
    vibes:         [],
    rym_rank:      rymRank,
    avg_rating:    parseFloat(item.average_rating) || 0,
    rating_count:  item.rating_count || null,
    cover_url:     upgradeImageUrl(item.cover_url),
    rym_url:       '',
    spotify_id:    null,
    apple_music_id: null,
    release_type:  'album',
    is_archival:   false,
  };
});

// Remove broken entries
albums = albums.filter(a =>
  a.title  !== 'Unknown' &&
  a.artist !== 'Unknown' &&
  a.year   !== null
);

albums.sort((a, b) => a.rym_rank - b.rym_rank);

console.log(`Clean albums ready: ${albums.length}`);
console.log('Sample entry:');
console.log(JSON.stringify(albums[0], null, 2));

fs.writeFileSync(
  path.join(__dirname, 'albums.json'),
  JSON.stringify(albums, null, 2)
);

console.log('Saved to albums.json');