// filters.js — one job: decide which trophies a filter state shows.
// Kinds: story, stranger, activity, collectible, robbery, world, completion, platinum.
// Grades: platinum, gold, silver, bronze. Spoilers hide unearned story trophies.

/** The current filter state, read from the controls. */
export function readFilterState(controls) {
  return {
    query: controls.search.value.trim().toLowerCase(),
    kind: controls.kind.value,
    grade: controls.grade.value,
    hideEarned: controls.hideEarned.checked,
    missableOnly: controls.missableOnly.checked,
    hideSpoilers: controls.spoiler.checked,
  };
}

/** True when a trophy passes every active filter. `earned` is the set of earned ids. */
export function trophyVisible(trophy, filters, earned) {
  const isEarned = earned.has(trophy.id);
  if (filters.hideEarned && isEarned) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.query) {
    const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!hay.includes(filters.query)) return false;
  }
  return true;
}

/** True when a trophy's name and description must be hidden behind the spoiler toggle. */
export function trophySpoilered(trophy, filters, earned) {
  return filters.hideSpoilers && trophy.kind === 'story' && !earned.has(trophy.id);
}

/** Count earned trophies per grade for the progress pills. */
export function gradeCounts(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    if (!counts[t.grade]) continue;
    counts[t.grade][1] += 1;
    if (earned.has(t.id)) counts[t.grade][0] += 1;
  }
  return counts;
}
