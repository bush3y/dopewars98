import type { Drug, Location, GameSnapshot, LocationId } from './types';

// ---------------------------------------------------------------------------
// Static reference data. The original NYC drug/location set (see BRIEF.md §3).
// Numbers here are a hand-entered fixture matching the "Day 1, Bronx" screenshot
// so Phase 0 *looks* right. Phase 1 replaces the snapshot with reducer output.
// ---------------------------------------------------------------------------

export const DRUGS: Drug[] = [
  { id: 'cocaine', name: 'Cocaine' },
  { id: 'hashish', name: 'Hashish' },
  { id: 'heroin', name: 'Heroin' },
  { id: 'ecstasy', name: 'Ecstasy' },
  { id: 'smack', name: 'Smack' },
  { id: 'opium', name: 'Opium' },
  { id: 'crack', name: 'Crack' },
  { id: 'peyote', name: 'Peyote' },
  { id: 'shrooms', name: 'Shrooms' },
  { id: 'speed', name: 'Speed' },
  { id: 'weed', name: 'Weed' },
];

export const DRUG_NAME: Record<string, string> = Object.fromEntries(
  DRUGS.map((d) => [d.id, d.name]),
);

// Subway grid order matches the screenshot:
//   Bronx        Manhattan
//   Ghetto       Coney Island
//   Central Park Brooklyn
export const LOCATIONS: Location[] = [
  { id: 'bronx', name: 'Bronx' },
  { id: 'manhattan', name: 'Manhattan' },
  { id: 'ghetto', name: 'Ghetto' },
  { id: 'coney-island', name: 'Coney Island' },
  { id: 'central-park', name: 'Central Park' },
  { id: 'brooklyn', name: 'Brooklyn' },
];

export const LOCATION_NAME: Record<LocationId, string> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l.name]),
) as Record<LocationId, string>;

/** Phase 0 fixture: the Day 1 / Bronx screenshot, value-for-value. */
export const SNAPSHOT: GameSnapshot = {
  day: 1,
  maxDays: 31,
  location: 'bronx',
  cash: 2000,
  bank: 0,
  debt: 5500,
  guns: 0,
  health: 100,
  capacity: 100,
  spaceUsed: 0,
  market: [
    { drug: 'cocaine', price: 16388 },
    { drug: 'hashish', price: 604 },
    { drug: 'heroin', price: 10016 },
    { drug: 'ecstasy', price: 28 },
    { drug: 'smack', price: 2929 },
    { drug: 'opium', price: 542 },
    { drug: 'crack', price: 1941 },
    { drug: 'peyote', price: 476 },
    { drug: 'shrooms', price: 824 },
    { drug: 'speed', price: 135 },
    { drug: 'weed', price: 657 },
  ],
  trenchcoat: [],
};
