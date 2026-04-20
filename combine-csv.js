const fs   = require('fs');
const path = require('path');

const dataFolder = path.join(process.env.USERPROFILE, 'OneDrive', 'Desktop', 'rym-data-csv');

function parseCSV(content) {
  const rows   = [];
  let current  = '';
  let inQuotes = false;
  let fields   = [];

  for (let i = 0; i < content.length; i++) {
    const ch   = content[i];
    const next = content[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      // Escaped quote
      current += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // End of row — skip \r\n pairs
      if (ch === '\r' && next === '\n') i++;
      fields.push(current.trim());
      current = '';
      if (fields.length > 1) rows.push(fields); // skip empty lines
      fields = [];
    } else if (ch === '\n' && inQuotes) {
      // Newline INSIDE a quoted field — replace with space
      current += ' ';
    } else {
      current += ch;
    }
  }

  // Handle last row if file doesn't end with newline
  if (current || fields.length) {
    fields.push(current.trim());
    if (fields.length > 1) rows.push(fields);
  }

  // Remove header row
  if (rows.length > 0) rows.shift();

  return rows;
}

function parseRatingCount(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s.endsWith('k')) return Math.round(parseFloat(s) * 1000);
  return parseInt(s) || null;
}

const allFiles = fs.readdirSync(dataFolder)
  .filter(f => f.endsWith('.csv'))
  .sort();

let allAlbums = [];

for (const file of allFiles) {
  const content = fs.readFileSync(path.join(dataFolder, file), 'utf8');

  const pageMatch  = file.match(/p(\d+)\.csv$/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : 1;

  const rows = parseCSV(content);

  rows.forEach((row, indexOnPage) => {
    // CSV columns: title, artist, release_date, genres, average_rating, number_of_votes, number_of_reviews, image_url
    const [title, artist, release_date, genres, average_rating, number_of_votes, number_of_reviews, image_url] = row;

    if (!title || !artist) return;

    // --- DEDUPLICATION LOGIC REMOVED HERE ---

    const calculatedRank = ((pageNumber - 1) * 40) + (indexOnPage + 1);

    // Filter out base64 placeholder images
    const coverUrl = image_url && !image_url.startsWith('data:') ? image_url : '';

    allAlbums.push({
      title,
      artist,
      release_date:   release_date || '',
      genres:         genres || '',
      average_rating: average_rating || '',
      rating_count:   parseRatingCount(number_of_votes),
      cover_url:      coverUrl,
      calculated_rank: calculatedRank,
    });
  });
}

// Sort the final array by the rank so everything stays in order
allAlbums.sort((a, b) => a.calculated_rank - b.calculated_rank);

console.log(`Total albums extracted: ${allAlbums.length}`);
console.log('Sample:');
console.log(JSON.stringify(allAlbums[0], null, 2));

fs.writeFileSync(
  path.join(__dirname, 'rym-raw-combined-csv.json'),
  JSON.stringify(allAlbums, null, 2)
);

console.log('Saved to rym-raw-combined-csv.json');