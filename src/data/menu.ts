// Single source of truth for the menu structure. Rendered as Win9x dropdowns on
// desktop (MenuBar) and as a slide-out drawer on mobile (MobileDrawer), so the
// two never diverge.

import type { GameMode } from '../engine/types';

export interface MenuItem {
  label: string;
  /** Phase that makes this item functional; shown as a hint while stubbed. */
  phase?: number;
  /** Mode items render a radio dot marking the active mode. */
  mode?: GameMode;
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
      { label: 'Free Play', mode: 'classic' },
      { label: 'Daily Challenge', mode: 'daily' },
    ],
  },
  {
    title: 'View',
    accel: 0,
    items: [
      { label: 'Finances' },
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
