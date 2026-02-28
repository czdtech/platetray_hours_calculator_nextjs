#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { TRANSLATED_SLUGS } from "../src/i18n/translatedSlugs";

type Locale = "es" | "pt";

interface LocaleCoverage {
  locale: Locale;
  translatedSlugCount: number;
  markdownCount: number;
  coveragePercent: number;
  missingInTranslatedSlugs: string[];
  missingMarkdownForTranslatedSlug: string[];
  markdownWithoutTranslatedSlug: string[];
}

interface CoverageReport {
  generatedAt: string;
  totalEnglishPosts: number;
  englishSlugs: string[];
  localeCoverage: LocaleCoverage[];
  slugParity: {
    esOnly: string[];
    ptOnly: string[];
  };
}

const ROOT = process.cwd();
const BLOG_CONTENT_DIR = path.join(ROOT, "src/content/blog");
const EVIDENCE_DIR = path.join(ROOT, ".sisyphus/evidence");
const REPORT_PATH = path.join(EVIDENCE_DIR, "blog-translation-coverage.json");

function readMarkdownSlugs(locale: Locale): string[] {
  const localeDir = path.join(BLOG_CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  return fs
    .readdirSync(localeDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))
    .sort();
}

function readEnglishSlugs(): string[] {
  return fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))
    .filter((slug) => slug.toLowerCase() !== "readme")
    .sort();
}

function buildLocaleCoverage(locale: Locale, englishSlugs: string[]): LocaleCoverage {
  const translatedSlugs = [...TRANSLATED_SLUGS[locale]].sort();
  const markdownSlugs = readMarkdownSlugs(locale);

  const missingInTranslatedSlugs = englishSlugs.filter(
    (slug) => !TRANSLATED_SLUGS[locale].has(slug),
  );

  const missingMarkdownForTranslatedSlug = translatedSlugs.filter(
    (slug) => !markdownSlugs.includes(slug),
  );

  const markdownWithoutTranslatedSlug = markdownSlugs.filter(
    (slug) => !TRANSLATED_SLUGS[locale].has(slug),
  );

  const coveragePercent = Number(
    ((translatedSlugs.length / englishSlugs.length) * 100).toFixed(1),
  );

  return {
    locale,
    translatedSlugCount: translatedSlugs.length,
    markdownCount: markdownSlugs.length,
    coveragePercent,
    missingInTranslatedSlugs,
    missingMarkdownForTranslatedSlug,
    markdownWithoutTranslatedSlug,
  };
}

function run() {
  const englishSlugs = readEnglishSlugs();
  const totalEnglishPosts = englishSlugs.length;

  const esCoverage = buildLocaleCoverage("es", englishSlugs);
  const ptCoverage = buildLocaleCoverage("pt", englishSlugs);

  const esOnly = [...TRANSLATED_SLUGS.es].filter((slug) => !TRANSLATED_SLUGS.pt.has(slug)).sort();
  const ptOnly = [...TRANSLATED_SLUGS.pt].filter((slug) => !TRANSLATED_SLUGS.es.has(slug)).sort();

  const report: CoverageReport = {
    generatedAt: new Date().toISOString(),
    totalEnglishPosts,
    englishSlugs,
    localeCoverage: [esCoverage, ptCoverage],
    slugParity: {
      esOnly,
      ptOnly,
    },
  };

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("✅ Blog translation coverage report generated");
  console.log(`   Report: ${REPORT_PATH}`);
  console.log(`   EN total: ${totalEnglishPosts}`);
  console.log(
    `   ES: ${esCoverage.translatedSlugCount}/${totalEnglishPosts} (${esCoverage.coveragePercent}%)`,
  );
  console.log(
    `   PT: ${ptCoverage.translatedSlugCount}/${totalEnglishPosts} (${ptCoverage.coveragePercent}%)`,
  );

  const hasCoverageIssue =
    esCoverage.missingMarkdownForTranslatedSlug.length > 0 ||
    ptCoverage.missingMarkdownForTranslatedSlug.length > 0 ||
    esCoverage.markdownWithoutTranslatedSlug.length > 0 ||
    ptCoverage.markdownWithoutTranslatedSlug.length > 0 ||
    esOnly.length > 0 ||
    ptOnly.length > 0;

  if (hasCoverageIssue) {
    console.log("⚠️ Translation coverage integrity issues detected. Check report for details.");
  } else {
    console.log("✅ Translation slug/markdown integrity checks passed.");
  }
}

run();
