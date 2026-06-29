import type { GameState, GameMode, GameStatus } from '../engine/types';
import type { CityId } from '../data/cities';
import { DEFAULT_CITY } from '../data/cities';
import { prevKey } from './daily';

// Versioned localStorage persistence: the active game (auto-saved), named save
// slots, a high-score table, and settings. The schema version guards against
// loading a game whose shape predates a change (BRIEF §5).

const VERSION = 5; // bumped: GameState gained peakNetWorth, then stats
const KEY = {
  current: 'dw:current',
  slots: 'dw:slots',
  scores: 'dw:scores',
  settings: 'dw:settings',
  daily: 'dw:daily',
  dailyGame: 'dw:dailygame',
  streak: 'dw:streak',
  rankCounts: 'dw:rankcounts',
  rankCredit: 'dw:rankcredit',
  campaign: 'dw:campaign',
  lastDate: 'dw:lastdate',
};

export const SLOT_COUNT = 3;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — persistence is best-effort */
  }
}

interface Envelope {
  version: number;
  state: GameState;
}

// --- Active game (auto-save) ------------------------------------------------

export function saveCurrent(state: GameState): void {
  write(KEY.current, { version: VERSION, state });
}

export function loadCurrent(): GameState | null {
  const env = read<Envelope>(KEY.current);
  return env && env.version === VERSION ? env.state : null;
}

export function clearCurrent(): void {
  try {
    localStorage.removeItem(KEY.current);
  } catch {
    /* ignore */
  }
}

// --- Named save slots -------------------------------------------------------

export interface SaveSlot {
  name: string;
  savedAt: number;
  day: number;
  netWorth: number;
  status: GameStatus;
  state: GameState;
}

export function listSlots(): (SaveSlot | null)[] {
  const env = read<{ version: number; slots: (SaveSlot | null)[] }>(KEY.slots);
  const slots = env && env.version === VERSION ? env.slots : [];
  return Array.from({ length: SLOT_COUNT }, (_, i) => slots[i] ?? null);
}

export function saveSlot(index: number, slot: SaveSlot): void {
  const slots = listSlots();
  slots[index] = slot;
  write(KEY.slots, { version: VERSION, slots });
}

export function loadSlot(index: number): GameState | null {
  return listSlots()[index]?.state ?? null;
}

export function deleteSlot(index: number): void {
  const slots = listSlots();
  slots[index] = null;
  write(KEY.slots, { version: VERSION, slots });
}

// --- High scores ------------------------------------------------------------

export interface ScoreEntry {
  score: number;
  day: number;
  status: GameStatus;
  mode: GameMode;
  date: number;
}

const MAX_SCORES = 10;

export function loadScores(): ScoreEntry[] {
  return read<ScoreEntry[]>(KEY.scores) ?? [];
}

/** Record a finished run; returns the updated, sorted top list. */
export function addScore(entry: ScoreEntry): ScoreEntry[] {
  const scores = [...loadScores(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SCORES);
  write(KEY.scores, scores);
  return scores;
}

// --- Settings ---------------------------------------------------------------

// --- Daily challenge results (one per date) ---------------------------------

export interface DailyResult {
  date: string; // YYYY-MM-DD
  seed: number;
  score: number;
  status: GameStatus;
  day: number;
  history: number[];
  /** Completion of the day's 3 objectives, aligned to dailyObjectives(seed). */
  objectives: boolean[];
  playedAt: number;
}

export function loadDailyResults(): Record<string, DailyResult> {
  return read<Record<string, DailyResult>>(KEY.daily) ?? {};
}

export function loadDailyResult(date: string): DailyResult | null {
  return loadDailyResults()[date] ?? null;
}

export function saveDailyResult(result: DailyResult): void {
  const all = loadDailyResults();
  // Keep the player's first finish for the day — daily is play-once.
  if (!all[result.date]) {
    all[result.date] = result;
    write(KEY.daily, all);
  }
}

// The in-progress daily run, persisted separately from the active "current"
// game so switching to Free Play and back resumes it (never restarts). The
// deterministic world means restarting would be save-scumming with foreknowledge.

interface DailyGameEnvelope {
  version: number;
  date: string;
  state: GameState;
}

export function saveDailyGame(date: string, state: GameState): void {
  write(KEY.dailyGame, { version: VERSION, date, state });
}

/** The saved in-progress daily for `date`, if any (and schema-compatible). */
export function loadDailyGame(date: string): GameState | null {
  const env = read<DailyGameEnvelope>(KEY.dailyGame);
  return env && env.version === VERSION && env.date === date ? env.state : null;
}

// --- Daily win streak -------------------------------------------------------

export interface DailyStreak {
  current: number;
  best: number;
  /** Date of the most recent winning daily (for consecutive-day continuity). */
  lastWinDate: string | null;
}

const NO_STREAK: DailyStreak = { current: 0, best: 0, lastWinDate: null };

export function loadStreak(): DailyStreak {
  return read<DailyStreak>(KEY.streak) ?? NO_STREAK;
}

/**
 * Update the streak for a finished daily. A win on a day extends the streak only
 * if the previous calendar day was also a win (skipping a day or losing resets
 * it — Wordle-style). Returns the new streak.
 */
export function recordStreak(date: string, won: boolean): DailyStreak {
  const s = loadStreak();
  const current = won ? (s.lastWinDate === prevKey(date) ? s.current + 1 : 1) : 0;
  const next: DailyStreak = {
    current,
    best: Math.max(s.best, current),
    lastWinDate: won ? date : s.lastWinDate,
  };
  write(KEY.streak, next);
  return next;
}

// --- Settings ---------------------------------------------------------------

export interface Settings {
  sound: boolean;
  /** Cosmetic city skin (relabels neighborhoods); does not affect gameplay. */
  city: CityId;
}

const DEFAULT_SETTINGS: Settings = { sound: false, city: DEFAULT_CITY };

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...(read<Settings>(KEY.settings) ?? {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEY.settings, settings);
}

// --- Rank achievements (lifetime) -------------------------------------------
// rankCounts[i] = number of games in which rank i was reached (counted once per
// game). rankCredit tracks, per current game (keyed by a mode:seed signature),
// how high we've already credited and whether the Kingpin popup has shown — so
// reloads and resumes never double-count or re-congratulate.

export function loadRankCounts(): number[] {
  return read<number[]>(KEY.rankCounts) ?? [];
}

export function saveRankCounts(counts: number[]): void {
  write(KEY.rankCounts, counts);
}

export interface RankCredit {
  sig: string;
  creditedUpTo: number;
  kingpinShown: boolean;
}

export function loadRankCredit(): RankCredit | null {
  return read<RankCredit>(KEY.rankCredit);
}

export function saveRankCredit(rec: RankCredit): void {
  write(KEY.rankCredit, rec);
}

// --- Campaign stash (in-progress non-daily game) ----------------------------
// The Daily is "home"; this keeps your Classic/Dynasty run saved while you play
// the Daily, so you can return to it. Mirrors the active game while playing a
// non-daily mode; cleared when that run ends.

export function saveCampaign(state: GameState): void {
  write(KEY.campaign, { version: VERSION, state });
}

export function loadCampaign(): GameState | null {
  const env = read<Envelope>(KEY.campaign);
  return env && env.version === VERSION ? env.state : null;
}

export function clearCampaign(): void {
  try {
    localStorage.removeItem(KEY.campaign);
  } catch {
    /* ignore */
  }
}

// --- Last active calendar day (for the "returned next day" prompt) -----------

export function loadLastDate(): string | null {
  return read<string>(KEY.lastDate);
}

export function saveLastDate(date: string): void {
  write(KEY.lastDate, date);
}
