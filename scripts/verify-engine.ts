// Throwaway engine sanity check. Run: npx tsx scripts/verify-engine.ts
import { generateMarket } from '../src/engine/market';
import { initialState, reducer, netWorth, spaceUsed } from '../src/engine/reducer';
import type { Action } from '../src/engine/types';

let failures = 0;
const ok = (label: string, cond: boolean) => {
  console.log(`${cond ? '✓' : '✗'} ${label}`);
  if (!cond) failures++;
};

// 1. Determinism: same coordinate → identical market, regardless of call order.
const a = generateMarket(12345, 7, 'manhattan');
const b = generateMarket(12345, 7, 'manhattan');
ok('same (seed,day,loc) → identical prices', JSON.stringify(a) === JSON.stringify(b));

const c = generateMarket(12345, 8, 'manhattan');
ok('different day → different prices', JSON.stringify(a.prices) !== JSON.stringify(c.prices));

const d = generateMarket(99999, 7, 'manhattan');
ok('different seed → different prices', JSON.stringify(a.prices) !== JSON.stringify(d.prices));

// 2. Prices land in their configured ranges.
const m = generateMarket(42, 3, 'brooklyn', false);
ok('cocaine within range', m.prices.cocaine >= 15000 && m.prices.cocaine <= 29000);
ok('ecstasy within range', m.prices.ecstasy >= 11 && m.prices.ecstasy <= 60);

// 3. Events fire deterministically and only on `expensive`/`cheap` drugs.
let events = 0;
for (let day = 1; day <= 2000; day++) {
  const r = generateMarket(7, day, 'ghetto');
  if (r.event) {
    events++;
    if (r.event.kind === 'expensive')
      ok('expensive event on dear drug', ['cocaine', 'heroin'].includes(r.event.drug));
  }
}
ok(`event rate ~18% (got ${(events / 2000 * 100).toFixed(1)}%)`, events > 280 && events < 440);

// 4. Reducer playthrough.
let s = initialState(2024, 'classic');
ok('starts day 1, $2000, debt 5500', s.day === 1 && s.cash === 2000 && s.debt === 5500);

const dispatch = (action: Action) => (s = reducer(s, action));

// Buy as much weed as fits/affords, then check space + cash bookkeeping.
const weedPrice = s.market.weed;
const cashBefore = s.cash;
dispatch({ type: 'BUY', drug: 'weed', qty: 999 });
const bought = s.inventory.weed?.qty ?? 0;
ok('buy clamps to room/cash', bought > 0 && bought <= 100);
ok('cash debited correctly', s.cash === cashBefore - bought * weedPrice);
ok('space tracks holdings', spaceUsed(s) === bought);

// Bank + loan-shark interest on travel.
dispatch({ type: 'DEPOSIT', amount: 100 });
const debtBefore = s.debt;
const bankBefore = s.bank;
dispatch({ type: 'TRAVEL', location: 'manhattan' });
ok('day advanced on travel', s.day === 2 && s.location === 'manhattan');
ok('debt grew 10%', s.debt === Math.round(debtBefore * 1.1));
ok('bank grew 5%', s.bank === Math.round(bankBefore * 1.05));

// Can't sell more than held; can't overspend.
dispatch({ type: 'SELL', drug: 'weed', qty: 9999 });
ok('sell clamps to held (now empty)', !s.inventory.weed);

// Run to the end, resolving encounters (run from fights, dismiss notices).
// Status flips to won on the final day's travel — unless the cops get you.
let guard = 0;
while (s.status === 'playing' && guard++ < 300) {
  if (s.pendingEncounter) { dispatch({ type: 'RUN' }); continue; }
  if (s.notice) { dispatch({ type: 'DISMISS_NOTICE' }); continue; }
  dispatch({ type: 'TRAVEL', location: s.location === 'bronx' ? 'ghetto' : 'bronx' });
}
ok('game resolves to won or dead by day 31', (s.status === 'won' || s.status === 'dead') && s.day <= 31);
ok('net worth is finite number', Number.isFinite(netWorth(s)));
console.log(`  final: day ${s.day}, status ${s.status}, net worth ${netWorth(s).toLocaleString()}`);

// 5. Full reproducibility: same seed + same action script → identical end state.
function play(seed: number) {
  let g = initialState(seed, 'daily');
  const script: Action[] = [
    { type: 'BUY', drug: 'speed', qty: 10 },
    { type: 'TRAVEL', location: 'ghetto' },
    { type: 'SELL', drug: 'speed', qty: 5 },
    { type: 'TRAVEL', location: 'coney-island' },
    { type: 'DEPOSIT', amount: 50 },
  ];
  for (const act of script) g = reducer(g, act);
  return g;
}
ok('identical seed+actions → identical state', JSON.stringify(play(555)) === JSON.stringify(play(555)));
ok('different seed → different state', JSON.stringify(play(555)) !== JSON.stringify(play(556)));

// 6. Phase 2 — encounters & combat.
const { generateArrival, combatPower, gunSpace } = await import('../src/engine/encounters');

const a1 = generateArrival(321, 9, 'brooklyn', 0.8, 5000);
const a2 = generateArrival(321, 9, 'brooklyn', 0.8, 5000);
ok('arrival is deterministic per coord', JSON.stringify(a1) === JSON.stringify(a2));

// Carrying more dope raises encounter odds: sample many coords at 0 vs full load.
let lowHits = 0, highHits = 0;
for (let day = 2; day <= 600; day++) {
  if (generateArrival(9, day, 'bronx', 0, 2000).cops || generateArrival(9, day, 'bronx', 0, 2000).instant) lowHits++;
  if (generateArrival(9, day, 'bronx', 1, 2000).cops || generateArrival(9, day, 'bronx', 1, 2000).instant) highHits++;
}
ok(`heavier load → more encounters (${lowHits} < ${highHits})`, highHits > lowHits);

// Gun shop: buying takes cash + space, adds combat power.
let g = initialState(2024, 'classic');
// Force the shop open for the test by finding a coord, or just buy via reducer
// guard: ensure gunShopOpen on the current state; if not, flip it for the test.
g = { ...g, gunShopOpen: true };
const cashBeforeGun = g.cash;
g = reducer(g, { type: 'BUY_GUN', gun: 'pistol' });
ok('gun purchase debits cash', g.cash === cashBeforeGun - 850);
ok('gun owned', (g.guns.pistol ?? 0) === 1);
ok('gun adds combat power', combatPower(g.guns) === 2);
ok('gun takes coat space', gunSpace(g.guns) === 4 && spaceUsed(g) === 4);

// Combat: drive a fight to resolution deterministically; outcome reproducible.
function fightOut(seed: number) {
  let s = initialState(seed, 'daily');
  s = { ...s, guns: { magnum: 3 } }; // well-armed
  // March until a cops encounter appears, then FIGHT to the end.
  let guard = 0;
  while (s.status === 'playing' && guard++ < 200) {
    if (s.pendingEncounter) { s = reducer(s, { type: 'FIGHT' }); continue; }
    s = reducer(s, { type: 'TRAVEL', location: s.location === 'bronx' ? 'ghetto' : 'bronx' });
    if (s.notice) s = reducer(s, { type: 'DISMISS_NOTICE' });
  }
  return s;
}
ok('fight path reproducible', JSON.stringify(fightOut(7777)) === JSON.stringify(fightOut(7777)));

// Death is reachable: unarmed, always FIGHT, across many seeds someone dies.
function diesUnarmed(seed: number) {
  let s = initialState(seed, 'daily');
  let guard = 0;
  while (s.status === 'playing' && guard++ < 300) {
    if (s.pendingEncounter) { s = reducer(s, { type: 'FIGHT' }); continue; }
    s = reducer(s, { type: 'TRAVEL', location: s.location === 'bronx' ? 'ghetto' : 'bronx' });
    if (s.notice) s = reducer(s, { type: 'DISMISS_NOTICE' });
  }
  return s.status === 'dead';
}
let deaths = 0;
for (let seed = 1; seed <= 80; seed++) if (diesUnarmed(seed)) deaths++;
ok(`death is reachable (${deaths}/80 unarmed runs died)`, deaths > 0);

// Can't act mid-fight: BUY is ignored while an encounter is pending.
function midFight(seed: number) {
  let s = initialState(seed, 'daily');
  let guard = 0;
  while (s.status === 'playing' && !s.pendingEncounter && guard++ < 200) {
    s = reducer(s, { type: 'TRAVEL', location: s.location === 'bronx' ? 'ghetto' : 'bronx' });
    if (s.notice) s = reducer(s, { type: 'DISMISS_NOTICE' });
  }
  return s;
}
let blocked = false;
for (let seed = 1; seed <= 60 && !blocked; seed++) {
  const s = midFight(seed);
  if (s.pendingEncounter) {
    const after = reducer(s, { type: 'BUY', drug: 'weed', qty: 5 });
    blocked = after === s; // unchanged reference: action ignored
  }
}
ok('actions blocked during a gunfight', blocked);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
