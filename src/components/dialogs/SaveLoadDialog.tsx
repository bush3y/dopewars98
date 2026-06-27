import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { listSlots, saveSlot, loadSlot } from '../../game/storage';
import { netWorth } from '../../engine/reducer';
import { locationName } from '../../data/cities';

/** Three named save slots, shared between Save and Load modes. */
export function SaveLoadDialog({ mode }: { mode: 'save' | 'load' }) {
  const { state, dispatch, ui, refresh, city } = useGame();
  const slots = listSlots();

  const doSave = (i: number) => {
    saveSlot(i, {
      name: `Day ${state.day} · ${locationName(city, state.location)}`,
      savedAt: Date.now(),
      day: state.day,
      netWorth: netWorth(state),
      status: state.status,
      state,
    });
    refresh();
  };

  const doLoad = (i: number) => {
    const loaded = loadSlot(i);
    if (!loaded) return;
    ui.select(null);
    dispatch({ type: 'LOAD_GAME', state: loaded });
    ui.close();
  };

  return (
    <Modal title={mode === 'save' ? 'Save Game' : 'Load Game'} onClose={ui.close}>
      <div className="slots">
        {slots.map((slot, i) => (
          <div key={i} className="slot">
            <div className="slot__info">
              <b>Slot {i + 1}</b>
              {slot ? (
                <span className="slot__meta">
                  {slot.name} — net {slot.netWorth.toLocaleString()}
                  {slot.status !== 'playing' ? ` (${slot.status})` : ''}
                </span>
              ) : (
                <span className="slot__meta slot__meta--empty">empty</span>
              )}
            </div>
            {mode === 'save' ? (
              <button type="button" onClick={() => doSave(i)}>
                {slot ? 'Overwrite' : 'Save'}
              </button>
            ) : (
              <button type="button" disabled={!slot} onClick={() => doLoad(i)}>
                Load
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
