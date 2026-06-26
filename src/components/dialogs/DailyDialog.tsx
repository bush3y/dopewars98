import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { DailyShare } from '../DailyShare';
import { todayKey, dailySeed } from '../../game/daily';
import { loadDailyResult } from '../../game/storage';

/**
 * Daily challenge: everyone plays the identical 31 days seeded by today's date
 * (BRIEF §6). Play-once — once finished, shows the spoiler-free shareable result.
 */
export function DailyDialog() {
  const { state, dispatch, ui } = useGame();
  const key = todayKey();
  const seed = dailySeed(key);
  const result = loadDailyResult(key);
  const inProgress = state.mode === 'daily' && state.seed === seed && state.status === 'playing';
  const gameRunning = state.status === 'playing' && !(state.mode === 'daily' && state.seed === seed);

  const play = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', seed, mode: 'daily' });
    ui.close();
  };

  return (
    <Modal title={`Daily Challenge — ${key}`} onClose={ui.close}>
      {result ? (
        <>
          <p className="dlg__message">You've finished today's challenge. Come back tomorrow for a new one.</p>
          <DailyShare data={result} />
        </>
      ) : inProgress ? (
        <>
          <p className="dlg__message">Today's challenge is in progress — good luck out there.</p>
          <div className="dlg__actions">
            <button type="button" onClick={ui.close}>Resume</button>
          </div>
        </>
      ) : (
        <>
          <p className="dlg__message">
            Everyone plays the same 31 days today. One run, one score — then share it.
          </p>
          {gameRunning && (
            <p className="dlg__feedback">Starting it will replace your current game.</p>
          )}
          <div className="dlg__actions">
            <button type="button" onClick={play}>Play Today's Challenge</button>
            <button type="button" onClick={ui.close}>Cancel</button>
          </div>
        </>
      )}
    </Modal>
  );
}
