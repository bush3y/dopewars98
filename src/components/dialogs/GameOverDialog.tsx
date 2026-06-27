import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { netWorth } from '../../engine/reducer';
import { NetWorthChart } from '../NetWorthChart';
import { DailyShare } from '../DailyShare';
import { todayKey, dailySeed, outcome } from '../../game/daily';
import { rankName } from '../../data/ranks';

const COPY = {
  win: { title: 'You Win!', line: 'You beat the loan shark and walked away in the black.' },
  red: { title: 'Game Over', line: "You survived day 31, but the loan shark still owns you — in the red." },
  busted: { title: 'Busted', line: (day: number) => `The cops gunned you down on day ${day}.` },
};

export function GameOverDialog() {
  const { state, dispatch, ui, streak } = useGame();
  const score = netWorth(state);
  const result = outcome(state.status, score);
  const isTodaysDaily = state.mode === 'daily' && state.seed === dailySeed(todayKey());

  const newGame = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', mode: 'classic' });
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
        <div><span>Peak rank</span><b>{rankName(state.peakNetWorth)}</b></div>
        <div className="dlg__score">
          <span>Net worth</span>
          <b className={score >= 0 ? 'pos' : 'neg'}>{score.toLocaleString()}</b>
        </div>
      </div>
      <NetWorthChart data={state.netWorthHistory} />
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
            }}
            streak={streak.current}
          />
        </>
      )}
      <div className="dlg__actions">
        <button type="button" onClick={newGame}>New Game</button>
      </div>
    </Modal>
  );
}
