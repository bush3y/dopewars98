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
      { label: 'New Game' },
      { label: 'Save Game' },
      { label: 'Load Game' },
      { label: 'Exit' },
    ],
  },
  {
    title: 'View',
    accel: 0,
    items: [
      { label: 'Finances' },
      { label: 'High Scores' },
      { label: 'Net Worth Chart' },
      { label: 'Daily Challenge', phase: 4 },
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
