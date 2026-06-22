import type { DrugId, LocationId } from '../data/types';
import type { MarketEvent } from './market';

export type GameStatus = 'playing' | 'won';
export type GameMode = 'classic' | 'daily';

export interface Holding {
  qty: number;
  /** Average price paid, for the Trenchcoat "Price" column and P/L later. */
  avgPrice: number;
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
  guns: number;
  capacity: number;
  /** Held drugs only (absent = not carried). */
  inventory: Partial<Record<DrugId, Holding>>;
  /** Today's prices at the current location. */
  market: Record<DrugId, number>;
  /** Active market event awaiting acknowledgement, or null. */
  event: MarketEvent | null;
  /** Net worth (cash + bank − debt) at the end of each day, for the chart. */
  netWorthHistory: number[];
  status: GameStatus;
}

export type Action =
  | { type: 'NEW_GAME'; seed?: number; mode?: GameMode }
  | { type: 'TRAVEL'; location: LocationId }
  | { type: 'BUY'; drug: DrugId; qty: number }
  | { type: 'SELL'; drug: DrugId; qty: number }
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'WITHDRAW'; amount: number }
  | { type: 'REPAY_DEBT'; amount: number }
  | { type: 'DISMISS_EVENT' };
