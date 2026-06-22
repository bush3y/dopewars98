import type { useGame } from './GameContext';

type Game = ReturnType<typeof useGame>;

/**
 * Maps a menu/drawer item label to a game action. Shared by the desktop menu bar
 * and the mobile drawer so the two never diverge. Unhandled labels are no-ops
 * (their systems land in later phases).
 */
export function runMenuItem(label: string, game: Game): void {
  switch (label) {
    case 'New Game':
      game.ui.open('new-game');
      break;
    case 'Finances':
      game.ui.open('finances');
      break;
    // Save/Load (P3), Daily (P4), Sounds (P3), charts (P3), Help — later phases.
    default:
      break;
  }
}
