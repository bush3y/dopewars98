// Crime-family ranks, earned by net worth (cash + bank − debt). Live: your rank
// rises and falls with your net worth. Kingpin (~$5M) is essentially Dynasty-only.
// Thresholds are easy to retune after playtesting.

export interface Rank {
  name: string;
  /** Minimum net worth to hold this rank. */
  min: number;
}

// Ascending — RANKS[0] is the lowest. Recruit always qualifies (you start in the red).
export const RANKS: Rank[] = [
  { name: 'Recruit', min: -Infinity },
  { name: 'Lookout', min: 0 },
  { name: 'Runner', min: 2_500 },
  { name: 'Crew Member', min: 10_000 },
  { name: 'Trusted Associate', min: 30_000 },
  { name: 'Enforcer', min: 80_000 },
  { name: 'Lieutenant', min: 200_000 },
  { name: 'Captain', min: 600_000 },
  { name: 'Underboss', min: 1_800_000 },
  { name: 'Kingpin', min: 5_000_000 },
];

/** Highest rank index whose threshold the net worth meets. */
export function rankIndexFor(netWorth: number): number {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (netWorth >= RANKS[i].min) idx = i;
  }
  return idx;
}

/** Rank name for a given net worth. */
export function rankName(netWorth: number): string {
  return RANKS[rankIndexFor(netWorth)].name;
}
