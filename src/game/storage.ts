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
