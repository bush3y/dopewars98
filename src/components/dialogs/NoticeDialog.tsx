import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

/** A passive popup: market events, muggings, found loot, combat outcomes. */
export function NoticeDialog() {
  const { state, dispatch } = useGame();
  if (!state.notice) return null;
  const { title, message } = state.notice;
  const dismiss = () => dispatch({ type: 'DISMISS_NOTICE' });

  return (
    <Modal title={title} onClose={dismiss}>
      <p className="dlg__message">{message}</p>
      <div className="dlg__actions">
        <button type="button" onClick={dismiss}>OK</button>
      </div>
    </Modal>
  );
}
