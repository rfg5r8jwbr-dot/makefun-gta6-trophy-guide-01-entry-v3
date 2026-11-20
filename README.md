# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=4q7hssxn)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rfg5r8jwbr-dot/makefun-gta6-trophy-guide-01-entry-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=4q7hssxn)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rfg5r8jwbr-dot/makefun-gta6-trophy-guide-01-entry-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=4q7hssxn)

An offline, static web app that guides you to the platinum in **Grand Theft Auto VI** (PlayStation 5) and tracks your progress. Built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01?ref=4q7hssxn).

## What it covers

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — with the official name, description and grade exactly as PlayStation publishes them.
- **A guide for every trophy in our own words**, each citing its sources (PowerPyx, Push Square, PlanetGTA6/Exophase, KeenGamer, GTABase, EGamers). Where a method is still unconfirmed, the guide says so instead of inventing one.
- **Exactly 1 possibly missable trophy**: Positive Mental Attitude (Lucia's Chapter 1 balcony meditation). It is flagged in the list, in a banner, and in the roadmap — and the guide notes it is still unconfirmed whether that meditation is required.
- **A 3-stage platinum roadmap** (~200 hours, one playthrough): story, 100% checklist, open-world clean-up.
- **A tracker**: checklist saved in localStorage, progress bar and per-grade counts, export/import of progress as JSON, filters by kind and grade, search, hide-earned, missable-only, and a spoiler toggle that hides unearned story trophies.
- **No online trophies**: all 55 are single-player and offline — the About tab says so outright.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The app is static files under `app/` and works with the network off; it fetches one local file (`data/trophies.json`) and nothing else.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the entry (exactly 55 trophies, grade split 1/2/6/46, 28 hidden, 1 missable, every guide non-empty with at least one https source, every app file and screenshot present and within size limits), copies `app/` and `screenshots/` to the output directory, and writes `dossier.json` with the vendored make.fun library.

## Layout

- `app/index.html` — page, tabs, controls, guide pane
- `app/style.css` — dark Vice City look, system fonts only, no images
- `app/app.js` — entry point: loads the data, wires controls, tabs and hash views
- `app/store.js` — localStorage progress, export/import
- `app/filters.js` — kind/grade/search/spoiler filtering
- `app/render.js` — checklist, progress bar, guide pane
- `app/roadmap.js` — the 3-stage platinum roadmap
- `app/data/trophies.json` — all 55 trophies with guides and cited sources
- `screenshots/` — 4 real renders of the app (checklist, guide, roadmap, filters)

## License

MIT — see `LICENSE`.
