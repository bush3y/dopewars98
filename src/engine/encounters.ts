import type { DrugId, LocationId } from '../data/types';
import type { GunId } from '../data/guns';
import { GUN_BY_ID } from '../data/guns';
import { DRUGS, DRUG_NAME } from '../data/gameData';
import { COMBAT, COMBAT_FLAVOR } from '../data/combat';
import { makeRng, type Rng } from './rng';

const DRUG_IDS = DRUGS.map((d) => d.id);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pickMsg = (rng: Rng, arr: string[]) => rng.pick(arr);

// --- Encounter shapes -------------------------------------------------------

/** The interactive cops fight; lives in GameState.pendingEncounter. */
export interface CopsEncounter {
  kind: 'cops';
  officers: number; // remaining
  initial: number; // how many showed up (for reward scaling)
  round: number; // 0-based round counter, keys the combat sub-stream
  message: string; // opening flavor
  /** Round-by-round feedback (hits taken/landed), shown under the message. */
  feedback?: string;
}

/** Non-interactive outcomes applied immediately on arrival. */
export type InstantOutcome =
  | { kind: 'mugging'; amount: number; message: string }
  | { kind: 'found-cash'; amount: number; message: string }
  | { kind: 'found-drugs'; drug: DrugId; qty: number; message: string };

export interface ArrivalEncounter {
  cops: CopsEncounter | null;
  instant: InstantOutcome | null;
  gunShopOpen: boolean;
}

// --- Helpers ----------------------------------------------------------------

const sub = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

/** Total combat power from owned guns. */
export function combatPower(guns: Partial<Record<GunId, number>>): number {
  let power = 0;
  for (const id in guns) power += (guns[id as GunId] ?? 0) * GUN_BY_ID[id as GunId].damage;
  return power;
}

/** Space occupied by guns (they compete with drugs in the trenchcoat). */
export function gunSpace(guns: Partial<Record<GunId, number>>): number {
  let space = 0;
  for (const id in guns) space += (guns[id as GunId] ?? 0) * GUN_BY_ID[id as GunId].space;
  return space;
}

export function totalGuns(guns: Partial<Record<GunId, number>>): number {
  let n = 0;
  for (const id in guns) n += guns[id as GunId] ?? 0;
  return n;
}

// --- Arrival generation -----------------------------------------------------

/**
 * Whether (and what) you run into on arriving at a location. The *trigger* is a
 * pure function of (seed, day, location) and the carried load — never of which
 * drugs/guns you chose — so a daily run's world is identical for everyone
 * (BRIEF §6). `cash` only scales a mugging's magnitude (a consequence of your
 * choices, which §6 permits).
 */
export function generateArrival(
  seed: number,
  day: number,
  location: LocationId,
  carriedFraction: number,
  cash: number,
): ArrivalEncounter {
  const gunShopOpen = makeRng(seed, day, location, 'gunshop').chance(COMBAT.gunShopChance);

  const er = makeRng(seed, day, location, 'encounter');
  const chance = COMBAT.encounterBase + COMBAT.encounterLoad * clamp(carriedFraction, 0, 1);
  if (!er.chance(chance)) return { cops: null, instant: null, gunShopOpen };

  // Choose the trouble type from weighted bands.
  const w = COMBAT.weights;
  const roll = er.next();
  let cops: CopsEncounter | null = null;
  let instant: InstantOutcome | null = null;

  if (roll < w.cops) {
    const extra = er.int(0, Math.floor(day / COMBAT.officersPerDays));
    const officers = clamp(COMBAT.officersMin + extra, COMBAT.officersMin, COMBAT.officersMax);
    const message =
      officers === 1
        ? pickMsg(er, COMBAT_FLAVOR.copsAppear1)
        : sub(pickMsg(er, COMBAT_FLAVOR.copsAppear), { n: officers });
    cops = { kind: 'cops', officers, initial: officers, round: 0, message };
  } else if (roll < w.cops + w.mugging) {
    const frac = er.range(COMBAT.mugFractionMin, COMBAT.mugFractionMax);
    const amount = Math.floor(cash * frac);
    instant = {
      kind: 'mugging',
      amount,
      message: sub(pickMsg(er, COMBAT_FLAVOR.mugging), { amount: amount.toLocaleString() }),
    };
  } else if (roll < w.cops + w.mugging + w.foundCash) {
    const amount = er.int(COMBAT.foundCashMin, COMBAT.foundCashMax);
    instant = {
      kind: 'found-cash',
      amount,
      message: sub(pickMsg(er, COMBAT_FLAVOR.foundCash), { amount: amount.toLocaleString() }),
    };
  } else {
    const drug = er.pick(DRUG_IDS);
    const qty = er.int(COMBAT.foundDrugsMin, COMBAT.foundDrugsMax);
    instant = {
      kind: 'found-drugs',
      drug,
      qty,
      message: sub(pickMsg(er, COMBAT_FLAVOR.foundDrugs), { qty, drug: DRUG_NAME[drug] }),
    };
  }

  return { cops, instant, gunShopOpen };
}

// --- Combat resolution ------------------------------------------------------

export interface RoundResult {
  officers: number;
  health: number;
  damageTaken: number;
  /** Player landed a shot this round (fight only). */
  playerHit: boolean;
  /** Player got away (run only). */
  escaped: boolean;
  won: boolean;
  dead: boolean;
}

function returnFire(rng: Rng, officers: number, health: number) {
  let damage = 0;
  for (let i = 0; i < officers; i++) {
    if (rng.chance(COMBAT.officerHit)) damage += rng.int(COMBAT.damageMin, COMBAT.damageMax);
  }
  return { health: health - damage, damage };
}

/** Build the keyed RNG for one combat round (deterministic per BRIEF §6). */
export function combatRng(seed: number, day: number, location: LocationId, round: number): Rng {
  return makeRng(seed, day, location, 'combat', round);
}

/** One round of shooting back. */
export function resolveFight(
  rng: Rng,
  officers: number,
  power: number,
  health: number,
): RoundResult {
  const hitChance = Math.min(COMBAT.playerHitCap, COMBAT.playerBaseHit + power * COMBAT.playerHitPerPower);
  const playerHit = rng.chance(hitChance);
  let remaining = officers - (playerHit ? 1 : 0);
  if (remaining < 0) remaining = 0;

  if (remaining === 0) {
    return { officers: 0, health, damageTaken: 0, playerHit, escaped: false, won: true, dead: false };
  }
  const fire = returnFire(rng, remaining, health);
  return {
    officers: remaining,
    health: Math.max(0, fire.health),
    damageTaken: fire.damage,
    playerHit,
    escaped: false,
    won: false,
    dead: fire.health <= 0,
  };
}

/** One round of trying to flee. */
export function resolveRun(rng: Rng, officers: number, health: number): RoundResult {
  if (rng.chance(COMBAT.runEscape)) {
    return { officers, health, damageTaken: 0, playerHit: false, escaped: true, won: false, dead: false };
  }
  const fire = returnFire(rng, officers, health);
  return {
    officers,
    health: Math.max(0, fire.health),
    damageTaken: fire.damage,
    playerHit: false,
    escaped: false,
    won: false,
    dead: fire.health <= 0,
  };
}

/** Cash reward for winning a gunfight, scaled by how many cops showed up. */
export function bustReward(seed: number, day: number, location: LocationId, initial: number): number {
  const rng = makeRng(seed, day, location, 'combat', 'reward');
  let cash = 0;
  for (let i = 0; i < initial; i++) cash += rng.int(COMBAT.bustCashMin, COMBAT.bustCashMax);
  return cash;
}
