# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZynTracker is a single-file, zero-dependency HTML app (`index.html`) that helps users taper off and quit Zyn nicotine pouches. There is no build step, no package manager, and no framework — everything lives in one file.

## Development

Open `index.html` directly in a browser (no server required). All state is persisted in `localStorage` under the key `zyn_tracker`.

To test with a server if needed:
```bash
python3 -m http.server 8080
```

## Architecture

The entire app is one HTML file with three sections:

1. **CSS** (`<style>`) — CSS custom properties defined on `:root` for the dark color palette; layout uses flexbox and CSS Grid.

2. **HTML** — Two top-level views toggled via `.hidden`:
   - `#setup` — initial onboarding form (quit date + daily average)
   - `#app` — the main tracker (stats grid, today card, history list, plan list)

3. **JavaScript** (`<script>`) — Vanilla JS, no modules. Key functions:
   - `buildPlan(startDate, quitDate, dailyAvg)` — generates taper phases by repeatedly halving `dailyAvg` until it reaches 0, then distributes days evenly across phases so the last phase lands on `quitDate`.
   - `getCurrentPhaseIndex(phases, today)` — returns which phase index applies to a given date string.
   - `render(state)` — full re-render of all UI from state; called after every mutation.
   - `addPouch()` / `undoPouch()` — mutate `state.log[today]` and call `render`.
   - `startJourney()` — validates setup form, writes initial state, switches views.

### State shape (stored in localStorage)
```json
{
  "startDate": "YYYY-MM-DD",
  "quitDate": "YYYY-MM-DD",
  "dailyAvg": 10,
  "log": { "YYYY-MM-DD": 3, "YYYY-MM-DD": 1 }
}
```

### Color classes
Count-based coloring uses `c-zero` (green), `c-good` (yellow), `c-near` (orange), `c-over` (red). The same palette drives progress bar classes and history badges (`badge-zero`, `badge-low`, `badge-mid`, `badge-high`).
