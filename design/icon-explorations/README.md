# App icon explorations

Design mockups from the Phase 5 app-icon session. Kept for when we revisit the
logo (we shipped a first pass, not a final).

## What shipped
`master-SHIPPED.html` renders the current icon: a neon-green **subway line with
three "$" stations** (transit-bend V3, descending). The 1024px source it
produces lives at `../../assets/icon.png`; the generated iOS set is in
`../../ios/App/App/Assets.xcassets/`.

## The exploration, in order
1. `01-first-concepts` — black LED "$", Win98 gray, mini-window. (Liked black LED but felt too "iTerm".)
2. `02-led-branded` — LED "$" + teal "98" branding, "$98" readout, Win98 window.
3. `03-subway-concepts` — first subway-map idea: paper / neon / minimal.
4. `04-neon-map-cleanup` — neon map with spacing fixed + legibility ladder.
5. `05-minimal-polished` — polished single-line "minimal route".
6. `06-transit-bend-compare` — plain V3 vs **transit-bend V3** (the winner).
7. `07-shipped-on-homescreen` — the shipped icon on the simulator home screen.

## Ideas noted to try next time
- Flip the line to **ascend** (bottom-left → top-right) — reads as profit up, not down.
- A **paper/light** map version (cream MTA look) for contrast with the dark one.
- A proper **dark splash** (the auto-generated light splash puts the dark logo on white).

## How to re-render
Each `.html` is self-contained. Render to PNG with headless Chrome:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --allow-file-access-from-files \
  --force-device-scale-factor=2 --window-size=1120,700 \
  --screenshot=out.png "file://$PWD/06-transit-bend-compare.html"
```

Some sheets `@font-face` the DSEG7 seven-segment font by absolute path
(`public/fonts/DSEG7Classic-Bold.woff2`); adjust if the repo moves.
To regenerate the iOS icon set from a new master: overwrite `assets/icon.png`
(1024×1024, square, no alpha) then `npx @capacitor/assets generate --ios`.
