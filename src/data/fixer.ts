// "The Fixer" — a street contact who lines you up with a few favors each day.
// Each day offers the same 3 perks to everyone (deterministic from the run seed;
// the Daily's seed is the date, so every daily player gets the identical set —
// a shared strategic layer, not an advantage). Unlocks once you've proven you
// can last. Perks only touch your own state, never world generation, so the
// Daily Challenge stays fair.

import { makeRng } from '../engine/rng';

export type FixerPerkId = 'coat' | 'interest' | 'gun-runner' | 'patch-up' | 'quick-cash';

export interface FixerPerkDef {
  id: FixerPerkId;
  title: string;
  description: string;
}

/** Tunable knobs for the whole feature. */
export const FIXER = {
  unlockDay: 10, // the Fixer "calls" once you reach this day
  perksPerDay: 3,
  coatBonus: 20,
  coatDays: 5,
  interestMultiplier: 0.5,
  interestDays: 5,
  gunShopDays: 5,
  cashLoan: 5000,
} as const;

export const FIXER_PERKS: FixerPerkDef[] = [
  {
    id: 'coat',
    title: 'Bigger Coat',
    description: `A roomier trench — +${FIXER.coatBonus} coat space for ${FIXER.coatDays} days.`,
  },
  {
    id: 'interest',
    title: 'Loan-Shark Break',
    description: `Half the loan shark's daily interest for ${FIXER.interestDays} days.`,
  },
  {
    id: 'gun-runner',
    title: 'Gun Runner',
    description: `Dan's Gun Shop opens every day for ${FIXER.gunShopDays} days.`,
  },
  {
    id: 'patch-up',
    title: 'Patch Up',
    description: 'A back-alley doc gets you back to 100% health.',
  },
  {
    id: 'quick-cash',
    title: 'Quick Cash',
    description: `A fast $${FIXER.cashLoan.toLocaleString()} — straight to your pocket, added to your debt.`,
  },
];

const BY_ID = Object.fromEntries(FIXER_PERKS.map((p) => [p.id, p])) as Record<
  FixerPerkId,
  FixerPerkDef
>;

export function fixerPerkDef(id: FixerPerkId): FixerPerkDef {
  return BY_ID[id];
}

/**
 * The day's 3 perk ids, deterministic from the run seed. The Daily's seed is the
 * date, so every daily player sees the same three; Classic/Dynasty runs each get
 * their own set. Fisher–Yates shuffle off the keyed RNG, then take the first 3.
 */
export function fixerPerks(seed: number): FixerPerkId[] {
  const rng = makeRng(seed, 'fixer');
  const pool = FIXER_PERKS.map((p) => p.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, FIXER.perksPerDay);
}
