#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

const REQUIRED_SECTIONS = [
  'Risk Closure Table',
  'Gate Command Results',
  'Lint',
  'Typecheck',
  'Unit Tests',
  'Build',
  'SEO Parity',
  'Key URL Sampling',
  'Reviewer Guidance',
];

const handoffPath = path.join(process.cwd(), '.sisyphus/evidence/pr-review-handoff.md');

if (!fs.existsSync(handoffPath)) {
  console.error('❌ Handoff document not found at .sisyphus/evidence/pr-review-handoff.md');
  process.exit(1);
}

const content = fs.readFileSync(handoffPath, 'utf-8');
let missing = 0;

for (const section of REQUIRED_SECTIONS) {
  const found = content.includes(section);
  console.log(`  ${found ? '✅' : '❌'} Section: ${section}`);
  if (!found) missing++;
}

const parityReport = path.join(process.cwd(), '.sisyphus/evidence/task-9-seo-parity.json');
const parityExists = fs.existsSync(parityReport);
console.log(`  ${parityExists ? '✅' : '❌'} SEO parity JSON report exists`);
if (!parityExists) missing++;

if (parityExists) {
  const parity = JSON.parse(fs.readFileSync(parityReport, 'utf-8'));
  const noBlockers = parity.blockers === 0;
  console.log(`  ${noBlockers ? '✅' : '❌'} SEO parity: ${parity.total} checks, ${parity.blockers} blockers`);
  if (!noBlockers) missing++;
}

console.log(`\nHandoff completeness: ${REQUIRED_SECTIONS.length + 2 - missing}/${REQUIRED_SECTIONS.length + 2} checks passed`);
process.exit(missing > 0 ? 1 : 0);
