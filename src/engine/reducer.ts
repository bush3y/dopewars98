import type { DrugId } from '../data/types';
import { ECONOMY } from '../data/economy';
import { generateMarket } from './market';
import type { Action, GameState, GameMode } from './types';

const START_LOCATION = 'bronx' as const;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Total trenchcoat space currently occupied. */
export function spaceUsed(state: GameState): number {
  let used = 0;
  for (const id in state.inventory) used += state.inventory[id as DrugId]!.qty;
  return used;
}

/** The score: cash + bank − debt. */
export function netWorth(state: GameState): number {
  return state.cash + state.bank - state.debt;
}

export function initialState(
  seed: number = Date.now() >>> 0,
  mode: GameMode = 'classic',
): GameState {
  // No events on the opening day — match the clean Day-1 cold-open.
  const { prices } = generateMarket(seed, 1, START_LOCATION, false);
  const base: GameState = {
    seed,
    mode,
    day: 1,
    maxDays: ECONOMY.maxDays,
    location: START_LOCATION,
    cash: ECONOMY.startingCash,
    bank: ECONOMY.startingBank,
    debt: ECONOMY.startingDebt,
    health: 100,
    guns: 0,
    capacity: ECONOMY.capacity,
    inventory: {},
    market: prices,
    event: null,
    netWorthHistory: [],
    status: 'playing',
  };
  base.netWorthHistory = [netWorth(base)];
  return base;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return initialState(action.seed, action.mode ?? state.mode);

    case 'DISMISS_EVENT':
      return state.event ? { ...state, event: null } : state;

    case 'TRAVEL': {
      if (state.status !== 'playing') return state;
      if (action.location === state.location) return state;

      // The final day's trip ends the run; no day beyond maxDays.
      if (state.day >= state.maxDays) {
        return { ...state, status: 'won' };
      }

      const day = state.day + 1;
      // A day passes: debt and bank both compound.
      const debt = Math.round(state.debt * (1 + ECONOMY.debtInterest));
      const bank = Math.round(state.bank * (1 + ECONOMY.bankInterest));
      const { prices, event } = generateMarket(state.seed, day, action.location);

      const next: GameState = {
        ...state,
        day,
        location: action.location,
        debt,
        bank,
        market: prices,
        event,
      };
      next.netWorthHistory = [...state.netWorthHistory, netWorth(next)];
      return next;
    }

    case 'BUY': {
      if (state.status !== 'playing') return state;
      const price = state.market[action.drug];
      if (!price) return state;
      const room = state.capacity - spaceUsed(state);
      const affordable = Math.floor(state.cash / price);
      const qty = clamp(Math.floor(action.qty), 0, Math.min(room, affordable));
      if (qty <= 0) return state;

      const held = state.inventory[action.drug];
      const newQty = (held?.qty ?? 0) + qty;
      const avgPrice = held
        ? Math.round((held.qty * held.avgPrice + qty * price) / newQty)
        : price;

      return {
        ...state,
        cash: state.cash - qty * price,
        inventory: { ...state.inventory, [action.drug]: { qty: newQty, avgPrice } },
      };
    }

    case 'SELL': {
      if (state.status !== 'playing') return state;
      const price = state.market[action.drug];
      const held = state.inventory[action.drug];
      if (!price || !held) return state;
      const qty = clamp(Math.floor(action.qty), 0, held.qty);
      if (qty <= 0) return state;

      const inventory = { ...state.inventory };
      if (held.qty - qty <= 0) delete inventory[action.drug];
      else inventory[action.drug] = { ...held, qty: held.qty - qty };

      return { ...state, cash: state.cash + qty * price, inventory };
    }

    case 'DEPOSIT': {
      if (state.status !== 'playing') return state;
      const amount = clamp(Math.floor(action.amount), 0, state.cash);
      if (amount <= 0) return state;
      return { ...state, cash: state.cash - amount, bank: state.bank + amount };
    }

    case 'WITHDRAW': {
      if (state.status !== 'playing') return state;
      const amount = clamp(Math.floor(action.amount), 0, state.bank);
      if (amount <= 0) return state;
      return { ...state, bank: state.bank - amount, cash: state.cash + amount };
    }

    case 'REPAY_DEBT': {
      if (state.status !== 'playing') return state;
      const amount = clamp(Math.floor(action.amount), 0, Math.min(state.cash, state.debt));
      if (amount <= 0) return state;
      return { ...state, cash: state.cash - amount, debt: state.debt - amount };
    }

    default:
      return state;
  }
}
