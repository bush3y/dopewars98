import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

/** Confirm before discarding an in-progress run. */
export function NewGameDialog() {
  const { dispatch, ui } = useGame();
  const confirm = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME' });
    ui.close();
  };

  return (
    <Modal title="New Game" onClose={ui.close}>
      <p className="dlg__message">Start a new game? Your current progress will be lost.</p>
      <div className="dlg__actions">
        <button type="button" onClick={confirm}>New Game</button>
        <button type="button" onClick={ui.close}>Cancel</button>
      </div>
    </Modal>
  );
}
