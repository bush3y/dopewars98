import type { DrugId } from '../data/types';
import { ECONOMY } from '../data/economy';
import { GUN_BY_ID } from '../data/guns';
import { generateMarket } from './market';
import {
  generateArrival,
  combatPower,
  gunSpace,
  combatRng,
  resolveFight,
  resolveRun,
  bustReward,
} from './encounters';
import type { Action, GameState, GameMode } from './types';

const START_LOCATION = 'bronx' as const;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Total trenchcoat space currently occupied (drugs + guns). */
export function spaceUsed(state: GameState): number {
  let used = gunSpace(state.guns);
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
  // No events/encounters on the opening day — match the clean Day-1 cold-open.
  const { prices } = generateMarket(seed, 1, START_LOCATION, false);
  const arrival = generateArrival(seed, 1, START_LOCATION, 0, ECONOMY.startingCash);
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
    guns: {},
    capacity: ECONOMY.capacity,
    inventory: {},
    market: prices,
    priceHistory: Object.fromEntries(
      Object.entries(prices).map(([id, p]) => [id, [p]]),
    ) as GameState['priceHistory'],
    gunShopOpen: arrival.gunShopOpen, // shop may be open day 1, but no cops/loot
    pendingEncounter: null,
    notice: null,
    netWorthHistory: [],
    status: 'playing',
  };
  base.netWorthHistory = [netWorth(base)];
  return base;
}

export function reducer(state: GameState, action: Action): GameState {
  // While a gunfight is pending, only Fight/Run/dismiss are allowed.
  const inFight = state.pendingEncounter != null;

  switch (action.type) {
    case 'NEW_GAME':
      return initialState(action.seed, action.mode ?? state.mode);

    case 'LOAD_GAME':
      return action.state;

    case 'DISMISS_NOTICE':
      return state.notice ? { ...state, notice: null } : state;

    case 'TRAVEL': {
      if (state.status !== 'playing' || inFight) return state;
      if (action.location === state.location) return state;

      // The final day's trip ends the run; no day beyond maxDays.
      if (state.day >= state.maxDays) {
        return { ...state, status: 'won' };
      }

      const day = state.day + 1;
      const debt = Math.round(state.debt * (1 + ECONOMY.debtInterest));
      const bank = Math.round(state.bank * (1 + ECONOMY.bankInterest));
      const { prices, event } = generateMarket(state.seed, day, action.location);

      const carriedFraction = spaceUsed(state) / state.capacity;
      const arrival = generateArrival(state.seed, day, action.location, carriedFraction, state.cash);

      let cash = state.cash;
      let inventory = state.inventory;
      let instantNotice: GameState['notice'] = null;

      // Apply a non-combat outcome immediately.
      if (arrival.instant) {
        const o = arrival.instant;
        if (o.kind === 'mugging') {
          cash = Math.max(0, cash - o.amount);
          instantNotice = { title: 'Mugged!', message: o.message };
        } else if (o.kind === 'found-cash') {
          cash += o.amount;
          instantNotice = { title: 'Lucky Find', message: o.message };
        } else {
          // found-drugs — only what fits.
          const room = state.capacity - spaceUsed(state);
          const qty = Math.min(o.qty, room);
          if (qty > 0) {
            const held = inventory[o.drug];
            inventory = {
              ...inventory,
              [o.drug]: { qty: (held?.qty ?? 0) + qty, avgPrice: held?.avgPrice ?? 0 },
            };
          }
          instantNotice = { title: 'Lucky Find', message: o.message };
        }
      }

      // Priority for the popup: combat shows its own dialog; else instant; else
      // a market price event.
      const notice = arrival.cops
        ? null
        : instantNotice ?? (event ? { title: 'Word on the Street', message: event.message } : null);

      const next: GameState = {
        ...state,
        day,
        location: action.location,
        debt,
        bank,
        cash,
        inventory,
        market: prices,
        priceHistory: Object.fromEntries(
          Object.entries(prices).map(([id, p]) => [
            id,
            [...(state.priceHistory[id as DrugId] ?? []), p],
          ]),
        ) as GameState['priceHistory'],
        gunShopOpen: arrival.gunShopOpen,
        pendingEncounter: arrival.cops,
        notice,
      };
      next.netWorthHistory = [...state.netWorthHistory, netWorth(next)];
      return next;
    }

    case 'FIGHT':
    case 'RUN': {
      const enc = state.pendingEncounter;
      if (!enc || state.status !== 'playing') return state;

      const rng = combatRng(state.seed, state.day, state.location, enc.round);
      const result =
        action.type === 'FIGHT'
          ? resolveFight(rng, enc.officers, combatPower(state.guns), state.health)
          : resolveRun(rng, enc.officers, state.health);

      if (result.dead) {
        return {
          ...state,
          health: 0,
          pendingEncounter: null,
          status: 'dead',
        };
      }

      if (result.won) {
        const reward = bustReward(state.seed, state.day, state.location, enc.initial);
        return {
          ...state,
          health: result.health,
          cash: state.cash + reward,
          pendingEncounter: null,
          notice: {
            title: 'Busted Them',
            message: `You took them down and grabbed ${reward.toLocaleString()} off the bodies.`,
          },
        };
      }

      if (result.escaped) {
        return {
          ...state,
          health: result.health,
          pendingEncounter: null,
          notice: { title: 'Got Away', message: 'You slip away into the crowd and lose them.' },
        };
      }

      // Fight continues — build round feedback.
      let feedback: string;
      if (action.type === 'RUN') {
        feedback = `You couldn't break away — they hit you for ${result.damageTaken}.`;
      } else if (result.playerHit && result.damageTaken > 0) {
        feedback = `You drop one! Return fire tags you for ${result.damageTaken}.`;
      } else if (result.playerHit) {
        feedback = 'You drop one and stay clear of their shots.';
      } else if (result.damageTaken > 0) {
        feedback = `You miss — they hit you for ${result.damageTaken}.`;
      } else {
        feedback = 'Shots fly but nobody connects.';
      }

      return {
        ...state,
        health: result.health,
        pendingEncounter: { ...enc, officers: result.officers, round: enc.round + 1, feedback },
      };
    }

    case 'BUY_GUN': {
      if (state.status !== 'playing' || inFight) return state;
      if (!state.gunShopOpen) return state;
      const gun = GUN_BY_ID[action.gun];
      const room = state.capacity - spaceUsed(state);
      if (state.cash < gun.price || room < gun.space) return state;
      return {
        ...state,
        cash: state.cash - gun.price,
        guns: { ...state.guns, [action.gun]: (state.guns[action.gun] ?? 0) + 1 },
      };
    }

    case 'BUY': {
      if (state.status !== 'playing' || inFight) return state;
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
      if (state.status !== 'playing' || inFight) return state;
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
      if (state.status !== 'playing' || inFight) return state;
      const amount = clamp(Math.floor(action.amount), 0, state.cash);
      if (amount <= 0) return state;
      return { ...state, cash: state.cash - amount, bank: state.bank + amount };
    }

    case 'WITHDRAW': {
      if (state.status !== 'playing' || inFight) return state;
      const amount = clamp(Math.floor(action.amount), 0, state.bank);
      if (amount <= 0) return state;
      return { ...state, bank: state.bank - amount, cash: state.cash + amount };
    }

    case 'REPAY_DEBT': {
      if (state.status !== 'playing' || inFight) return state;
      const amount = clamp(Math.floor(action.amount), 0, Math.min(state.cash, state.debt));
      if (amount <= 0) return state;
      return { ...state, cash: state.cash - amount, debt: state.debt - amount };
    }

    default:
      return state;
  }
}
