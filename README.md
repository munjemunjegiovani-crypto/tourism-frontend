# Tourism Frontend

Website for the Africa tourism platform (Cameroon first). Visitors pick a place, then see the hotels, restaurants and guides around it on a distance ruler, with tracked booking links.

All data comes from the separate API: [tourism-backend](https://github.com/munjemunjegiovani-crypto/tourism-backend). Run the backend first.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · English/French routes

## Run it locally (Ubuntu)

```bash
# 1. Start the backend in another terminal (see its README): npm run dev → http://localhost:4000

# 2. Frontend
git clone https://github.com/munjemunjegiovani-crypto/tourism-frontend.git
cd tourism-frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                    # http://localhost:3000
```

Opening <http://localhost:3000> sends you to `/en` or `/fr` depending on your browser language.

## Pages

| URL | Page |
| --- | --- |
| `/en`, `/fr` | Home: search, and regions listed north to south |
| `/en/attractions?q=&region=` | Search and filter places |
| `/en/attractions/:slug?type=hotel&radius=10` | A place, with nearby businesses on a distance ruler |
| `/en/businesses/:slug` | A business, with its booking link |

## Project structure

```
src/
  proxy.ts                   redirects / to /en or /fr
  app/[locale]/              all pages (layout, home, attractions, businesses)
  components/                SearchForm, AttractionRow, NearbyRuler, LocaleSwitch…
  lib/api.ts                 calls to the backend + response types
  lib/i18n.ts                English and French text
  app/globals.css            colours and fonts (Tailwind theme)
```

To add or change text, edit both the `en` and `fr` objects in `src/lib/i18n.ts`.

## Deploy (Vercel)

1. On [vercel.com](https://vercel.com): **Add New → Project** → import this repo.
2. Add the environment variable `NEXT_PUBLIC_API_URL` = your deployed backend URL (for example `https://tourism-backend.onrender.com`).
3. Deploy. Then add your Vercel URL to the backend's `CORS_ORIGIN`.

## Notes

- "Kamer Trails" is a working name; change it in `src/lib/i18n.ts` (`siteName`).
- Fonts are self-hosted from npm, so builds don't depend on Google Fonts.
- Pages work without JavaScript (search and filters are plain links and forms), which helps on slow mobile networks.
