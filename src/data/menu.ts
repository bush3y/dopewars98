// Single source of truth for the menu structure. Rendered as Win9x dropdowns on
// desktop (MenuBar) and as a slide-out drawer on mobile (MobileDrawer), so the
// two never diverge. Items are inert stubs in Phase 0; they wire up as their
// systems land (see CLAUDE.md / BRIEF §7).

export interface MenuItem {
  label: string;
  /** Phase that makes this item functional; shown as a hint while stubbed. */
  phase?: number;
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
      { label: 'New Game', phase: 1 },
      { label: 'Save Game', phase: 3 },
      { label: 'Load Game', phase: 3 },
      { label: 'Exit' },
    ],
  },
  {
    title: 'View',
    accel: 0,
    items: [
      { label: 'Finances', phase: 1 },
      { label: 'High Scores', phase: 3 },
      { label: 'Daily Challenge', phase: 4 },
      { label: 'Net Worth Chart', phase: 3 },
      { label: 'Price Sparklines', phase: 3 },
    ],
  },
  {
    title: 'Sounds',
    accel: 0,
    items: [{ label: 'Sound On / Off', phase: 3 }],
  },
  {
    title: 'Help',
    accel: 0,
    items: [{ label: 'How to Play' }, { label: 'About' }],
  },
];
