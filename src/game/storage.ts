import type { GameState, GameMode, GameStatus } from '../engine/types';

// Versioned localStorage persistence: the active game (auto-saved), named save
// slots, a high-score table, and settings. The schema version guards against
// loading a game whose shape predates a change (BRIEF §5).

const VERSION = 3;
const KEY = {
  current: 'dw:current',
  slots: 'dw:slots',
  scores: 'dw:scores',
  settings: 'dw:settings',
  daily: 'dw:daily',
  dailyGame: 'dw:dailygame',
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

// --- Settings ---------------------------------------------------------------

export interface Settings {
  sound: boolean;
}

const DEFAULT_SETTINGS: Settings = { sound: false };

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...(read<Settings>(KEY.settings) ?? {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEY.settings, settings);
}
