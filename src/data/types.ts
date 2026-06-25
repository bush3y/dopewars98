// Core domain types. Phase 0 is static, but these are shaped to grow into the
// reducer-driven game state described in BRIEF.md §4.

export type DrugId =
  | 'cocaine'
  | 'hashish'
  | 'heroin'
  | 'ecstasy'
  | 'smack'
  | 'opium'
  | 'crack'
  | 'peyote'
  | 'shrooms'
  | 'speed'
  | 'weed';

export type LocationId =
  | 'bronx'
  | 'manhattan'
  | 'ghetto'
  | 'coney-island'
  | 'central-park'
  | 'brooklyn';

export interface Drug {
  id: DrugId;
  name: string;
}

export interface Location {
  id: LocationId;
  name: string;
}

/** A row in the "Available drugs" market pane. */
export interface MarketEntry {
  drug: DrugId;
  price: number;
  /** Prices seen for this drug over the run, for the inline sparkline. */
  history: number[];
}

/** A row in the "Trenchcoat" inventory pane. */
export interface InventoryEntry {
  drug: DrugId;
  qty: number;
  /** Average price paid; shown in the Trenchcoat "Price" column. */
  price: number;
}

/**
 * A flattened snapshot of everything the UI renders. Phase 1 will derive this
 * from the reducer's GameState; for Phase 0 it's a hardcoded fixture.
 */
export interface GameSnapshot {
  day: number;
  maxDays: number;
  location: LocationId;
  cash: number;
  bank: number;
  debt: number;
  guns: number;
  health: number; // 0..100
  capacity: number; // 100
  spaceUsed: number;
  market: MarketEntry[];
  trenchcoat: InventoryEntry[];
}
