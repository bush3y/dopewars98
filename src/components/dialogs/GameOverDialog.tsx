import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { netWorth } from '../../engine/reducer';
import { NetWorthChart } from '../NetWorthChart';

export function GameOverDialog() {
  const { state, dispatch, ui } = useGame();
  const score = netWorth(state);
  const died = state.status === 'dead';

  const newGame = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <Modal title={died ? 'You Died' : 'Game Over'} onClose={() => {}} closable={false}>
      <p className="dlg__message">
        {died
          ? `The cops gunned you down on day ${state.day}. Game over.`
          : `Day ${state.maxDays} is up. You're done dealing.`}
      </p>
      <div className="dlg__stats dlg__stats--col">
        <div><span>Cash</span><b>{state.cash.toLocaleString()}</b></div>
        <div><span>Bank</span><b>{state.bank.toLocaleString()}</b></div>
        <div><span>Debt</span><b className="neg">{state.debt.toLocaleString()}</b></div>
        <div className="dlg__score">
          <span>Net worth</span>
          <b className={score >= 0 ? 'pos' : 'neg'}>{score.toLocaleString()}</b>
        </div>
      </div>
      <NetWorthChart data={state.netWorthHistory} />
      <div className="dlg__actions">
        <button type="button" onClick={newGame}>New Game</button>
      </div>
    </Modal>
  );
}
