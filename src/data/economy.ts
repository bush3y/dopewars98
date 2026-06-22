import type { DrugId } from './types';

// ---------------------------------------------------------------------------
// Economy constants + per-drug price ranges. Numbers are facts (clean-room, see
// BRIEF §3) — re-derived to match the screenshot's price magnitudes. Flavor text
// for market events is our own wording, not the GPL original's.
// ---------------------------------------------------------------------------

export const ECONOMY = {
  startingCash: 2000,
  startingDebt: 5500,
  startingBank: 0,
  maxDays: 31,
  capacity: 100,
  /** Loan-shark debt compounds daily; the bank pays a smaller daily rate. */
  debtInterest: 0.1, // +10% / day
  bankInterest: 0.05, // +5% / day
};

export interface DrugEconomy {
  min: number;
  max: number;
  /** Eligible for a "prices spike" event (rare, dear drugs). */
  expensive?: boolean;
  /** Eligible for a "flooded — dirt cheap" event (common drugs). */
  cheap?: boolean;
}

/** Per-drug base price range and event eligibility. */
export const DRUG_ECONOMY: Record<DrugId, DrugEconomy> = {
  cocaine: { min: 15000, max: 29000, expensive: true },
  heroin: { min: 5500, max: 13000, expensive: true },
  smack: { min: 1500, max: 4400 },
  crack: { min: 1000, max: 2500 },
  shrooms: { min: 630, max: 1300, cheap: true },
  opium: { min: 540, max: 1250 },
  weed: { min: 315, max: 890, cheap: true },
  peyote: { min: 220, max: 700, cheap: true },
  speed: { min: 90, max: 250 },
  hashish: { min: 480, max: 1280, cheap: true },
  ecstasy: { min: 11, max: 60, cheap: true },
};

export interface EventTemplate {
  /** Price multiplier applied to the affected drug. */
  multiplier: [min: number, max: number];
  /** `{drug}` is substituted with the drug name. Our own wording. */
  messages: string[];
}

/** "Prices spike" — applied to an `expensive` drug. */
export const EXPENSIVE_EVENT: EventTemplate = {
  multiplier: [3, 5],
  messages: [
    'Word on the street: a major {drug} bust has dealers spooked. Prices are sky-high!',
    'A {drug} drought has hit the city — sellers are charging a fortune.',
    'Everyone wants {drug} tonight. Prices are through the roof!',
  ],
};

/** "Flooded — dirt cheap" — applied to a `cheap` drug. */
export const CHEAP_EVENT: EventTemplate = {
  multiplier: [0.25, 0.5],
  messages: [
    'A fresh shipment of {drug} just flooded the streets — dealers are dumping it cheap.',
    'The market is drowning in {drug}. You can grab it for next to nothing.',
    'Nobody wants {drug} right now. It is going dirt cheap.',
  ],
};

/** Chance that arriving at a location triggers a market event. */
export const EVENT_CHANCE = 0.18;
