// Guns: bought at Dan's Gun Shop, carried in the trenchcoat (they take space),
// and used to fight off the cops. Numbers are clean-room facts (BRIEF §3).

export type GunId = 'bat' | 'pistol' | 'shotgun' | 'magnum';

export interface Gun {
  id: GunId;
  name: string;
  price: number;
  /** Combat power contribution per gun owned. */
  damage: number;
  /** Trenchcoat space each gun occupies (competes with drugs). */
  space: number;
  /** One-line role shown in Dan's shop, so guns aren't a mystery stat. */
  role: string;
}

export const GUNS: Gun[] = [
  { id: 'bat', name: 'Baseball Bat', price: 250, damage: 1, space: 3, role: 'Cheap; barely beats bare fists.' },
  { id: 'pistol', name: '.38 Pistol', price: 850, damage: 2, space: 4, role: 'Reliable mid-tier firepower.' },
  { id: 'shotgun', name: 'Pump Shotgun', price: 2400, damage: 3, space: 5, role: 'Spread — can drop two cops at once.' },
  { id: 'magnum', name: '.44 Magnum', price: 5200, damage: 5, space: 5, role: 'Heavy hitter — rarely misses.' },
];

export const GUN_BY_ID: Record<GunId, Gun> = Object.fromEntries(
  GUNS.map((g) => [g.id, g]),
) as Record<GunId, Gun>;

export const GUN_NAME: Record<GunId, string> = Object.fromEntries(
  GUNS.map((g) => [g.id, g.name]),
) as Record<GunId, string>;
