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
  text, win on day 31 with net-worth score.
- **Phase 2 (encounters): DONE.** Deterministic arrival encounters — Officer
  Hardass + deputies (fight/run gunfight, keyed per round), muggings, found
  cash/drugs; Dan's Gun Shop (guns take coat space, add combat power); health
  and death ('dead' status).
- **Phase 3 (persistence & polish): DONE.** localStorage auto-save/restore +
  3 named save slots + high-score table (`game/storage.ts`), end-of-run
  net-worth chart, per-drug price sparklines (priceHistory in state), and a
  synthesized-SFX sound toggle (`game/sound.ts`, Web Audio, no audio files).
- **Phase 4 (daily challenge): DONE.** Date-seeded mode (seed = today's date,
  `game/daily.ts`); same world for everyone, only choices differ; play-once per
  date with a spoiler-free share string (outcome + net worth + block-char
  net-worth sparkline). Results in localStorage (`storage.ts`). Engine + daily
  helpers verified by `scripts/verify-engine.ts`.
  - **Three modes** (Mode menu, check marks the active one; shown in title bar +
    coloured footer/mobile badge): **Classic** (`classic`, the 31-day run),
    **Dynasty** (`dynasty`, no day cap — ends only on death; `maxDays` ignored,
    history windowed to 60 entries), **Daily** (`daily`). `requestNewGame(mode)`
    drives the New Game confirm; New Game / Game Over replay the same mode
    (daily falls back to classic).
  - Daily is **resume-not-restart**: starting today's run commits you; the
    in-progress daily is persisted separately (`saveDailyGame`/`loadDailyGame`)
    so leaving and returning resumes it, and it locks once finished. This blocks
    save-scumming a deterministic world.
  - **Daily objectives** (`game/objectives.ts`): a pool of bonus side-quests;
    each daily seed deterministically picks **3** (same for everyone), checked
    live against a **run-stats** layer (`RunStats` on GameState: visited,
    gunsBought, maxGuns, fightsWon, biggestSale, maxSpaceUsed, maxBank; plus
    peakNetWorth for rank ones). They're **bonus stars — never gate the win**.
    Checklist via View → Daily Objectives and a footer `⭐ N/3` button; the count
    rides the share string. Recorded in DailyResult on finish.
  - **Win/lose objective** (`outcome()` in `daily.ts`, both modes): WIN =
    survive to day 31 in the black (net worth > 0); LOSS = died, or survived in
    the red. Surfaced in the Game Over title/copy, the share string (✅/📉/💀),
    and high scores. A **daily win streak** (`recordStreak`, Wordle-style:
    consecutive winning days; a loss or skipped day resets it) shows on the
    result/share. The win bar is one function — easy to retune (e.g. a par)
    later.
- Next: **Phase 5 — iOS** (Capacitor wrap; the mobile portrait layout is ready).
  See BRIEF §7–§8.

## Environment note

The repo lives at `~/projects/dw`, deliberately **outside** iCloud-synced
`~/Documents`. It used to live under `~/Documents`, where iCloud's background
sync caused phantom Vite reloads, `tsc -b` hangs, slow `vite build`, and git
lock timeouts. Keep it out of `~/Documents`/`~/Desktop`. (If it ever ends up
back under iCloud, `tsc --noEmit -p tsconfig.app.json` typechecks without the
build-info write that hangs.)

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
  `guns.ts` (gun stats), `combat.ts` (encounter tuning + flavor text),
  `cities.ts` (cosmetic city skins — relabel the 6 location slots + transport
  word; default New York; prices/rules identical), `ranks.ts` (crime-family
  ranks by net worth: Recruit→Kingpin, `rankName(netWorth)`), `menu.ts` (shared
  menu structure for desktop bar + mobile drawer).
- `engine/` — pure game logic, no React. `rng.ts` (seedable PRNG + coord hash),
  `market.ts` (deterministic price/event generation), `encounters.ts`
  (deterministic arrival encounters + combat round resolvers), `types.ts`
  (`GameState` + `Action`), `reducer.ts` (the state machine + `initialState`/
  `netWorth`/`spaceUsed`), `selectors.ts` (`toSnapshot`).
- `game/` — React glue. `GameContext.tsx` (`useReducer` + UI state + persistence
  + scores + settings), `menuActions.ts` (maps menu labels → actions),
  `storage.ts` (versioned localStorage: current game / slots / scores /
  settings), `sound.ts` (Web Audio SFX).
- `components/` — dumb presentation: `Led`, `HealthBar`, `StatPanel`,
  `SubwayGrid`, `MarketPane`, `TrenchcoatPane`, `MenuBar`, `MobileDrawer`,
  `DesktopWindow`, `MobileLayout`, `Modal`, `GameDialogs`, and `dialogs/*`
  (Buy/Sell/Finances/Travel/Notice/Encounter/GunShop/GameOver/NewGame).
- `hooks/useDragWindow.ts` — titlebar drag (not resizable, by design).
- `index.css` — all styling, layered on `98.css`. DSEG7 `@font-face` here;
  font files live in `public/fonts/` (SIL OFL, license included).
- `scripts/verify-engine.ts` — engine sanity check; run `npx tsx
  scripts/verify-engine.ts`.

## Gotchas

- This rolldown-vite version's CSS minifiers crash on our stylesheet, so
  `vite.config.ts` sets `build.cssMinify: false` (JS is still minified). Revisit
  when the toolchain updates.
