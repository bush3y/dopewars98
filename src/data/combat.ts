// Combat / encounter tuning + flavor text. Mechanics and numbers are ours
// (clean-room, BRIEF §3); the flavor strings are our own wording.

export const COMBAT = {
  // Chance of *any* arrival encounter = base + load * (carried fraction of coat).
  // Carrying more dope draws more heat.
  encounterBase: 0.1,
  encounterLoad: 0.35,

  // Given an encounter, the split between trouble types (must sum to 1).
  weights: {
    cops: 0.5,
    mugging: 0.18,
    foundCash: 0.18,
    foundDrugs: 0.14,
  },

  // Cops: how many officers show up. Grows slowly with the day number.
  officersMin: 1,
  officersPerDays: 8, // +1 potential officer every ~8 days
  officersMax: 5,

  // Per-round hit chances.
  playerBaseHit: 0.55, // with the weakest possible loadout
  playerHitPerPower: 0.03, // each point of combat power adds this, capped
  playerHitCap: 0.92,
  officerHit: 0.32, // each surviving officer's chance to tag you
  damageMin: 4,
  damageMax: 14,

  // Running away.
  runEscape: 0.55,

  // Rewards for winning a gunfight (per officer defeated).
  bustCashMin: 200,
  bustCashMax: 1400,

  // Mugging steals a fraction of cash on hand.
  mugFractionMin: 0.15,
  mugFractionMax: 0.4,

  // Found bonuses.
  foundCashMin: 150,
  foundCashMax: 1600,
  foundDrugsMin: 2,
  foundDrugsMax: 8,

  // Gun shop availability per (seed, day, location).
  gunShopChance: 0.3,
};

export const COMBAT_FLAVOR = {
  copsAppear: [
    'Officer Hardass and {n} of his deputies spot you and move in!',
    '{n} cops round the corner — Officer Hardass is leading them straight at you!',
    'A patrol of {n} officers blocks the street. Hardass wants a word.',
  ],
  copsAppear1: [
    'Officer Hardass steps out of the shadows, alone — and he means business.',
    'A lone cop, Officer Hardass, has you in his sights!',
  ],
  won: [
    'You dropped the last of them and slip away into the crowd.',
    'The cops scatter. You pocket what they were carrying and run.',
  ],
  escaped: [
    'You duck down an alley and lose them.',
    'You bolt and disappear into the subway before they react.',
  ],
  escapeFailed: [
    'You stumble — they get a shot off before you can run!',
    "You can't shake them, and a round clips you!",
  ],
  mugging: [
    'A mugger jumps you in a stairwell and makes off with {amount}.',
    'Someone pulls a knife in the dark and lightens your wallet by {amount}.',
  ],
  foundCash: [
    'You find {amount} in a dropped envelope on the platform.',
    'A panicked dealer drops a roll of cash as he runs — {amount} is yours.',
  ],
  foundDrugs: [
    'You find {qty} units of {drug} stashed behind a loose brick.',
    'An abandoned duffel holds {qty} units of {drug}.',
  ],
};
