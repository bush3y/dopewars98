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

// Run to the end; status flips to won on the final day's travel.
let guard = 0;
while (s.status === 'playing' && guard++ < 100) {
  dispatch({ type: 'TRAVEL', location: s.location === 'bronx' ? 'ghetto' : 'bronx' });
}
ok('game ends by day 31', s.status === 'won' && s.day <= 31);
ok('net worth is finite number', Number.isFinite(netWorth(s)));
console.log(`  final: day ${s.day}, net worth ${netWorth(s).toLocaleString()}`);

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

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
