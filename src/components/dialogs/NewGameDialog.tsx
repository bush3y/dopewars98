import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

const LABEL: Record<string, string> = { classic: 'Classic', dynasty: 'Dynasty' };
const BLURB: Record<string, string> = {
  classic: 'Race to build your fortune over 31 days.',
  dynasty: 'Play on with no day limit — the run ends only when the cops get you.',
};

/** Confirm before discarding an in-progress run, then start the chosen mode. */
export function NewGameDialog() {
  const { dispatch, ui, pendingMode } = useGame();
  const label = LABEL[pendingMode] ?? 'Classic';

  const confirm = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', mode: pendingMode });
    ui.close();
  };

  return (
    <Modal title={`New ${label} Game`} onClose={ui.close}>
      <p className="dlg__message">{BLURB[pendingMode]}</p>
      <p className="dlg__message">Start a new {label} game? Your current progress will be lost.</p>
      <div className="dlg__actions">
        <button type="button" onClick={confirm}>Start</button>
        <button type="button" onClick={ui.close}>Cancel</button>
      </div>
    </Modal>
  );
}
