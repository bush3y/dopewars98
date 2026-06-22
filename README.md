# Dope Wars

A faithful web recreation of the classic Windows **dopewars** GTK client —
modern guts (Vite + React + TypeScript), original soul (98.css window chrome +
the DSEG 7-segment LED font).

See **[BRIEF.md](./BRIEF.md)** for the full product brief and
**[CLAUDE.md](./CLAUDE.md)** for working notes.

## Status

**Phase 0 (static shell) — done.** The desktop window matches the original
Day-1 / Bronx screenshot; the mobile portrait reflow renders the same data. No
game logic yet — Phase 1 wires up the reducer and core loop.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173 (or next free port)
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
```

## Fonts / licensing

The DSEG7 LED font (`public/fonts/`) is SIL OFL — license included alongside the
files. Game data and flavor text are clean-room (see BRIEF §3), not derived from
the GPL original.
