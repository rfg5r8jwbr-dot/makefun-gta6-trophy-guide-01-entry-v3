// store.js — one job: keep the earned set in localStorage and move it in and out as JSON.
// Progress never leaves the device except when the player exports it themselves.
export const STORAGE_KEY = 'leonida-ledger-earned-v1';
export const EXPORT_FILENAME = 'leonida-ledger-progress.json';

/** Load the earned trophy ids from localStorage; an unreadable value means an empty set. */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

/** Save the earned trophy ids to localStorage. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable (private mode): progress still works for this session.
  }
}

/** Toggle one trophy's earned state and persist it. Returns the new state. */
export function toggleEarned(earned, id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned(earned);
  return earned.has(id);
}

/** Serialise the earned set for export. */
export function exportJson(earned) {
  return JSON.stringify({ app: 'leonida-ledger', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2);
}

/** Parse an imported file's text into an earned set; throws on bad input. */
export function parseImport(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error('Import file must hold a JSON array of trophy ids, or an object with an "earned" array.');
  const ids = list.filter((n) => Number.isInteger(n));
  if (ids.length === 0 && list.length > 0) throw new Error('Import file holds no valid trophy ids.');
  return new Set(ids);
}
