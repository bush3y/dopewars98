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

/** Inverse: a daily seed back to its date label, 20260626 → "2026-06-26". */
export function seedDateLabel(seed: number): string {
  const s = String(seed);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** Human label for the active mode (used in the title bar / footer). */
export function modeLabel(mode: GameMode, seed: number): string {
  return mode === 'daily' ? `Daily ${seedDateLabel(seed)}` : 'Free Play';
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
export function makeShareString(d: ShareData): string {
  const outcome =
    d.status === 'dead' ? `💀 Busted on day ${d.day}` : '🏁 Survived to day 31';
  const money = `💰 Net worth $${d.score.toLocaleString('en-US')}`;
  const curve = blockSparkline(d.history);
  return `Dope Wars — Daily ${d.date}\n${outcome}\n${money}\n${curve}`;
}
