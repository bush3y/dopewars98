// Daily-challenge helpers. The seed is the date, so everyone plays the identical
// 31 days (BRIEF §6). The world is already a pure function of the seed via the
// keyed RNG, so "daily" is just: pick today's seed, then share a spoiler-free
// result.

import type { GameStatus, GameMode } from '../engine/types';

/** Local-date key, e.g. "2026-06-26". */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Deterministic seed from a date key: 2026-06-26 → 20260626. */
export function dailySeed(key: string = todayKey()): number {
  return Number(key.replace(/-/g, ''));
}

/** The day before a date key (for streak continuity). 2026-06-26 → 2026-06-25. */
export function prevKey(key: string): string {
  const d = new Date(`${key}T12:00:00`); // noon avoids DST edges
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export type Outcome = 'win' | 'red' | 'busted';

/**
 * The objective: beat the loan shark. WIN = survive to day 31 in the black;
 * survive in the red or get busted = a loss.
 */
export function outcome(status: GameStatus, score: number): Outcome {
  if (status === 'dead') return 'busted';
  return score > 0 ? 'win' : 'red';
}

export function isWin(status: GameStatus, score: number): boolean {
  return outcome(status, score) === 'win';
}

/** Money with the sign outside the $, e.g. -3500 → "-$3,500". */
function money(n: number): string {
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US')}`;
}

/** Inverse: a daily seed back to its date label, 20260626 → "2026-06-26". */
export function seedDateLabel(seed: number): string {
  const s = String(seed);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** Human label for the active mode (used in the title bar / footer). */
export function modeLabel(mode: GameMode, seed: number): string {
  if (mode === 'daily') return `Daily ${seedDateLabel(seed)}`;
  if (mode === 'dynasty') return 'Dynasty';
  return 'Classic';
}

const BLOCKS = '▁▂▃▄▅▆▇█';

/** Compact block-character sparkline of the net-worth curve (spoiler-free). */
export function blockSparkline(history: number[], cols = 14): string {
  if (history.length === 0) return '';
  // Downsample evenly to at most `cols` points.
  const pts =
    history.length <= cols
      ? history
      : Array.from({ length: cols }, (_, i) =>
          history[Math.round((i * (history.length - 1)) / (cols - 1))],
        );
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  return pts
    .map((v) => BLOCKS[Math.min(BLOCKS.length - 1, Math.floor(((v - min) / span) * BLOCKS.length))])
    .join('');
}

export interface ShareData {
  date: string;
  score: number;
  status: GameStatus;
  day: number;
  history: number[];
}

/** Spoiler-free share text: outcome + score + curve shape, no prices/choices. */
export function makeShareString(d: ShareData, streak = 0): string {
  const o = outcome(d.status, d.score);
  const line =
    o === 'busted'
      ? `💀 Busted on day ${d.day}`
      : o === 'win'
        ? '✅ Beat the street'
        : '📉 In the hole';
  const moneyLine = `💰 Net worth ${money(d.score)}`;
  const streakLine = streak > 0 ? `\n🔥 Streak: ${streak}` : '';
  const curve = blockSparkline(d.history);
  return `Dope Wars — Daily ${d.date}\n${line}\n${moneyLine}${streakLine}\n${curve}`;
}
