import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

/**
 * One-time celebration when the player first reaches Kingpin (the top rank).
 * Purely congratulatory — play continues, so you can keep stacking money/days.
 */
export function KingpinDialog() {
  const { ui, snapshot: snap } = useGame();
  const netWorth = snap.cash + snap.bank - snap.debt;

  return (
    <Modal title="Kingpin!" onClose={ui.close}>
      <p className="dlg__message">
        👑 You've clawed your way to the very top — you're a <b>Kingpin</b>.
      </p>
      <p className="dlg__message">
        Net worth <b>${netWorth.toLocaleString('en-US')}</b>. There's no higher rank, but the
        streets don't close — keep going and run the score up.
      </p>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Keep playing</button>
      </div>
    </Modal>
  );
}
