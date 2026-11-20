// Leonida Ledger — a GTA 6 trophy guide and tracker for make.fun competition gta6-trophy-guide-01.
// The app is plain static files under app/ (ES modules, CSS, one JSON data file, no build step),
// served locally with `node serve.ts` at http://localhost:8080. This program hands it in: it copies
// app/ and screenshots/ from beside this file to the output directory and writes dossier.json there
// with the vendored make.fun library, after validating the entry the way the scorer will.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_SCREENSHOT_BYTES = 256 * 1024;

// --- validate the entry before copying anything -------------------------------------------
function fail(message) {
  throw new Error(`Leonida Ledger build refused: ${message}`);
}

const trophiesPath = join(here, 'app', 'data', 'trophies.json');
let trophiesDoc;
try {
  trophiesDoc = JSON.parse(readFileSync(trophiesPath, 'utf8'));
} catch (err) {
  fail(`app/data/trophies.json does not parse: ${err.message}`);
}
const trophies = trophiesDoc.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  fail(`expected exactly 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'no array'}`);
}
const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const t of trophies) {
  if (typeof t.name !== 'string' || t.name.trim() === '') fail(`a trophy has no name (id ${t.id})`);
  if (typeof t.guide !== 'string' || t.guide.trim() === '') fail(`trophy "${t.name}" has no guide`);
  if (!Array.isArray(t.sources) || t.sources.length === 0) fail(`trophy "${t.name}" cites no source`);
  for (const s of t.sources) {
    if (typeof s.url !== 'string' || !s.url.startsWith('https://')) fail(`trophy "${t.name}" has a bad source URL`);
  }
  grades[t.grade] = (grades[t.grade] ?? 0) + 1;
}
if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
  fail(`grade split is ${JSON.stringify(grades)}, expected 1 platinum, 2 gold, 6 silver, 46 bronze`);
}
if (trophies.filter((t) => t.hidden).length !== 28) fail('expected exactly 28 hidden trophies');
if (trophies.filter((t) => t.missable).length !== 1) fail('expected exactly 1 missable trophy');
if (trophies.some((t) => t.online)) fail('no trophy may be online: all 55 are offline single-player');

const appFiles = ['index.html', 'style.css', 'app.js', 'store.js', 'filters.js', 'render.js', 'roadmap.js'];
for (const file of appFiles) {
  const p = join(here, 'app', file);
  if (!existsSync(p) || statSync(p).size === 0) fail(`app/${file} is missing or empty`);
}

// The guide must work with the network off: no app page, stylesheet or script may name a remote
// address. The only https URLs the entry may hold are the cited source links inside
// app/data/trophies.json (plain <a> links, never fetched at run time).
const remoteRef = /(?:https?:)?\/\/[^\s"'<>]+|https?:|fetch\(\s*['"`]https?/i;
for (const file of ['index.html', 'style.css', 'app.js', 'store.js', 'filters.js', 'render.js', 'roadmap.js']) {
  const text = readFileSync(join(here, 'app', file), 'utf8')
    .replaceAll("xmlns='http://www.w3.org/2000/svg'", ''); // An SVG namespace name, not a fetch.
  if (remoteRef.test(text)) fail(`app/${file} names a remote address; the app must load nothing over the network`);
}
const trophyText = readFileSync(trophiesPath, 'utf8');
if (/http:\/\//.test(trophyText)) fail('app/data/trophies.json holds a non-https link');

const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((f) => !f.startsWith('.')).sort();
if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}`);
for (const shot of shots) {
  const p = join(shotsDir, shot);
  const size = statSync(p).size;
  if (size === 0 || size > MAX_SCREENSHOT_BYTES) fail(`screenshots/${shot} is ${size} bytes (limit ${MAX_SCREENSHOT_BYTES})`);
}

// --- copy and write the dossier ------------------------------------------------------------
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`Leonida Ledger built: 55 trophies (${grades.platinum} platinum, ${grades.gold} gold, ${grades.silver} silver, ${grades.bronze} bronze; 28 hidden; 1 possibly missable), ${shots.length} screenshots, dossier written to ${join(out, 'dossier.json')}`);
