# Africa Discover (tourism-frontend)

**Explore Africa. Experience the Extraordinary.**

The website for Africa Discover, a 2D tourism discovery platform for Cameroon and the rest of Africa. It's built with Next.js 16, React 19, TypeScript and Tailwind CSS v4, and it gets all its data from the separate [`tourism-backend`](../tourism-backend) API (Express + PostgreSQL).

## Pages

| Page | URL |
| --- | --- |
| Home | `/` |
| Explore (filters + categories) | `/explore` |
| All destinations | `/destinations` |
| Destination details | `/destinations/cameroon/mount-cameroon` |
| Countries | `/countries` |
| Country details | `/countries/cameroon` |
| Experiences | `/experiences` |
| Experience details | `/experiences/african-safari` |
| Interactive map | `/map` |
| Travel guide | `/guide` |
| Article | `/guide/safety` |
| Search results | `/search?q=waterfalls near Douala` |
| Favorites | `/favorites` |
| Trip planner | `/trip`, `/trip/:id` |
| Profile | `/profile` |
| Log in / Sign up | `/login`, `/signup` |
| About, help, privacy, terms | `/about` |
| 404 | any unknown URL |

## Highlights

- **Search:** smart search with live suggestions ("Kenya" suggests Nairobi, Maasai Mara and more).
- **Near me:** "Use my current location", or pick a city. If the browser refuses location, the site says so and carries on.
- **Map:** no paid map API. Africa is drawn as SVG from Natural Earth data, with layers for destinations, hotels, restaurants, markets and transport.
- **Favorites:** work without an account (saved in the browser) and move into your account when you sign up.
- **Trip planner:** add, remove and reorder stops, set days and notes, and see the route, distance and estimated length. Starts from a "My Cameroon Adventure" example.
- **Themes:** light theme in forest green, sand and gold, plus a classic dark theme.
- **Built to standards:** responsive from 375 px to 1440 px; keyboard and screen-reader friendly; SEO metadata, sitemap and robots.

## Run it locally

Start the backend first (see its README), then:

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

For a production build: `npm run build && npm start`. Keep the API running during the build, because some pages read from it.

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Address of the tourism-backend API, e.g. `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Public address of this site, used for canonical URLs, Open Graph and the sitemap |

## How it fits together

- Pages are React Server Components. They call the API through `src/lib/api.ts`, and public data is cached for 5 minutes.
- Logging in sets an httpOnly cookie (`ad_session`) on this site. Server actions in `src/app/actions.ts` forward it to the API, so page scripts never see the token.
- Photos come from Wikimedia Commons with credits. Places without a photo show a calm placeholder, never a fake picture.

```
src/
  app/            Routes (one folder per page), server actions, sitemap, robots
  components/     Navbar, Footer, cards, filters, map, gallery, forms…
  lib/            API client, types, formatting, shared styles
```

## Note on the data

This is a prototype. Seeded reviews are labelled "Sample review", hotels and restaurants marked "Demo listing" are fictional, and real places (airports, markets) show no ratings yet.
