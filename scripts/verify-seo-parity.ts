#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { TRANSLATED_SLUGS } from '../src/i18n/routePolicy';

interface ParityCheck {
  check: string;
  status: 'pass' | 'fail';
  details: string;
}

const report = {
  timestamp: new Date().toISOString(),
  checks: [] as ParityCheck[],
  blockers: 0,
  total: 0,
};

function addCheck(check: string, pass: boolean, details: string) {
  report.checks.push({ check, status: pass ? 'pass' : 'fail', details });
  report.total++;
  if (!pass) report.blockers++;
}

// Check 1: ES translated slugs have markdown files
for (const slug of TRANSLATED_SLUGS.es) {
  const exists = fs.existsSync(path.join(process.cwd(), `src/content/blog/es/${slug}.md`));
  addCheck(`ES markdown exists: ${slug}`, exists, exists ? 'File found' : 'MISSING file');
}

// Check 2: PT translated slugs have markdown files
for (const slug of TRANSLATED_SLUGS.pt) {
  const exists = fs.existsSync(path.join(process.cwd(), `src/content/blog/pt/${slug}.md`));
  addCheck(`PT markdown exists: ${slug}`, exists, exists ? 'File found' : 'MISSING file');
}

// Check 3: No orphan translation files (files without slug registration)
for (const locale of ['es', 'pt'] as const) {
  const dir = path.join(process.cwd(), `src/content/blog/${locale}`);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const slug = file.replace('.md', '');
      const registered = TRANSLATED_SLUGS[locale].has(slug);
      addCheck(`${locale.toUpperCase()} slug registered: ${slug}`, registered,
        registered ? 'Registered in TRANSLATED_SLUGS' : 'ORPHAN file not in TRANSLATED_SLUGS');
    }
  }
}

// Check 4: ES and PT have same translated slug set
const esOnly = [...TRANSLATED_SLUGS.es].filter(s => !TRANSLATED_SLUGS.pt.has(s));
const ptOnly = [...TRANSLATED_SLUGS.pt].filter(s => !TRANSLATED_SLUGS.es.has(s));
addCheck('ES/PT slug parity', esOnly.length === 0 && ptOnly.length === 0,
  esOnly.length > 0 || ptOnly.length > 0
    ? `ES-only: ${esOnly.join(', ')}; PT-only: ${ptOnly.join(', ')}`
    : 'ES and PT have identical translated slug sets');

// Write report
const evidenceDir = path.join(process.cwd(), '.sisyphus/evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(
  path.join(evidenceDir, 'task-9-seo-parity.json'),
  JSON.stringify(report, null, 2)
);

console.log(`\nSEO Parity Report: ${report.total} checks, ${report.blockers} blockers`);
report.checks.forEach(c => {
  console.log(`  ${c.status === 'pass' ? '✅' : '❌'} ${c.check}`);
});

process.exit(report.blockers > 0 ? 1 : 0);
