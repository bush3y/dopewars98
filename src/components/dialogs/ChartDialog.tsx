import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { NetWorthChart } from '../NetWorthChart';
import { netWorth } from '../../engine/reducer';

export function ChartDialog() {
  const { state, ui } = useGame();

  return (
    <Modal title="Net Worth" onClose={ui.close}>
      <NetWorthChart data={state.netWorthHistory} />
      <p className="dlg__message">
        Current net worth: <b>{netWorth(state).toLocaleString()}</b>
      </p>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
