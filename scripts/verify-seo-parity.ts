#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { cities } from '../src/data/cities';
import { TRANSLATED_SLUGS } from '../src/i18n/translatedSlugs';
import { siteConfig } from '../src/config/seo';

type LocaleKey = 'en' | 'es' | 'pt' | 'x-default';

interface ParityCheck {
  check: string;
  status: 'pass' | 'fail';
  details: string;
  category: 'content' | 'http' | 'head' | 'sitemap' | 'reciprocity';
}

interface SeoReport {
  timestamp: string;
  baseUrl: string;
  sampledUrls: string[];
  checks: ParityCheck[];
  blockers: number;
  total: number;
}

interface PageHeadData {
  url: string;
  canonical: string | null;
  alternates: Record<string, string>;
}

const BASE_URL = normalizeUrl(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
const SEO_BASE_URL = normalizeUrl(siteConfig.url);

const report: SeoReport = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  sampledUrls: [],
  checks: [],
  blockers: 0,
  total: 0,
};

const pageCache = new Map<string, Promise<PageHeadData | null>>();

function addCheck(
  check: string,
  pass: boolean,
  details: string,
  category: ParityCheck['category'],
) {
  report.checks.push({ check, status: pass ? 'pass' : 'fail', details, category });
  report.total += 1;
  if (!pass) report.blockers += 1;
}

function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  parsed.hash = '';
  parsed.search = '';

  const normalizedPath = parsed.pathname === '/'
    ? '/'
    : parsed.pathname.replace(/\/+$/, '');

  return `${parsed.origin}${normalizedPath}`;
}

function toAbsoluteUrl(pathname: string): string {
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalizeUrl(new URL(withSlash, BASE_URL).toString());
}

function toSeoUrl(pathname: string): string {
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalizeUrl(new URL(withSlash, SEO_BASE_URL).toString());
}

function parseTagAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex = /([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)')/g;

  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(tag)) !== null) {
    const key = match[1].toLowerCase();
    const value = (match[3] ?? match[4] ?? '').trim();
    attributes[key] = value;
  }

  return attributes;
}

function parseHead(html: string, currentUrl: string): PageHeadData {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headHtml = headMatch ? headMatch[1] : html;
  const linkTags = headHtml.match(/<link\b[^>]*>/gi) ?? [];

  let canonical: string | null = null;
  const alternates: Record<string, string> = {};

  for (const tag of linkTags) {
    const attrs = parseTagAttributes(tag);
    const rel = (attrs.rel ?? '').toLowerCase();
    const href = attrs.href;

    if (!href) continue;
    const relTokens = rel.split(/\s+/).filter(Boolean);

    if (relTokens.includes('canonical')) {
      canonical = normalizeUrl(new URL(href, currentUrl).toString());
      continue;
    }

    if (relTokens.includes('alternate') && attrs.hreflang) {
      const key = attrs.hreflang.toLowerCase();
      alternates[key] = normalizeUrl(new URL(href, currentUrl).toString());
    }
  }

  return { url: normalizeUrl(currentUrl), canonical, alternates };
}

function parseSitemapAlternates(xml: string): Map<string, Record<string, string>> {
  const alternatesMap = new Map<string, Record<string, string>>();
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/gi) ?? [];

  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/i);
    if (!locMatch) continue;

    const loc = normalizeUrl(locMatch[1].trim());
    const languageMap: Record<string, string> = {};
    const links = block.match(/<xhtml:link\b[^>]*\/?\s*>/gi) ?? [];

    for (const link of links) {
      const attrs = parseTagAttributes(link);
      const hreflang = attrs.hreflang?.toLowerCase();
      const href = attrs.href;
      if (!hreflang || !href) continue;
      languageMap[hreflang] = normalizeUrl(href);
    }

    alternatesMap.set(loc, languageMap);
  }

  return alternatesMap;
}

function compareAlternateMaps(
  actual: Record<string, string>,
  expected: Record<string, string>,
): { pass: boolean; details: string } {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  const sameKeyCount = actualKeys.length === expectedKeys.length;
  const sameKeys = sameKeyCount && actualKeys.every((key, idx) => key === expectedKeys[idx]);

  if (!sameKeys) {
    return {
      pass: false,
      details: `Key mismatch. actual=${JSON.stringify(actualKeys)}, expected=${JSON.stringify(expectedKeys)}`,
    };
  }

  const mismatchedValues = expectedKeys.filter((key) => actual[key] !== expected[key]);
  if (mismatchedValues.length > 0) {
    return {
      pass: false,
      details: `Value mismatch on keys: ${mismatchedValues.join(', ')}. actual=${JSON.stringify(actual)}, expected=${JSON.stringify(expected)}`,
    };
  }

  return {
    pass: true,
    details: `Alternates match (${expectedKeys.join(', ')})`,
  };
}

async function fetchText(url: string): Promise<{ status: number; body: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal });
    const body = await response.text();
    return { status: response.status, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    addCheck(`HTTP fetch: ${url}`, false, message, 'http');
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getPageHeadData(url: string): Promise<PageHeadData | null> {
  const normalized = normalizeUrl(url);

  if (!pageCache.has(normalized)) {
    pageCache.set(normalized, (async () => {
      const fetched = await fetchText(normalized);
      if (!fetched) return null;

      addCheck(
        `HTTP status: ${normalized}`,
        fetched.status === 200,
        `status=${fetched.status}`,
        'http',
      );

      if (fetched.status !== 200) return null;
      return parseHead(fetched.body, normalized);
    })());
  }

  return pageCache.get(normalized) ?? null;
}

function buildExpectedAlternates(pathname: string, translatedSlug: string): Record<string, string> {
  const stripLocalePrefix = (value: string): { locale: 'en' | 'es' | 'pt'; basePath: string } => {
    if (value === '/es' || value.startsWith('/es/')) {
      return { locale: 'es', basePath: value === '/es' ? '/' : value.slice(3) };
    }

    if (value === '/pt' || value.startsWith('/pt/')) {
      return { locale: 'pt', basePath: value === '/pt' ? '/' : value.slice(3) };
    }

    return { locale: 'en', basePath: value };
  };

  const { basePath } = stripLocalePrefix(pathname);

  const allLocaleCluster = {
    en: toSeoUrl(basePath),
    es: toSeoUrl(basePath === '/' ? '/es' : `/es${basePath}`),
    pt: toSeoUrl(basePath === '/' ? '/pt' : `/pt${basePath}`),
    'x-default': toSeoUrl(basePath),
  };

  if (basePath === '/' || basePath === '/about' || basePath === '/blog') {
    return allLocaleCluster;
  }

  if (basePath.startsWith('/planetary-hours')) {
    return allLocaleCluster;
  }

  if (basePath === `/blog/${translatedSlug}`) {
    return allLocaleCluster;
  }

  if (basePath.startsWith('/blog/category/')) {
    return allLocaleCluster;
  }

  return {};
}

function getSamplePaths(): string[] {
  const translatedSlug = [...TRANSLATED_SLUGS.es][0] ?? 'venus-hour-guide';
  const blogContentDir = path.join(process.cwd(), 'src/content/blog');
  const untranslatedSlug = fs
    .readdirSync(blogContentDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''))
    .find((slug) => !TRANSLATED_SLUGS.es.has(slug) && !TRANSLATED_SLUGS.pt.has(slug))
    ?? 'what-are-planetary-hours';
  const citySlug = cities[0]?.slug ?? 'new-york';

  return [
    '/',
    '/es',
    '/pt',
    '/about',
    '/blog',
    '/blog/category/planet-hours',
    `/blog/${translatedSlug}`,
    `/blog/${untranslatedSlug}`,
    `/es/blog/${translatedSlug}`,
    '/es/blog/category/planet-hours',
    `/pt/blog/${translatedSlug}`,
    '/pt/blog/category/planet-hours',
    '/planetary-hours',
    `/planetary-hours/${citySlug}`,
    '/es/planetary-hours',
    `/es/planetary-hours/${citySlug}`,
    '/pt/planetary-hours',
    `/pt/planetary-hours/${citySlug}`,
  ];
}

function ensureAbsoluteAlternates(
  alternates: Record<string, string>,
): { pass: boolean; details: string } {
  const invalidKeys = Object.entries(alternates)
    .filter(([, value]) => !/^https?:\/\//.test(value))
    .map(([key]) => key);

  if (invalidKeys.length > 0) {
    return {
      pass: false,
      details: `Non-absolute alternate URLs on keys: ${invalidKeys.join(', ')}`,
    };
  }

  return {
    pass: true,
    details: 'All alternate URLs are absolute',
  };
}

function requiredLocaleKeys(pathname: string, translatedSlug: string): LocaleKey[] {
  const expected = buildExpectedAlternates(pathname, translatedSlug);
  return Object.keys(expected).sort() as LocaleKey[];
}

async function run() {
  const translatedSlug = [...TRANSLATED_SLUGS.es][0] ?? 'venus-hour-guide';
  const samplePaths = getSamplePaths();
  const sampleUrls = samplePaths.map((samplePath) => toAbsoluteUrl(samplePath));
  report.sampledUrls = sampleUrls;

  // Content source checks (still valuable guardrails)
  for (const slug of TRANSLATED_SLUGS.es) {
    const exists = fs.existsSync(path.join(process.cwd(), `src/content/blog/es/${slug}.md`));
    addCheck(`ES markdown exists: ${slug}`, exists, exists ? 'File found' : 'Missing markdown file', 'content');
  }

  for (const slug of TRANSLATED_SLUGS.pt) {
    const exists = fs.existsSync(path.join(process.cwd(), `src/content/blog/pt/${slug}.md`));
    addCheck(`PT markdown exists: ${slug}`, exists, exists ? 'File found' : 'Missing markdown file', 'content');
  }

  const esOnly = [...TRANSLATED_SLUGS.es].filter((slug) => !TRANSLATED_SLUGS.pt.has(slug));
  const ptOnly = [...TRANSLATED_SLUGS.pt].filter((slug) => !TRANSLATED_SLUGS.es.has(slug));
  addCheck(
    'ES/PT slug parity',
    esOnly.length === 0 && ptOnly.length === 0,
    esOnly.length === 0 && ptOnly.length === 0
      ? 'ES and PT translated slug sets are identical'
      : `ES-only=[${esOnly.join(', ')}], PT-only=[${ptOnly.join(', ')}]`,
    'content',
  );

  // Sitemap fetch + parse
  const sitemapFetch = await fetchText(toAbsoluteUrl('/sitemap.xml'));
  let sitemapAlternates = new Map<string, Record<string, string>>();
  if (!sitemapFetch) {
    addCheck('Sitemap fetch', false, 'Unable to fetch /sitemap.xml', 'sitemap');
  } else {
    addCheck(
      'Sitemap fetch status',
      sitemapFetch.status === 200,
      `status=${sitemapFetch.status}`,
      'sitemap',
    );

    if (sitemapFetch.status === 200) {
      sitemapAlternates = parseSitemapAlternates(sitemapFetch.body);
      addCheck(
        'Sitemap URL entries parsed',
        sitemapAlternates.size > 0,
        `entries=${sitemapAlternates.size}`,
        'sitemap',
      );
    }
  }

  const reciprocityClusterVisited = new Set<string>();

  for (const sampleUrl of sampleUrls) {
    const pathname = new URL(sampleUrl).pathname;
    const expectedCanonical = toSeoUrl(pathname);
    const expectedAlternates = buildExpectedAlternates(pathname, translatedSlug);
    const expectedKeys = requiredLocaleKeys(pathname, translatedSlug);

    const pageData = await getPageHeadData(sampleUrl);
    if (!pageData) {
      addCheck(`Head parse: ${sampleUrl}`, false, 'Page was not fetched successfully', 'head');
      continue;
    }

    // Canonical must exist and equal expected SEO URL (siteConfig.url + pathname).
    addCheck(
      `Canonical present: ${sampleUrl}`,
      pageData.canonical !== null,
      `canonical=${pageData.canonical ?? 'missing'}`,
      'head',
    );

    addCheck(
      `Canonical matches expected SEO URL: ${sampleUrl}`,
      pageData.canonical === expectedCanonical,
      `canonical=${pageData.canonical ?? 'missing'}, expected=${expectedCanonical}`,
      'head',
    );

    // Head alternates must match expectation.
    const headComparison = compareAlternateMaps(pageData.alternates, expectedAlternates);
    addCheck(
      `Head alternates match expected: ${sampleUrl}`,
      headComparison.pass,
      `${headComparison.details}; expectedKeys=${JSON.stringify(expectedKeys)}`,
      'head',
    );

    const absoluteCheck = ensureAbsoluteAlternates(pageData.alternates);
    addCheck(
      `Head alternates absolute URLs: ${sampleUrl}`,
      absoluteCheck.pass,
      absoluteCheck.details,
      'head',
    );

    // Sitemap alternates must match head alternates.
    const sitemapEntry = sitemapAlternates.get(expectedCanonical) ?? {};
    const sitemapVsHead = compareAlternateMaps(sitemapEntry, pageData.alternates);
    addCheck(
      `Sitemap/head alternates parity: ${sampleUrl}`,
      sitemapVsHead.pass,
      sitemapVsHead.details,
      'sitemap',
    );

    // x-default should be present when a locale cluster exists.
    const needsCluster = Object.keys(expectedAlternates).length > 0;
    const hasXDefaultInHead = !needsCluster || Object.prototype.hasOwnProperty.call(pageData.alternates, 'x-default');
    const hasXDefaultInSitemap = !needsCluster || Object.prototype.hasOwnProperty.call(sitemapEntry, 'x-default');

    addCheck(
      `Head x-default presence: ${sampleUrl}`,
      hasXDefaultInHead,
      hasXDefaultInHead ? 'x-default present or not required' : 'Missing x-default in head alternates',
      'head',
    );

    addCheck(
      `Sitemap x-default presence: ${sampleUrl}`,
      hasXDefaultInSitemap,
      hasXDefaultInSitemap ? 'x-default present or not required' : 'Missing x-default in sitemap alternates',
      'sitemap',
    );

    // Reciprocity: every alternate target should expose the exact same cluster map.
    if (needsCluster) {
      const clusterKey = JSON.stringify(
        Object.entries(expectedAlternates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => [key, value]),
      );

      if (reciprocityClusterVisited.has(clusterKey)) {
        continue;
      }

      reciprocityClusterVisited.add(clusterKey);

      for (const [hreflang, targetUrl] of Object.entries(expectedAlternates)) {
        const targetRuntimeUrl = toAbsoluteUrl(new URL(targetUrl).pathname);
        const targetPageData = await getPageHeadData(targetRuntimeUrl);

        if (!targetPageData) {
          addCheck(
            `Hreflang reciprocity fetch: ${targetRuntimeUrl}`,
            false,
            `Unable to fetch alternate target for ${hreflang}`,
            'reciprocity',
          );
          continue;
        }

        const reciprocityResult = compareAlternateMaps(targetPageData.alternates, expectedAlternates);
        addCheck(
          `Hreflang reciprocity cluster: ${targetUrl}`,
          reciprocityResult.pass,
          reciprocityResult.details,
          'reciprocity',
        );
      }
    }
  }

  const evidenceDir = path.join(process.cwd(), '.sisyphus/evidence');
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'task-9-seo-parity.json'), JSON.stringify(report, null, 2));

  console.log(`\nSEO Parity Report (${BASE_URL}): ${report.total} checks, ${report.blockers} blockers`);
  for (const check of report.checks) {
    console.log(`  ${check.status === 'pass' ? '✅' : '❌'} [${check.category}] ${check.check}`);
  }

  process.exit(report.blockers > 0 ? 1 : 0);
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : 'Unknown error';
  console.error(`\nSEO parity script crashed: ${message}`);
  process.exit(1);
});
