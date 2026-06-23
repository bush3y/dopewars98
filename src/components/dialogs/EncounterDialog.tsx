import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { HealthBar } from '../HealthBar';
import { totalGuns } from '../../engine/encounters';

/**
 * The cops gunfight. Non-dismissable — you must Fight or Run. Shows the standing
 * officers, your health, and round feedback. Reads pendingEncounter from state.
 */
export function EncounterDialog() {
  const { state, dispatch } = useGame();
  const enc = state.pendingEncounter;
  if (!enc) return null;

  const armed = totalGuns(state.guns) > 0;

  return (
    <Modal title="Trouble!" onClose={() => {}} closable={false}>
      <p className="dlg__message">{enc.message}</p>
      {enc.feedback && <p className="dlg__feedback">{enc.feedback}</p>}

      <div className="dlg__stats dlg__stats--col">
        <div><span>Officers standing</span><b>{enc.officers}</b></div>
        <div><span>Your guns</span><b>{totalGuns(state.guns)}</b></div>
      </div>

      <div className="encounter__health">
        <span className="health__label">Health</span>
        <HealthBar value={state.health} />
      </div>

      {!armed && (
        <p className="dlg__feedback">You're unarmed — fighting bare-handed is risky. Better run.</p>
      )}

      <div className="dlg__actions">
        <button type="button" onClick={() => dispatch({ type: 'FIGHT' })}>Fight</button>
        <button type="button" onClick={() => dispatch({ type: 'RUN' })}>Run</button>
      </div>
    </Modal>
  );
}
