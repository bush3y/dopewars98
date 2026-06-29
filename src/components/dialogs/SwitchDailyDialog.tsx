import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { todayKey, dailySeed } from '../../game/daily';
import { loadDailyGame } from '../../game/storage';
import type { GameMode } from '../../engine/types';

const MODE_LABEL: Record<GameMode, string> = {
  classic: 'Classic',
  dynasty: 'Dynasty',
  daily: 'Daily',
};

/**
 * Shown on launch when a non-daily run is in progress on a new day: continue it,
 * or jump into today's Daily. The run stays stashed either way (see decideStartup
 * / the campaign auto-save), so picking the Daily never loses it.
 */
export function SwitchDailyDialog() {
  const { state, dispatch, ui } = useGame();
  const label = MODE_LABEL[state.mode];

  const playDaily = () => {
    ui.select(null);
    const today = todayKey();
    const saved = loadDailyGame(today);
    if (saved) dispatch({ type: 'LOAD_GAME', state: saved });
    else dispatch({ type: 'NEW_GAME', seed: dailySeed(today), mode: 'daily' });
    ui.close();
  };

  return (
    <Modal title="Welcome back" onClose={ui.close}>
      <p className="dlg__message">
        You've got a <b>{label}</b> game going — <b>Day {state.day}</b>. Pick it back up, or
        jump into today's <b>Daily Challenge</b>?
      </p>
      <p className="dlg__feedback">Your {label} game stays saved either way.</p>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Continue {label}</button>
        <button type="button" onClick={playDaily}>Play today's Daily</button>
      </div>
    </Modal>
  );
}
