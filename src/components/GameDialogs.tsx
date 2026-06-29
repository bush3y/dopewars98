import { useGame } from '../game/GameContext';
import { BuyDialog } from './dialogs/BuyDialog';
import { SellDialog } from './dialogs/SellDialog';
import { FinancesDialog } from './dialogs/FinancesDialog';
import { TravelDialog } from './dialogs/TravelDialog';
import { NoticeDialog } from './dialogs/NoticeDialog';
import { EncounterDialog } from './dialogs/EncounterDialog';
import { GunShopDialog } from './dialogs/GunShopDialog';
import { GameOverDialog } from './dialogs/GameOverDialog';
import { NewGameDialog } from './dialogs/NewGameDialog';
import { SaveLoadDialog } from './dialogs/SaveLoadDialog';
import { HighScoresDialog } from './dialogs/HighScoresDialog';
import { ChartDialog } from './dialogs/ChartDialog';
import { DailyDialog } from './dialogs/DailyDialog';
import { ObjectivesDialog } from './dialogs/ObjectivesDialog';
import { RanksDialog } from './dialogs/RanksDialog';
import { HelpDialog } from './dialogs/HelpDialog';
import { AboutDialog } from './dialogs/AboutDialog';
import { KingpinDialog } from './dialogs/KingpinDialog';

/**
 * Single overlay layer rendered once at the app root, above both layouts.
 * Priority: game over > a pending gunfight > a passive notice > the dialog the
 * UI explicitly opened.
 */
export function GameDialogs() {
  const { state, ui } = useGame();

  if (state.status === 'won' || state.status === 'dead') return <GameOverDialog />;
  if (state.pendingEncounter) return <EncounterDialog />;
  if (state.notice) return <NoticeDialog />;

  switch (ui.dialog) {
    case 'buy':
      return ui.selected ? <BuyDialog drug={ui.selected} /> : null;
    case 'sell':
      return ui.selected ? <SellDialog drug={ui.selected} /> : null;
    case 'finances':
      return <FinancesDialog />;
    case 'travel':
      return <TravelDialog />;
    case 'gun-shop':
      return <GunShopDialog />;
    case 'save':
      return <SaveLoadDialog mode="save" />;
    case 'load':
      return <SaveLoadDialog mode="load" />;
    case 'scores':
      return <HighScoresDialog />;
    case 'chart':
      return <ChartDialog />;
    case 'daily':
      return <DailyDialog />;
    case 'objectives':
      return <ObjectivesDialog />;
    case 'ranks':
      return <RanksDialog />;
    case 'help':
      return <HelpDialog />;
    case 'about':
      return <AboutDialog />;
    case 'kingpin':
      return <KingpinDialog />;
    case 'new-game':
      return <NewGameDialog />;
    default:
      return null;
  }
}
