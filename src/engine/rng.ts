// Seedable PRNG + coordinate hashing. The ONE source of randomness in the game
// (BRIEF.md §4, §6). Never call Math.random() — derive a stream from coordinates
// so the daily challenge's world is a pure function of (seed, day, location, …)
// and is identical for every player regardless of their choices.

/** cyrb53 string hash → 53-bit integer. Fast, good distribution. */
export function hashString(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** mulberry32: tiny, fast 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A small PRNG with convenience helpers, all flowing from one keyed stream. */
export interface Rng {
  /** float in [0, 1) */
  next(): number;
  /** integer in [min, max] inclusive */
  int(min: number, max: number): number;
  /** float in [min, max) */
  range(min: number, max: number): number;
  /** true with probability p */
  chance(p: number): boolean;
  /** uniformly pick one element */
  pick<T>(items: readonly T[]): T;
}

/**
 * Build an Rng keyed by a master seed plus any coordinate parts (day, location,
 * round, …). Same parts → same stream, independent of anything the player did.
 */
export function makeRng(seed: number, ...parts: Array<string | number>): Rng {
  const key = `${seed}|${parts.join('|')}`;
  const rand = mulberry32(hashString(key, seed >>> 0));
  return {
    next: rand,
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    range: (min, max) => rand() * (max - min) + min,
    chance: (p) => rand() < p,
    pick: (items) => items[Math.floor(rand() * items.length)],
  };
}
