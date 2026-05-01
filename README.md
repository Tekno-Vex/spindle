# Spindle

> 5,000 albums. Infinite discoveries.

A music discovery app that randomly serves albums from the Rate Your Music all-time top charts. Press Roll and get a rich album card — cover art, rating, genres, streaming links.

**Live:** [spindle-amber.vercel.app](https://spindle-amber.vercel.app/)

---

## What it does

- **Roll** — randomly discover albums from 5,000 RYM all-time chart records
- **Filter** — by era (year range slider), genre family, and minimum rating
- **Modes** — Blind Mode rating game, vs. Mode bracket tournament, Decade Safari
- **Detail view** — tracklist from MusicBrainz, streaming links, similar albums
- **User accounts** — sign in with Google to track heard albums, favorites, and roll history
- **Live Feed** — see what albums other users are discovering in real-time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel (free tier) |
| Data | Static albums.json — 5,000 RYM albums |

---

## Local Development

```bash
git clone https://github.com/Tekno-Vex/spindle.git
cd spindle
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
# Open http://localhost:3000
```

---

## Data Pipeline

The dataset lives at `src/data/albums.json` — 5,000 albums from the RYM all-time chart.

### Tools needed
- Chrome with Tampermonkey
- [dbeley/rym-userscripts](https://github.com/dbeley/rym-userscripts) chart CSV export
- Node.js

### Scripts
```
combine-csv.js      # Merge raw CSV page files into one JSON
transform-csv.js    # Reshape into Album schema
enrich-spotify.js   # Add Spotify IDs and cover art
```

### Quarterly Refresh (Jan, Apr, Jul, Oct)

1. Go to RYM all-time chart with live/compilation filter active
2. Scroll to bottom of each page before exporting (so cover art loads)
3. Export each page, name files `rym_alltime_p001.csv` through `p125.csv`
4. Run `node combine-csv.js` → `node transform-csv.js`
5. Run `node enrich-spotify.js` (skips already-enriched albums)
6. Copy `albums.json` to `src/data/albums.json`
7. Commit and push — Vercel redeploys automatically

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your production URL |

---

## Deployment

Vercel auto-deploys on every push to `main`. Add all environment variables in Vercel dashboard → Project → Settings → Environment Variables.

---

## License

MIT