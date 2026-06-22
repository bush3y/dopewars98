# CLAUDE.md

Project guidance for working in this repo. The full product brief — north star,
visual fidelity rules, game data sourcing, architecture, and the phased plan —
lives in **[BRIEF.md](./BRIEF.md)**. Read it before making design decisions.

## What this is

A faithful web recreation of the classic Windows **dopewars** GTK client.
Modern guts (Vite + React + TS), original soul (98.css chrome + DSEG LED font).

The three "faithful" rules (see BRIEF §1): single window / no scrolling, no
emulator, no reskin. Modern features live behind the faithful core.

## Status

- **Phase 0 (static shell): DONE.** Desktop window matches the Day-1/Bronx
  screenshot; mobile portrait reflow renders the same data.
- **Phase 1 (core loop): DONE.** Seedable PRNG, deterministic market, reducer
  (buy/sell/travel/bank/repay), daily interest, market events with own flavor
  text, win on day 31 with net-worth score. Engine verified by
  `scripts/verify-engine.ts`.
- Next: **Phase 2 — encounters** (Officer Hardass/deputies, guns, health,
  fight/run, muggings, found bonuses). Keyed RNG per BRIEF §6.

## Commands

```bash
npm run dev      # dev server (http://localhost:5173, or next free port)
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
npm run lint     # eslint
```

## Architecture notes

- **All game rules belong in the reducer; components stay dumb** (BRIEF §4).
  Phase 0 feeds a static `SNAPSHOT` (`src/data/gameData.ts`) into the same dumb
  components Phase 1 will drive from reducer output (`GameSnapshot` in
  `src/data/types.ts` is the seam).
- **Every random draw goes through a seedable PRNG.** No bare `Math.random()`.
  This is load-bearing for the daily challenge (BRIEF §6) — honor it from the
  first line of Phase 1.
- **Desktop and mobile are sibling presentation layers over identical state**
  (`DesktopWindow` vs `MobileLayout`, switched by media query in `App.tsx`).
  Keep logic out of both.
- **Clean-room the data** (BRIEF §3): re-derive numbers, write our own flavor
  text. Do not paste GPL flavor strings.

## Layout of `src/`

- `data/` — `types.ts` (domain types + `GameSnapshot` seam), `gameData.ts`
  (drugs, locations), `economy.ts` (price ranges, interest, event flavor text),
  `menu.ts` (shared menu structure for desktop bar + mobile drawer).
- `engine/` — pure game logic, no React. `rng.ts` (seedable PRNG + coord hash),
  `market.ts` (deterministic price/event generation), `types.ts` (`GameState` +
  `Action`), `reducer.ts` (the state machine + `initialState`/`netWorth`/
  `spaceUsed`), `selectors.ts` (`toSnapshot`).
- `game/` — React glue. `GameContext.tsx` (`useReducer` + UI state: selection,
  open dialog), `menuActions.ts` (maps menu labels → actions).
- `components/` — dumb presentation: `Led`, `HealthBar`, `StatPanel`,
  `SubwayGrid`, `MarketPane`, `TrenchcoatPane`, `MenuBar`, `MobileDrawer`,
  `DesktopWindow`, `MobileLayout`, `Modal`, `GameDialogs`, and `dialogs/*`
  (Buy/Sell/Finances/Travel/Event/GameOver/NewGame).
- `hooks/useDragWindow.ts` — titlebar drag (not resizable, by design).
- `index.css` — all styling, layered on `98.css`. DSEG7 `@font-face` here;
  font files live in `public/fonts/` (SIL OFL, license included).
- `scripts/verify-engine.ts` — engine sanity check; run `npx tsx
  scripts/verify-engine.ts`.

## Gotchas

- This rolldown-vite version's CSS minifiers crash on our stylesheet, so
  `vite.config.ts` sets `build.cssMinify: false` (JS is still minified). Revisit
  when the toolchain updates.
