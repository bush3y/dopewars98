import type { useGame } from './GameContext';

type Game = ReturnType<typeof useGame>;

/**
 * Maps a menu/drawer item label to a game action. Shared by the desktop menu bar
 * and the mobile drawer so the two never diverge. Unhandled labels are no-ops.
 */
export function runMenuItem(label: string, game: Game): void {
  switch (label) {
    case 'Classic':
      game.requestNewGame('classic');
      break;
    case 'Dynasty':
      game.requestNewGame('dynasty');
      break;
    case 'Daily Challenge':
      game.ui.open('daily');
      break;
    case 'Save Game':
      game.ui.open('save');
      break;
    case 'Load Game':
      game.ui.open('load');
      break;
    case 'Finances':
      game.ui.open('finances');
      break;
    case 'High Scores':
      game.ui.open('scores');
      break;
    case 'Net Worth Chart':
      game.ui.open('chart');
      break;
    case 'Sound On / Off':
      game.toggleSound();
      break;
    // Help — later/N/A.
    default:
      break;
  }
}
