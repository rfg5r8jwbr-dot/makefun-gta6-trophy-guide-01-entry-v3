// render.js — one job: draw the checklist, the progress bar and the guide pane.
// It builds every node with DOM APIs and textContent, never innerHTML, so trophy
// text can never inject markup. Source links are plain <a> elements, never fetched.

import { gradeCounts, trophySpoilered, trophyVisible } from './filters.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', stranger: 'Stranger missions', activity: 'Activity',
  collectible: 'Collectible', robbery: 'Robbery', world: 'Open world',
  completion: 'Completion', platinum: 'Platinum',
};

/** Draw the progress line, the bar and the per-grade pills. */
export function renderProgress(trophies, earned, els) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  els.progressText.textContent = `${done} of ${total} earned — ${Math.round((done / total) * 100)}% to the platinum`;
  els.progressFill.style.width = `${(done / total) * 100}%`;
  els.progressBar.setAttribute('aria-valuenow', String(done));
  const counts = gradeCounts(trophies, earned);
  els.gradeCounts.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const [got, of] = counts[grade];
    const pill = document.createElement('span');
    pill.className = `grade-pill ${grade}`;
    const b = document.createElement('b');
    b.textContent = `${got}/${of}`;
    pill.append(document.createTextNode(`${GRADE_LABEL[grade]} `), b);
    els.gradeCounts.append(pill);
  }
}

/** Draw the trophy checklist for the current filters. Returns how many are shown. */
export function renderList(trophies, filters, earned, selectedId, els, callbacks) {
  els.list.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!trophyVisible(t, filters, earned)) continue;
    shown += 1;
    const spoilered = trophySpoilered(t, filters, earned);
    const card = document.createElement('article');
    card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    card.dataset.trophyId = String(t.id);

    const row = document.createElement('div');
    row.className = 'row1';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${spoilered ? 'this story trophy' : t.name} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      callbacks.onToggle(t.id);
    });
    const title = document.createElement('h3');
    title.textContent = spoilered ? 'Hidden story trophy — earn it to reveal' : t.name;
    row.append(box, title);
    card.append(row);

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = spoilered ? 'Spoiler hidden. Tick it off (or turn the spoiler toggle off) to see its name and description.' : t.description;
    card.append(desc);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const gradeTag = document.createElement('span');
    gradeTag.className = `tag grade-${t.grade}`;
    gradeTag.textContent = GRADE_LABEL[t.grade];
    meta.append(gradeTag);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABEL[t.kind] ?? t.kind;
    meta.append(kindTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-flag';
      hiddenTag.textContent = 'Hidden on PSN';
      meta.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'POSSIBLY MISSABLE';
      meta.append(missTag);
    }
    if (spoilered) {
      const spTag = document.createElement('span');
      spTag.className = 'tag spoiler-hidden';
      spTag.textContent = 'Spoiler hidden';
      meta.append(spTag);
    }
    card.append(meta);
    card.addEventListener('click', (event) => {
      if (event.target === box) return; // The checkbox has its own handler; don't re-render under it.
      callbacks.onSelect(t.id);
    });
    els.list.append(card);
  }
  if (shown === 0) {
    const empty = document.createElement('p');
    empty.id = 'empty';
    empty.textContent = 'No trophies match these filters. Try clearing the search or the missable-only filter — or check the About tab: there are 0 online trophies, so an “online” filter would always be empty.';
    els.list.append(empty);
  }
  return shown;
}

/** Draw the guide pane for one trophy, with its guide, missable note and cited sources. */
export function renderGuide(trophy, earned, els) {
  if (!trophy) return;
  const spoilered = els.hideSpoilers && trophy.kind === 'story' && !earned.has(trophy.id);
  els.guideTitle.textContent = spoilered ? 'Hidden story trophy' : trophy.name;
  els.guideDesc.textContent = spoilered ? 'Spoiler hidden — earn it or turn the spoiler toggle off to read its guide.' : trophy.description;
  els.guideBody.replaceChildren();
  if (spoilered) {
    const note = document.createElement('p');
    note.className = 'gtext';
    note.textContent = 'This is a story trophy, so its name, description and guide stay hidden until you earn it. That is the spoiler setting at work — it protects the chapter and mission names.';
    els.guideBody.append(note);
    return;
  }
  if (trophy.missable && trophy.missable_note) {
    const warn = document.createElement('p');
    warn.className = 'missable-note';
    warn.textContent = trophy.missable_note;
    els.guideBody.append(warn);
  }
  const text = document.createElement('p');
  text.className = 'gtext';
  text.textContent = trophy.guide;
  els.guideBody.append(text);
  if (trophy.sources && trophy.sources.length > 0) {
    const head = document.createElement('p');
    head.textContent = 'Sources for this guide:';
    const list = document.createElement('ul');
    list.className = 'sources';
    for (const s of trophy.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
      list.append(li);
    }
    els.guideBody.append(head, list);
  }
  const actions = document.createElement('div');
  actions.className = 'guide-actions';
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.id = 'guide-toggle';
  earnedBtn.textContent = earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => els.onGuideToggle(trophy.id));
  actions.append(earnedBtn);
  els.guideBody.append(actions);
}
