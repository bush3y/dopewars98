import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { dailyObjectives } from '../../game/objectives';
import { dailySeed, todayKey } from '../../game/daily';
import { loadDailyResult } from '../../game/storage';

/**
 * The daily side-quest checklist. Objectives are bonus stars — they never gate
 * the daily win. Shown for the active daily (live) or, once finished, the
 * recorded result. In other modes it explains they're a Daily thing.
 */
export function ObjectivesDialog() {
  const { state, ui } = useGame();
  const key = todayKey();
  const seed = dailySeed(key);
  const objectives = dailyObjectives(seed);

  const isTodaysDaily = state.mode === 'daily' && state.seed === seed;
  const finished = loadDailyResult(key);

  // Live completion if you're in today's daily; otherwise the recorded result.
  const done = isTodaysDaily
    ? objectives.map((o) => o.check(state))
    : finished?.objectives ?? objectives.map(() => false);
  const count = done.filter(Boolean).length;

  return (
    <Modal title="Daily Objectives" onClose={ui.close}>
      {!isTodaysDaily && !finished ? (
        <p className="dlg__message">
          Objectives are part of the Daily Challenge. Start today's daily to chase them.
        </p>
      ) : (
        <>
          <p className="dlg__message">
            Bonus side-quests for today — <b>⭐ {count}/{objectives.length}</b>. They don't
            affect winning, just bragging rights.
          </p>
          <ul className="objectives">
            {objectives.map((o, i) => (
              <li key={o.id} className={done[i] ? 'objectives__item is-done' : 'objectives__item'}>
                <span className="objectives__mark">{done[i] ? '⭐' : '▫️'}</span>
                {o.label}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
