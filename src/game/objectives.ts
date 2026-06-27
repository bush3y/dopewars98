// Daily side-quests. A pool of bonus objectives; each daily seed deterministically
// assigns 3 (everyone gets the same three), checked live against the run. They're
// bonus stars — they never gate the daily win (which stays "end in the black").

import type { GameState } from '../engine/types';
import { makeRng } from '../engine/rng';

export interface Objective {
  id: string;
  label: string;
  /** True once met. All checks read monotonic stats, so completion sticks. */
  check: (s: GameState) => boolean;
}

export const OBJECTIVES: Objective[] = [
  { id: 'tour4', label: 'Visit 4 different neighborhoods', check: (s) => s.stats.visited.length >= 4 },
  { id: 'tourAll', label: 'Visit all 6 neighborhoods', check: (s) => s.stats.visited.length >= 6 },
  { id: 'buyGun', label: "Buy a gun at Dan's Gun Shop", check: (s) => s.stats.gunsBought >= 1 },
  { id: 'armed', label: 'Carry 3 guns at once', check: (s) => s.stats.maxGuns >= 3 },
  { id: 'winFight', label: 'Win a gunfight', check: (s) => s.stats.fightsWon >= 1 },
  { id: 'clearDebt', label: 'Pay off the loan shark', check: (s) => s.debt === 0 },
  { id: 'fullCoat', label: 'Pack your trenchcoat full', check: (s) => s.stats.maxSpaceUsed >= s.capacity },
  { id: 'bigBank', label: 'Stash $50,000 in the bank', check: (s) => s.stats.maxBank >= 50_000 },
  { id: 'bigSale', label: 'Make a single sale of $20,000+', check: (s) => s.stats.biggestSale >= 20_000 },
  { id: 'crew', label: 'Reach Crew Member rank', check: (s) => s.peakNetWorth >= 10_000 },
  { id: 'enforcer', label: 'Reach Enforcer rank', check: (s) => s.peakNetWorth >= 80_000 },
];

/** The 3 objectives for a daily seed — deterministic, identical for everyone. */
export function dailyObjectives(seed: number): Objective[] {
  const rng = makeRng(seed, 'objectives');
  const pool = [...OBJECTIVES];
  // Partial Fisher–Yates: shuffle the first 3 slots, take them.
  for (let i = 0; i < 3; i++) {
    const j = i + Math.floor(rng.next() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

/** How many of the day's objectives are met in the given state. */
export function objectivesDone(seed: number, state: GameState): boolean[] {
  return dailyObjectives(seed).map((o) => o.check(state));
}
