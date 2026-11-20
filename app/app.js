// app.js — the entry point: loads data/trophies.json, wires the controls, tabs and
// the guide pane together, and keeps the checklist in sync with localStorage.
// It fetches one local file (data/trophies.json) and nothing else at run time.

import { loadEarned, saveEarned, toggleEarned, exportJson, parseImport, EXPORT_FILENAME } from './store.js';
import { readFilterState } from './filters.js';
import { renderList, renderProgress, renderGuide } from './render.js';
import { renderRoadmap } from './roadmap.js';

const $ = (id) => document.getElementById(id);
const els = {
  list: $('list'),
  progressText: $('progress-text'),
  progressBar: $('progress-bar'),
  progressFill: $('progress-fill'),
  gradeCounts: $('grade-counts'),
  guideTitle: $('guide-title'),
  guideDesc: $('guide-desc'),
  guideBody: $('guide-body'),
  roadmap: $('roadmap'),
  about: $('about'),
  controls: $('controls'),
  search: $('search'),
  kind: $('kind'),
  grade: $('grade'),
  hideEarned: $('hide-earned'),
  missableOnly: $('missable-only'),
  spoiler: $('spoiler'),
};
els.hideSpoilers = true;
els.onGuideToggle = (id) => {
  toggleEarned(earned, id);
  rerender();
};

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
let earned = loadEarned();
let selectedId = 28; // Open on Positive Mental Attitude: the one missable trophy.

function currentFilters() {
  return readFilterState({
    search: els.search, kind: els.kind, grade: els.grade,
    hideEarned: els.hideEarned, missableOnly: els.missableOnly, spoiler: els.spoiler,
  });
}

function rerender() {
  const filters = currentFilters();
  els.hideSpoilers = filters.hideSpoilers;
  renderProgress(trophies, earned, els);
  renderList(trophies, filters, earned, selectedId, els, {
    onToggle: (id) => {
      const nowEarned = toggleEarned(earned, id);
      if (els.hideEarned.checked) { rerender(); return; }
      // Update in place instead of rebuilding the list, so the checkbox the
      // player just clicked is not replaced under their cursor.
      const card = document.querySelector(`[data-trophy-id="${id}"]`);
      if (card) card.classList.toggle('earned', nowEarned);
      renderProgress(trophies, earned, els);
      renderGuide(byId.get(selectedId), earned, els);
    },
    onSelect: (id) => { selectedId = id; rerender(); },
  });
  renderGuide(byId.get(selectedId), earned, els);
  const hash = location.hash;
  if (hash.startsWith('#guide-')) {
    const id = Number(hash.slice(7));
    if (byId.has(id)) {
      selectedId = id;
      renderGuide(byId.get(id), earned, els);
    }
  }
}

function showView(view) {
  const checklist = view === 'checklist';
  els.list.hidden = !checklist;
  document.querySelector('#guide-pane').hidden = !checklist;
  els.controls.hidden = !checklist;
  $('missable-banner').hidden = !checklist;
  els.roadmap.hidden = view !== 'roadmap';
  els.about.hidden = view !== 'about';
  $('tab-checklist').setAttribute('aria-selected', String(checklist));
  $('tab-roadmap').setAttribute('aria-selected', String(view === 'roadmap'));
  $('tab-about').setAttribute('aria-selected', String(view === 'about'));
  if (view === 'roadmap') renderRoadmap(els.roadmap);
}

$('tab-checklist').addEventListener('click', () => showView('checklist'));
$('tab-roadmap').addEventListener('click', () => showView('roadmap'));
$('tab-about').addEventListener('click', () => showView('about'));

for (const control of [els.search, els.kind, els.grade, els.hideEarned, els.missableOnly, els.spoiler]) {
  control.addEventListener('input', rerender);
  control.addEventListener('change', rerender);
}

$('export').addEventListener('click', () => {
  const blob = new Blob([exportJson(earned)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = EXPORT_FILENAME;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const next = parseImport(await file.text());
    earned = new Set([...next].filter((id) => byId.has(id)));
    saveEarned(earned);
    rerender();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  event.target.value = '';
});

$('missable-jump').addEventListener('click', () => {
  selectedId = 28;
  els.missableOnly.checked = false;
  els.spoiler.checked = false;
  showView('checklist');
  rerender();
  document.querySelector(`[data-trophy-id="28"]`)?.scrollIntoView({ block: 'center' });
});

if (location.hash === '#roadmap') showView('roadmap');
else if (location.hash === '#about') showView('about');
rerender();
