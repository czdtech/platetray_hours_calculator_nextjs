## Cursor Cloud specific instructions

This is a single Next.js 15 application (Planetary Hours Calculator) — no monorepo, no Docker, no database required for local development.

### Quick reference

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000, uses Turbopack) |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests | `npm run test` (Vitest, 21 tests) |
| E2E tests | `npm run test:e2e` (Playwright — requires `npx playwright install` first) |
| Build | `npm run build` (runs `generate:blog-metadata` prebuild) |

### Caveats

- The workspace rules (`.cursorrules` / `CLAUDE.md`) say **do not run `npm run dev`** because the user runs it themselves in their local environment. In a Cursor Cloud context, you **must** start the dev server yourself to test changes — use `npm run dev` in background.
- No `.env` file is committed. The app works without any environment variables for core functionality (planetary hours calculation uses `suncalc` locally). Optional: `GOOGLE_MAPS_API_KEY` enables location search autocomplete; `KV_REST_API_URL` + `KV_REST_API_TOKEN` enable Vercel KV caching.
- The `prebuild` script (`npm run generate:blog-metadata`) must run before `npm run build`; this happens automatically via the `prebuild` npm lifecycle hook.
- Node.js 18+ required. The environment comes with Node 22 which works fine.
- When adding new blog articles, you must: (1) create the `.md` file in `src/content/blog/`, (2) add an entry to `src/data/blogPosts.ts` (required for `generateStaticParams` since `dynamicParams = false`), and (3) run `npm run generate:blog-metadata` to update `blogDates.json` and `blogRead.json`. The prebuild hook handles step 3 automatically during `npm run build`.
- City pages live at `/planetary-hours/[city]` and are defined by `src/data/cities.ts`. To add a new city, add an entry to the `cities` array — the route, sitemap, and index page pick it up automatically via `generateStaticParams` and the cities data module. The `Header` component accepts `activePage: "cities"` for these pages.
