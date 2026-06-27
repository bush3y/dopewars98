// Single source of truth for the menu structure. Rendered as Win9x dropdowns on
// desktop (MenuBar) and as a slide-out drawer on mobile (MobileDrawer), so the
// two never diverge.

import type { GameMode } from '../engine/types';
import { CITIES, type CityId } from './cities';

export interface MenuItem {
  label: string;
  /** Phase that makes this item functional; shown as a hint while stubbed. */
  phase?: number;
  /** Mode items render a check marking the active mode. */
  mode?: GameMode;
  /** City items (cosmetic skin) render a check marking the active city. */
  city?: CityId;
  /** The "random city" action item. */
  random?: boolean;
}

export interface Menu {
  title: string;
  /** Index of the accelerator letter to underline (matches the screenshot). */
  accel: number;
  items: MenuItem[];
}

export const MENUS: Menu[] = [
  {
    title: 'File',
    accel: 0,
    items: [
      { label: 'Save Game' },
      { label: 'Load Game' },
      { label: 'Exit' },
    ],
  },
  {
    // All game-mode selection lives here; the active mode is marked with a dot.
    title: 'Mode',
    accel: 0,
    items: [
      { label: 'Classic', mode: 'classic' },
      { label: 'Dynasty', mode: 'dynasty' },
      { label: 'Daily Challenge', mode: 'daily' },
    ],
  },
  {
    // Cosmetic city skin — relabels neighborhoods only. Active city is checked.
    title: 'City',
    accel: 0,
    items: [
      ...CITIES.map((c) => ({ label: c.name, city: c.id })),
      { label: '🎲 Random City', random: true },
    ],
  },
  {
    title: 'View',
    accel: 0,
    items: [
      { label: 'Finances' },
      { label: 'Daily Objectives' },
      { label: 'High Scores' },
      { label: 'Net Worth Chart' },
    ],
  },
  {
    title: 'Sounds',
    accel: 0,
    items: [{ label: 'Sound On / Off' }],
  },
  {
    title: 'Help',
    accel: 0,
    items: [{ label: 'How to Play' }, { label: 'About' }],
  },
];
