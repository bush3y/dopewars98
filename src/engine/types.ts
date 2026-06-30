import type { DrugId, LocationId } from '../data/types';
import type { GunId } from '../data/guns';
import type { CopsEncounter } from './encounters';

export type GameStatus = 'playing' | 'won' | 'dead';
export type GameMode = 'classic' | 'dynasty' | 'daily';

export interface Holding {
  qty: number;
  /** Average price paid, for the Trenchcoat "Price" column and P/L later. */
  avgPrice: number;
}

/** A passive popup (market event, mugging, found loot, combat outcome). */
export interface Notice {
  title: string;
  message: string;
}

/** Accumulated facts about a run, used to check daily objectives. */
export interface RunStats {
  /** Unique locations visited (includes the start). */
  visited: LocationId[];
  gunsBought: number;
  /** Most guns held at once. */
  maxGuns: number;
  fightsWon: number;
  /** Largest single sale's total value. */
  biggestSale: number;
  /** Most trenchcoat space filled at once (drugs + guns). */
  maxSpaceUsed: number;
  /** Highest bank balance held. */
  maxBank: number;
  /** Cumulative sale revenue by heat tier (for objectives). */
  soldSoft: number;
  soldHard: number;
}

export interface GameState {
  seed: number;
  mode: GameMode;
  day: number;
  maxDays: number;
  location: LocationId;
  cash: number;
  bank: number;
  debt: number;
  health: number;
  /** Owned guns by type; they add combat power and take trenchcoat space. */
  guns: Partial<Record<GunId, number>>;
  capacity: number;
  /** Held drugs only (absent = not carried). */
  inventory: Partial<Record<DrugId, Holding>>;
  /** Today's prices at the current location. */
  market: Record<DrugId, number>;
  /** Per-drug sequence of prices seen as you travelled, for sparklines. */
  priceHistory: Record<DrugId, number[]>;
  /** Dan's Gun Shop is open here today. */
  gunShopOpen: boolean;
  /** Active cops fight awaiting Fight/Run, or null. */
  pendingEncounter: CopsEncounter | null;
  /** Passive popup awaiting acknowledgement, or null. */
  notice: Notice | null;
  /** Net worth (cash + bank − debt) at the end of each day, for the chart. */
  netWorthHistory: number[];
  /** Highest net worth reached this run, for peak rank. */
  peakNetWorth: number;
  /** Accumulated facts for daily objectives. */
  stats: RunStats;
  status: GameStatus;
}

export type Action =
  | { type: 'NEW_GAME'; seed?: number; mode?: GameMode }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'TRAVEL'; location: LocationId }
  | { type: 'BUY'; drug: DrugId; qty: number }
  | { type: 'SELL'; drug: DrugId; qty: number }
  | { type: 'BUY_GUN'; gun: GunId }
  | { type: 'FIGHT' }
  | { type: 'RUN' }
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'WITHDRAW'; amount: number }
  | { type: 'REPAY_DEBT'; amount: number }
  | { type: 'DISMISS_NOTICE' };
