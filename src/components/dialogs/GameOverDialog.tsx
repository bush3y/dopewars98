import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { netWorth, inventoryValue } from '../../engine/reducer';
import { NetWorthChart } from '../NetWorthChart';
import { DailyShare } from '../DailyShare';
import { ShareCard } from '../ShareCard';
import { todayKey, dailySeed, outcome, makeRunShareString } from '../../game/daily';
import { rankName } from '../../data/ranks';
import { objectivesDone } from '../../game/objectives';
import { loadModeGame } from '../../game/storage';
import type { GameState, GameMode } from '../../engine/types';

const COPY = {
  win: { title: 'You Win!', line: 'You beat the loan shark and walked away in the black.' },
  red: { title: 'Game Over', line: "You survived day 31, but the loan shark still owns you — in the red." },
  busted: { title: 'Busted', line: (day: number) => `The cops gunned you down on day ${day}.` },
};

const MODE_LABEL: Record<string, string> = { classic: 'Classic', dynasty: 'Dynasty' };

export function GameOverDialog() {
  const { state, dispatch, ui, streak } = useGame();
  const heldValue = inventoryValue(state); // unsold drugs at local price — counts at the end
  const score = netWorth(state) + heldValue;
  const result = outcome(state.status, score);
  const isTodaysDaily = state.mode === 'daily' && state.seed === dailySeed(todayKey());

  // Always two choices: one Classic slot, one Dynasty slot. Each resumes that
  // mode if a run of it is in progress, otherwise starts a fresh one. The mode
  // that just ended is never resumable (its slot is cleared on game-over), so it
  // shows "New". This keeps both modes one tap away and avoids duplicate buttons.
  const slots = (['classic', 'dynasty'] as const).map((mode) => {
    const saved = state.mode === mode ? null : loadModeGame(mode);
    return { mode, resumable: saved && saved.status === 'playing' ? saved : null };
  });

  const resume = (g: GameState) => {
    ui.select(null);
    dispatch({ type: 'LOAD_GAME', state: g });
  };
  const startNew = (mode: GameMode) => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', mode });
  };

  return (
    <Modal title={COPY[result].title} onClose={() => {}} closable={false}>
      <p className="dlg__message">
        {result === 'busted' ? COPY.busted.line(state.day) : COPY[result].line}
      </p>
      <div className="dlg__stats dlg__stats--col">
        <div><span>Cash</span><b>{state.cash.toLocaleString()}</b></div>
        <div><span>Bank</span><b>{state.bank.toLocaleString()}</b></div>
        <div><span>Debt</span><b className="neg">{state.debt.toLocaleString()}</b></div>
        {heldValue > 0 && (
          <div><span>Drugs (held)</span><b className="pos">{heldValue.toLocaleString()}</b></div>
        )}
        <div><span>Peak rank</span><b>{rankName(state.peakNetWorth)}</b></div>
        <div className="dlg__score">
          <span>Net worth</span>
          <b className={score >= 0 ? 'pos' : 'neg'}>{score.toLocaleString()}</b>
        </div>
      </div>
      <NetWorthChart data={state.netWorthHistory} fit />
      {isTodaysDaily && (
        <>
          <p className="dlg__streak">
            🔥 Streak: <b>{streak.current}</b>
            {streak.best > 0 && <span className="dlg__streak-best"> (best {streak.best})</span>}
          </p>
          <DailyShare
            data={{
              date: todayKey(),
              score,
              status: state.status,
              day: state.day,
              history: state.netWorthHistory,
              objectives: objectivesDone(state.seed, state),
            }}
            streak={streak.current}
          />
        </>
      )}
      {state.mode !== 'daily' && (
        <ShareCard
          text={makeRunShareString({
            mode: state.mode,
            status: state.status,
            day: state.day,
            score,
            history: state.netWorthHistory,
            peakNetWorth: state.peakNetWorth,
          })}
        />
      )}
      <div className="dlg__actions">
        {slots.map(({ mode, resumable }) =>
          resumable ? (
            <button key={mode} type="button" onClick={() => resume(resumable)}>
              Resume {MODE_LABEL[mode]} · Day {resumable.day}
            </button>
          ) : (
            <button key={mode} type="button" onClick={() => startNew(mode)}>
              New {MODE_LABEL[mode]}
            </button>
          ),
        )}
      </div>
    </Modal>
  );
}
