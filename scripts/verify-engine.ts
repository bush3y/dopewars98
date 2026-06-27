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
let dearOk = true;
let placeholderLeak = false;
for (let day = 1; day <= 2000; day++) {
  const r = generateMarket(7, day, 'ghetto');
  if (r.event) {
    events++;
    if (r.event.kind === 'expensive' && !['cocaine', 'heroin'].includes(r.event.drug)) dearOk = false;
    // Regression: the {drug} placeholder must be substituted before display.
    if (r.event.message.includes('{')) placeholderLeak = true;
  }
}
ok('expensive events only on dear drugs', dearOk);
ok('event messages have no unfilled {placeholder}', !placeholderLeak);
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

// 7. Phase 4 — daily challenge helpers.
const { todayKey, dailySeed, blockSparkline, makeShareString } = await import('../src/game/daily');

ok('date → seed (YYYYMMDD)', dailySeed('2026-06-26') === 20260626);
ok('todayKey format', /^\d{4}-\d{2}-\d{2}$/.test(todayKey()));

// Same daily seed → byte-identical world (the fairness property, BRIEF §6).
const seedA = dailySeed('2026-06-26');
ok(
  'same daily seed → identical start',
  JSON.stringify(initialState(seedA, 'daily')) === JSON.stringify(initialState(seedA, 'daily')),
);
ok(
  'different date → different start',
  JSON.stringify(initialState(dailySeed('2026-06-26'), 'daily')) !==
    JSON.stringify(initialState(dailySeed('2026-06-27'), 'daily')),
);

// Two players, same seed, different *choices* → same world, different scores.
function playChoices(seed: number, buyDay: boolean) {
  let s = initialState(seed, 'daily');
  if (buyDay) s = reducer(s, { type: 'BUY', drug: 'weed', qty: 20 });
  return s;
}
const p1 = playChoices(seedA, false);
const p2 = playChoices(seedA, true);
ok('same world, choices differ', JSON.stringify(p1.market) === JSON.stringify(p2.market) && p1.cash !== p2.cash);

// Share string: spoiler-free, contains outcome + score + a sparkline.
const spark = blockSparkline([1, 5, 3, 8, 2, 9]);
ok('sparkline non-empty block chars', spark.length === 6 && /[▁▂▃▄▅▆▇█]/.test(spark));
const share = makeShareString({ date: '2026-06-26', score: 12345, status: 'won', day: 31, history: [1, 9, 4] });
ok('share has date + score, no prices leaked', share.includes('2026-06-26') && share.includes('12,345') && !share.toLowerCase().includes('cocaine'));

// Win/lose objective: beat the loan shark (survive in the black).
const { outcome, isWin, prevKey } = await import('../src/game/daily');
ok('survive in the black = win', outcome('won', 5000) === 'win' && isWin('won', 5000));
ok('survive in the red = loss', outcome('won', -100) === 'red' && !isWin('won', -100));
ok('survive at zero = loss (not strictly positive)', outcome('won', 0) === 'red');
ok('death = busted (loss)', outcome('dead', 9999) === 'busted' && !isWin('dead', 9999));
ok('prevKey steps back a day (incl. month boundary)', prevKey('2026-07-01') === '2026-06-30');
const wonShare = makeShareString({ date: '2026-06-26', score: 12345, status: 'won', day: 31, history: [1, 9, 4] }, 5);
ok('win share shows streak + ✅', wonShare.includes('🔥 Streak: 5') && wonShare.includes('✅'));
const redShare = makeShareString({ date: '2026-06-26', score: -3500, status: 'won', day: 31, history: [1, -2] });
ok('red share shows -$ and 📉', redShare.includes('-$3,500') && redShare.includes('📉'));

// 8. Ranks + peak tracking.
const { rankName } = await import('../src/data/ranks');
ok('start (in the red) = Recruit', rankName(-3500) === 'Recruit');
ok('broke even = Lookout', rankName(0) === 'Lookout');
ok('$250k = Lieutenant', rankName(250_000) === 'Lieutenant');
ok('$700k = Captain (Captain > Lieutenant)', rankName(700_000) === 'Captain');
ok('$5M = Kingpin', rankName(5_000_000) === 'Kingpin');

// peakNetWorth tracks the max seen and never drops below it.
let pk = initialState(4242, 'classic');
ok('peak starts at initial net worth', pk.peakNetWorth === netWorth(pk));
let maxSeen = netWorth(pk);
let pkGuard = 0;
const pkDispatch = (action: Action) => {
  pk = reducer(pk, action);
  maxSeen = Math.max(maxSeen, netWorth(pk));
};
while (pk.status === 'playing' && pkGuard++ < 120) {
  if (pk.pendingEncounter) { pkDispatch({ type: 'RUN' }); continue; }
  if (pk.notice) { pkDispatch({ type: 'DISMISS_NOTICE' }); continue; }
  // Trade a little so net worth actually moves around.
  pkDispatch({ type: 'BUY', drug: 'weed', qty: 20 });
  pkDispatch({ type: 'SELL', drug: 'weed', qty: 20 });
  pkDispatch({ type: 'TRAVEL', location: pk.location === 'bronx' ? 'ghetto' : 'bronx' });
}
ok('peakNetWorth equals the max net worth ever seen', pk.peakNetWorth === maxSeen);
ok('peak >= final net worth', pk.peakNetWorth >= netWorth(pk));

// 9. Dynasty mode — no day cap; ends only on death; history is bounded.
let en = initialState(31337, 'dynasty');
en = { ...en, guns: { magnum: 3 } }; // armed so it survives a while
let enGuard = 0;
let reachedPast31 = false;
while (en.status === 'playing' && enGuard++ < 300) {
  if (en.pendingEncounter) { en = reducer(en, { type: 'FIGHT' }); continue; }
  if (en.notice) { en = reducer(en, { type: 'DISMISS_NOTICE' }); continue; }
  en = reducer(en, { type: 'TRAVEL', location: en.location === 'bronx' ? 'ghetto' : 'bronx' });
  if (en.day > 31 && en.status === 'playing') reachedPast31 = true;
}
ok('dynasty plays past day 31 (no day cap)', reachedPast31);
ok('dynasty ends only by death (never "won")', en.status !== 'won');
ok('dynasty net-worth history is bounded', en.netWorthHistory.length <= 60);
ok('dynasty price history is bounded', Math.max(...DRUGS_HISTORY_LENGTHS(en)) <= 60);

function DRUGS_HISTORY_LENGTHS(s: typeof en): number[] {
  return Object.values(s.priceHistory).map((h) => h.length);
}

// Classic still ends on day 31.
let cl = initialState(31337, 'classic');
let clGuard = 0;
while (cl.status === 'playing' && clGuard++ < 200) {
  if (cl.pendingEncounter) { cl = reducer(cl, { type: 'RUN' }); continue; }
  if (cl.notice) { cl = reducer(cl, { type: 'DISMISS_NOTICE' }); continue; }
  cl = reducer(cl, { type: 'TRAVEL', location: cl.location === 'bronx' ? 'ghetto' : 'bronx' });
}
ok('classic still caps at day 31', cl.day <= 31);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
