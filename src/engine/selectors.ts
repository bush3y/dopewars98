import type { GameSnapshot } from '../data/types';
import { DRUGS } from '../data/gameData';
import type { GameState } from './types';
import { spaceUsed } from './reducer';
import { totalGuns } from './encounters';

/**
 * Flatten GameState into the GameSnapshot the dumb list/stat components render.
 * This is the seam (BRIEF §4): Phase 0 hand-built a SNAPSHOT; Phase 1 derives it
 * here. Drug order follows DRUGS so the market list is stable.
 */
export function toSnapshot(state: GameState): GameSnapshot {
  return {
    day: state.day,
    maxDays: state.maxDays,
    location: state.location,
    cash: state.cash,
    bank: state.bank,
    debt: state.debt,
    guns: totalGuns(state.guns),
    health: state.health,
    capacity: state.capacity,
    spaceUsed: spaceUsed(state),
    market: DRUGS.map((d) => ({
      drug: d.id,
      price: state.market[d.id],
      history: state.priceHistory[d.id] ?? [state.market[d.id]],
    })),
    trenchcoat: DRUGS.filter((d) => state.inventory[d.id]).map((d) => ({
      drug: d.id,
      qty: state.inventory[d.id]!.qty,
      price: state.inventory[d.id]!.avgPrice,
    })),
  };
}
