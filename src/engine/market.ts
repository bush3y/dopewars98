import type { DrugId, LocationId } from '../data/types';
import { DRUGS } from '../data/gameData';
import {
  DRUG_ECONOMY,
  EXPENSIVE_EVENT,
  CHEAP_EVENT,
  EVENT_CHANCE,
  type EventTemplate,
} from '../data/economy';
import { makeRng } from './rng';

export interface MarketEvent {
  drug: DrugId;
  kind: 'cheap' | 'expensive';
  message: string;
}

export interface Market {
  prices: Record<DrugId, number>;
  event: MarketEvent | null;
}

const DRUG_IDS = DRUGS.map((d) => d.id);
const EXPENSIVE_DRUGS = DRUG_IDS.filter((id) => DRUG_ECONOMY[id].expensive);
const CHEAP_DRUGS = DRUG_IDS.filter((id) => DRUG_ECONOMY[id].cheap);

function applyEvent(
  template: EventTemplate,
  basePrice: number,
  rng: ReturnType<typeof makeRng>,
): number {
  const [lo, hi] = template.multiplier;
  return Math.max(1, Math.round(basePrice * rng.range(lo, hi)));
}

/**
 * The market at a coordinate is a pure function of (seed, day, location) — never
 * of player actions (BRIEF §6). Same coordinate always yields the same prices
 * and event, so revisiting is consistent and every daily player sees one world.
 *
 * @param allowEvents suppressed on the opening day for a clean cold-open.
 */
export function generateMarket(
  seed: number,
  day: number,
  location: LocationId,
  allowEvents = true,
): Market {
  const prices = {} as Record<DrugId, number>;
  for (const id of DRUG_IDS) {
    const { min, max } = DRUG_ECONOMY[id];
    prices[id] = makeRng(seed, day, location, id).int(min, max);
  }

  let event: MarketEvent | null = null;
  if (allowEvents) {
    const er = makeRng(seed, day, location, 'event');
    if (er.chance(EVENT_CHANCE)) {
      // Pick spike vs crash, then a specific eligible drug — all from the stream.
      const expensive = er.next() < 0.5;
      const pool = expensive ? EXPENSIVE_DRUGS : CHEAP_DRUGS;
      const drug = er.pick(pool);
      const template = expensive ? EXPENSIVE_EVENT : CHEAP_EVENT;
      prices[drug] = applyEvent(template, prices[drug], er);
      event = {
        drug,
        kind: expensive ? 'expensive' : 'cheap',
        message: er.pick(template.messages),
      };
    }
  }

  return { prices, event };
}
