# Spindle

> 5,000 albums. Infinite discoveries.

A music discovery web app that randomly serves albums from the Rate Your Music all-time top charts. Press Roll and get a rich album card — cover art, rating, genres, streaming links.

**Live URL:** [your Vercel URL here]

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free tier)
- **Data:** Static albums.json — 5,000 RYM all-time chart albums
- **Cover art:** Proxied server-side via /api/cover route

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

No environment variables needed to run locally.

---

## Data Pipeline

The dataset lives at `src/data/albums.json`. It was built using this pipeline:

### Tools needed
- Chrome with Tampermonkey installed
- dbeley/rym-userscripts chart CSV export userscript
- Node.js

### Scripts (all in repo root)
- `combine-csv.js` — merges all raw CSV page files into one JSON
- `transform-csv.js` — reshapes raw data into the Album schema
- `enrich-spotify.js` — adds Spotify IDs to each album

### Quarterly Refresh (January, April, July, October)

**Step 1 — Collect fresh CSV files**
1. Go to https://rateyourmusic.com/charts/top/album/all-time/separate:live/
2. Make sure you are logged in to RYM
3. Scroll all the way to the bottom of the page (so all cover art loads)
4. Click the CSV export button added by the userscript
5. Rename the file to rym_alltime_p001.csv
6. Move it to a folder called rym-data-csv on your Desktop
7. Go to page 2: /separate:live/1/ and repeat
8. Continue through all 125 pages naming files p001 through p125

**Step 2 — Run the pipeline**
```bash
node combine-csv.js
node transform-csv.js
```

**Step 3 — Patch any albums with missing years**
```bash
node -e "const a=require('./albums.json'); console.log('Missing year:', a.filter(x=>!x.year).length)"
```
Manually add years for any missing entries using the patch script pattern from the original setup.

**Step 4 — Run Spotify enrichment**
```bash
node enrich-spotify.js
```
This skips albums that already have a spotify_id so it only processes new entries.

**Step 5 — Copy to project**
```bash
copy albums.json src\data\albums.json
```

**Step 6 — Deploy**
```bash
git add .
git commit -m "Data refresh: [Month Year]"
git push
```

### Important notes
- Never overwrite albums.json without running the full pipeline — partial updates corrupt the dataset
- The position field in scraped data is always 1-40 per page and is ignored — rank is calculated from filename
- RYM's CDN blocks direct browser image requests — all cover art goes through the /api/cover proxy
- Spotify enrichment preserves RYM cover art and genres — Spotify data is only used for spotify_id

---

## Environment Variables

No environment variables needed for the app to run.

For Spotify enrichment (run locally only, never commit credentials):
- SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are pasted directly into enrich-spotify.js
- Register your app at https://developer.spotify.com/dashboard

---

## Project Structure
spindle/
├── src/
│   ├── app/
│   │   ├── api/cover/route.ts   # Image proxy for RYM CDN
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AlbumCard.tsx
│   │   ├── Masthead.tsx
│   │   ├── RollButton.tsx
│   │   ├── SlotAnimation.tsx
│   │   └── YearTimeline.tsx
│   ├── data/
│   │   └── albums.json          # 5,000 albums — source of truth
│   └── types.ts
├── combine-csv.js               # Pipeline step 1
├── transform-csv.js             # Pipeline step 2
├── enrich-spotify.js            # Pipeline step 3
└── next.config.ts

---

## Data Refresh Cadence

Quarterly — January, April, July, October. Each refresh takes approximately 2.5 hours of manual CSV collection plus 10 minutes of script runtime.