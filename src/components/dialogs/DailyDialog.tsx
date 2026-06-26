import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { DailyShare } from '../DailyShare';
import { todayKey, dailySeed } from '../../game/daily';
import { loadDailyResult, loadDailyGame } from '../../game/storage';

/**
 * Daily challenge: everyone plays the identical 31 days seeded by today's date
 * (BRIEF §6). Start it once, resume it anytime (never restart — the world is
 * deterministic, so restarting would be save-scumming), and it's locked once
 * finished. Then share the spoiler-free result.
 */
export function DailyDialog() {
  const { state, dispatch, ui } = useGame();
  const key = todayKey();
  const seed = dailySeed(key);

  const result = loadDailyResult(key);
  const saved = loadDailyGame(key);
  const activeIsToday = state.mode === 'daily' && state.seed === seed && state.status === 'playing';
  const inProgress = !result && (activeIsToday || !!saved);
  // A non-daily game is currently going and would be replaced by a fresh start.
  const gameRunning = state.status === 'playing' && !activeIsToday;

  const start = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', seed, mode: 'daily' });
    ui.close();
  };

  const resume = () => {
    ui.select(null);
    // If it's already the active game, just close back to it; otherwise load it.
    if (!activeIsToday && saved) dispatch({ type: 'LOAD_GAME', state: saved });
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
          <p className="dlg__message">
            Today's challenge is underway — pick up where you left off. (You can't restart it.)
          </p>
          <div className="dlg__actions">
            <button type="button" onClick={resume}>Resume Today's Challenge</button>
            <button type="button" onClick={ui.close}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p className="dlg__message">
            Everyone plays the same 31 days today. One run, one score — then share it.
          </p>
          <p className="dlg__feedback">
            {gameRunning
              ? 'Starting it will replace your current game. Once started, you commit to today’s run — no restarts.'
              : 'Once started, you commit to today’s run — you can resume it but not restart it.'}
          </p>
          <div className="dlg__actions">
            <button type="button" onClick={start}>Play Today's Challenge</button>
            <button type="button" onClick={ui.close}>Cancel</button>
          </div>
        </>
      )}
    </Modal>
  );
}
