import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { DRUG_NAME } from '../../data/gameData';

/** Surfaces a market event on arrival (matches the original's pop-up). */
export function EventDialog() {
  const { state, dispatch } = useGame();
  if (!state.event) return null;
  const { drug, message } = state.event;
  const text = message.replace('{drug}', DRUG_NAME[drug]);
  const dismiss = () => dispatch({ type: 'DISMISS_EVENT' });

  return (
    <Modal title="Word on the Street" onClose={dismiss}>
      <p className="dlg__message">{text}</p>
      <div className="dlg__actions">
        <button type="button" onClick={dismiss}>OK</button>
      </div>
    </Modal>
  );
}
