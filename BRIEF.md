# Dope Wars — Faithful Web Recreation: Project Brief

> The north star, the look, the data sourcing, the architecture, and a phased
> build plan. Sections marked **TODO(Mike)** are open decisions left deliberately.

---

## 1. North Star

A faithful recreation of the classic Windows **dopewars** GTK client (the 1.5.x /
1.6.x era — the green LED readouts, sunken panels, subway travel grid). Modern
guts, original soul.

**The three rules that define "faithful":**
1. **Single window, no scrolling.** The entire game lives in one roughly-square
   panel. If something needs scrolling, the layout is wrong.
2. **No emulator.** This is native web (React/TS), not a Windows VM in a canvas.
3. **No reskin.** It should look like the screenshot, not like a generic
   "retro-themed" mobile game.

Modern additions are welcome but live *behind* the faithful core — opt-in, never
altering the default first impression.

**Reference source of truth:** the original GPL code at
`https://github.com/benmwebb/dopewars`. The `-a` ("antique") config is the
closest to the original Drug Wars feel; use it as the data baseline.

---

## 2. Visual Fidelity

Do **not** hand-roll Win9x chrome. Use these:

- **Window chrome:** [`98.css`](https://jdan.github.io/98.css/) — titlebar,
  beveled gray frame, sunken panels, tabs, chunky buttons for free.
- **LED readouts** (Cash / Bank / Debt / Guns): the **DSEG** 7-segment font
  (free, SIL OFL). Green-on-black for Cash/Bank, red for Debt, yellow for Guns —
  match the screenshot's color coding.
- **Health bar:** solid blue fill with centered "100%" text.
- **Two list panes:** "Available drugs" (name + price) and "Trenchcoat. Space:
  X/100" (name + qty + price). Sunken-panel styling, no scrollbars by design.

### Desktop window (decided)
Fixed-size window centered on a desktop-style backdrop, **draggable** by the
titlebar, **not resizable**. Build the window as a positioned component so the
backdrop/drag toggle behind a flag.

### Mobile layout (decided — modern portrait reflow, NOT a scaled square)
Genuine portrait reflow that uses full screen height while keeping the soul (LED
stats, drug list, the loop). **Same game state and reducer** as desktop — only
the layout components differ.

- **Top:** fixed compact status header — Cash / Bank / Debt LED row.
- **Middle:** one pane at a time (Market **or** Trenchcoat), full width, fills
  height. Toggle/tab to switch. 11 drugs fits in portrait — no-scroll survives.
- **Bottom:** fixed action bar — Travel / Buy / Sell / Finances.

Desktop = faithful square window. Mobile = its own composition over identical
logic.

---

## 3. Game Data — Extract, Don't Invent

Pull from the reference source (config + source), not from memory:

- **Drugs:** Cocaine, Hashish, Heroin, Ecstasy, Smack, Opium, Crack, Peyote,
  Shrooms, Speed, Weed — base price ranges, cheap/common vs expensive/rare.
- **Price events:** "market flooded — cheap X" / "addicts pay top dollar for Y"
  spikes, probabilities and multipliers.
- **Guns:** names, prices, damage/space.
- **Locations:** the six boroughs + subway adjacency.
- **Economy constants:** starting cash (2,000), starting debt (5,500), days (31),
  loan-shark daily interest, bank daily interest, trenchcoat capacity (100).
- **Encounters:** Officer Hardass + deputy mechanics, muggings, found
  drugs/cash, buy/sell/run combat loop.
- **Flavor text:** the encounter and event strings.

> **Licensing — clean-room.** Copyright doesn't protect game mechanics/rules
> (ideas) or numbers (facts) — re-implementing the loop and re-using
> price/interest/capacity constants is not a derivative work. The protected part
> is the creative **flavor text**. **Decision: clean-room it** — re-derive the
> numbers, **write our own flavor text**. Then nothing triggers GPL and every
> monetization door stays open. (App Store + GPL is a known conflict — the VLC
> case — sharper under GPLv3; clean-room avoids it.)

---

## 4. Architecture

Stack: **Vite + React + TypeScript**. Pure client-side, no backend for v1.

- **State:** a single `useReducer` game-state machine. Named actions — `TRAVEL`,
  `BUY`, `SELL`, `DEPOSIT`, `WITHDRAW`, `REPAY_DEBT`, `ADVANCE_DAY`,
  `RESOLVE_ENCOUNTER`, `NEW_GAME`, `LOAD_GAME`. All rules in the reducer;
  components stay dumb.
- **Randomness:** **every** random draw goes through a seedable PRNG (mulberry32).
  No bare `Math.random()` anywhere. True from the first commit — it's what makes
  the daily challenge possible and is miserable to retrofit (§6).
- **Persistence:** `localStorage` for save slots and high scores.
- **No backend** unless/until we want an online leaderboard.

### State shape (sketch — refine in code)
```ts
type GameState = {
  seed: number;
  mode: 'classic' | 'daily';
  day: number; maxDays: number;
  location: LocationId;
  cash: number; bank: number; debt: number;
  health: number; guns: GunHolding[];
  capacity: number; trenchcoat: Inventory;
  market: Record<DrugId, number>;
  priceHistory: Record<DrugId, number[]>;
  pendingEncounter: Encounter | null;
  log: GameEvent[];
  status: 'playing' | 'won' | 'busted' | 'dead';
};
```

---

## 5. Modern Additions (opt-in, behind the faithful core)

- **Daily seeded challenge** — the headline feature (§6).
- **End-of-run net-worth chart** — cash + bank − debt over 31 days.
- **Price-history sparklines** in the market pane.
- **Multiple save slots.**
- **Sound toggle** — wire to original WAVs (mind licensing).

None change the default cold-open.

---

## 6. Daily Challenge — Design

Wordle-fair: everyone plays the identical 31 days, scores on the same world,
shares a result. Seed is the date (`YYYYMMDD`).

The random world must be **derived deterministically per coordinate, independent
of player actions**, or streams desync:

- **Market prices** for a day = pure function of `hash(seed, day, location)`.
- **Whether an encounter triggers** = pure function of `hash(seed, day, location)`.
- **Encounter resolution** uses a sub-stream keyed by
  `hash(seed, day, location, round)`. Deterministic, but the player's *choices*
  decide how far into the stream they go.

Every player's world is byte-identical; only decisions differ.

- **Score:** final net worth = `cash + bank − debt`.
- **Share string:** compact, spoiler-free.
- **Leaderboard:** out of scope for v1. **TODO(Mike).**

---

## 7. Build Phases

- **Phase 0 — Shell.** Vite + React + TS scaffold. Static window matching the
  screenshot. No logic. Goal: it *looks* right. ✅ DONE
- **Phase 1 — Core loop.** Extracted data. Travel, buy, sell, bank, repay,
  advance day, interest, price regen. No encounters. Win/lose on day 31. Seedable
  PRNG wired from the start. ✅ DONE
- **Phase 2 — Encounters.** Officer Hardass / deputies, guns, health, fight/run,
  muggings, found bonuses. Keyed RNG per §6. ✅ DONE
- **Phase 3 — Persistence & polish.** Save slots, high scores, net-worth chart,
  sparklines, sound toggle. ✅ DONE
- **Phase 4 — Daily challenge.** Date-seeded mode, deterministic world, share. ✅ DONE
- **Phase 5 — iOS.** Capacitor wrap. Portrait reflow (§8).

---

## 8. iOS Considerations

- **Wrapper:** Capacitor — reuses the web build.
- **Portrait layout:** DECIDED — modern portrait reflow (§2), same state/reducer.
- **App Store content risk:** Apple is strict about drug content/naming. Keep
  theming a thin layer so a build *could* swap surface text/names without touching
  logic. **TODO(Mike).**
- **Licensing:** clean-room (§3) removes the GPL/App Store conflict.

---

## 9. Explicit Non-Goals / Constraints

- No scrolling in the default desktop layout. Mobile shows one pane at a time.
- No emulated Windows environment.
- No generic "retro" reskin — match the real chrome.
- Keep the desktop layout roughly square.
- Faithful text and numbers over invented ones.
- No backend in v1.

---

## 10. Open Decisions — TODO(Mike)

1. ~~Licensing approach~~ **DECIDED: clean-room.** §3
2. Online leaderboard backend — if/when. §6
3. ~~iOS portrait reflow vs scale~~ **DECIDED: portrait reflow.** §2, §8
4. App Store theme — ship original (review risk) vs swappable theme layer. §8
5. Which original version to reference for mechanics (1.5.x vs 1.6.2). §1
