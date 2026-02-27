# PR Review Handoff — SEO i18n Locale Routing

**Generated:** 2026-02-27  
**Branch:** `cursor/development-environment-setup-13c1`

---

## Risk Closure Table

| Task | Description | Status |
|------|-------------|--------|
| 1 | Centralize route policy (`routePolicy.ts`) | ✅ Done |
| 2 | Fix locale switch path resolution | ✅ Done |
| 3 | Fix blog slug translation detection | ✅ Done |
| 4 | Fix hreflang / article alternates | ✅ Done |
| 5 | Fix category page locale fallback | ✅ Done |
| 6 | Fix city page locale routing | ✅ Done |
| 7 | Fix EN-only legal pages (privacy/terms) | ✅ Done |
| 8 | Add locale navigation regression tests | ✅ Done |
| 9 | Create SEO parity verification script | ✅ Done |
| 10 | Generate PR reviewer handoff evidence | ✅ Done |

---

## Gate Command Results

### Lint
```
npm run lint → exit 0
3 pre-existing @typescript-eslint/no-explicit-any warnings (not introduced by this PR)
```

### Typecheck
```
npm run typecheck → exit 0
tsc --noEmit: no errors
```

### Unit Tests
```
npm run test → exit 0
Test Files  12 passed (12)
     Tests  67 passed (67)
New test files:
  - tests/unit/blogLinkBuilder.spec.ts (8 tests)
  - tests/unit/articleAlternates.spec.ts (3 tests)
```

### Build
```
npm run build → exit 0
Generating static pages (391/391) — no errors
```

### SEO Parity
```
npx tsx scripts/verify-seo-parity.ts → exit 0
53 checks, 0 blockers
ES: 13 translated slugs, all with markdown files
PT: 13 translated slugs, all with markdown files
No orphan files detected
ES/PT slug sets are identical
```

---

## Key URL Sampling (data-layer verified)

| URL Pattern | Locale | Expected | Verified |
|-------------|--------|----------|----------|
| `/blog/venus-hour-guide` → ES | es | `/es/blog/venus-hour-guide` | ✅ Unit test |
| `/blog/what-are-planetary-hours` → ES | es | `/es/blog` (fallback) | ✅ Unit test |
| `/es/blog/venus-hour-guide` → EN | en | `/blog/venus-hour-guide` | ✅ Unit test |
| `/planetary-hours/tokyo` → PT | pt | `/pt/planetary-hours/tokyo` | ✅ Unit test |
| `/blog/category/planet-hours` → ES | es | `/es/blog` (fallback) | ✅ Unit test |
| `/privacy` → ES | es | `/privacy` (EN-only) | ✅ Unit test |
| `/terms` → PT | pt | `/terms` (EN-only) | ✅ Unit test |
| Article alternates for `venus-hour-guide` | all | en/es/pt/x-default | ✅ Unit test |
| Article alternates for untranslated slug | all | `undefined` | ✅ Unit test |

---

## Reviewer Guidance

### Suggested review order

1. **`src/i18n/routePolicy.ts`** — Central route policy. All locale routing logic converges here. Review `TRANSLATED_SLUGS`, `resolveLocaleSwitchPath`, `toLocalizedPath`, `isSlugTranslated`.

2. **`src/utils/seo/articleAlternates.ts`** — Uses `isSlugTranslated` from route policy to generate hreflang alternates. Small file, straightforward.

3. **`tests/unit/blogLinkBuilder.spec.ts`** — Regression tests for link building across locales. 8 cases covering translated/untranslated slugs, category fallback, city pages, locale switching.

4. **`tests/unit/articleAlternates.spec.ts`** — Regression tests for SEO alternates generation. 3 cases covering translated, untranslated, and x-default.

5. **`tests/unit/localeRoutePolicy.spec.ts`** — Pre-existing comprehensive test suite (35 tests) for route policy functions.

6. **`scripts/verify-seo-parity.ts`** — CI-ready data-layer verification. Checks markdown file existence matches slug registration. Run with `npx tsx scripts/verify-seo-parity.ts`.

7. **Content files** — `src/content/blog/es/*.md` (13 files) and `src/content/blog/pt/*.md` (13 files). Spot-check a few for correct frontmatter.

### What to look for

- **No functional changes to existing route handlers** — Tasks 1-7 were completed prior; this PR adds tests and verification only.
- **Test coverage** — New tests cover the exact scenarios that were previously broken.
- **Parity script** — Can be integrated into CI to prevent slug/markdown drift.
