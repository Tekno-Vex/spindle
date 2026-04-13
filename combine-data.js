const fs = require('fs');
const path = require('path');

const dataFolder = path.join(process.env.USERPROFILE, 'OneDrive', 'Documents', 'spindle', 'rym-data');

const allFiles = fs.readdirSync(dataFolder)
  .filter(f => f.endsWith('.json'))
  .sort();

let allAlbums = [];
let seen = new Set();

for (const file of allFiles) {
  const content = fs.readFileSync(path.join(dataFolder, file), 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.log(`Skipping ${file} - could not parse`);
    continue;
  }

  const pageMatch = file.match(/p(\d+)\.json$/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : 1;

  const albums = data.albums || [];

  albums.forEach((album, indexOnPage) => {
    const key = `${album.artist}-${album.album}`.toLowerCase().trim();

    if (!seen.has(key) && album.artist && album.album) {
      seen.add(key);

      const calculatedRank = ((pageNumber - 1) * 40) + (indexOnPage + 1);

      allAlbums.push({
        ...album,
        calculated_rank: calculatedRank
      });
    }
  });
}

allAlbums.sort((a, b) => a.calculated_rank - b.calculated_rank);

console.log(`Total unique albums: ${allAlbums.length}`);

fs.writeFileSync(
  path.join(__dirname, 'rym-raw-combined.json'),
  JSON.stringify(allAlbums, null, 2)
);

console.log('Saved to Desktop/rym-raw-combined.json');