import { useGame } from '../game/GameContext';
import { BuyDialog } from './dialogs/BuyDialog';
import { SellDialog } from './dialogs/SellDialog';
import { FinancesDialog } from './dialogs/FinancesDialog';
import { TravelDialog } from './dialogs/TravelDialog';
import { EventDialog } from './dialogs/EventDialog';
import { GameOverDialog } from './dialogs/GameOverDialog';
import { NewGameDialog } from './dialogs/NewGameDialog';

/**
 * Single overlay layer rendered once at the app root, so dialogs sit above both
 * the desktop and mobile layouts. Priority: game-over > event > the dialog the
 * UI explicitly opened.
 */
export function GameDialogs() {
  const { state, ui } = useGame();

  if (state.status === 'won') return <GameOverDialog />;
  if (state.event) return <EventDialog />;

  switch (ui.dialog) {
    case 'buy':
      return ui.selected ? <BuyDialog drug={ui.selected} /> : null;
    case 'sell':
      return ui.selected ? <SellDialog drug={ui.selected} /> : null;
    case 'finances':
      return <FinancesDialog />;
    case 'travel':
      return <TravelDialog />;
    case 'new-game':
      return <NewGameDialog />;
    default:
      return null;
  }
}
