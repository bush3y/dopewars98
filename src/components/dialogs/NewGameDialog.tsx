import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { loadCampaign } from '../../game/storage';

const LABEL: Record<string, string> = { classic: 'Classic', dynasty: 'Dynasty' };
const BLURB: Record<string, string> = {
  classic: 'Race to build your fortune over 31 days.',
  dynasty: 'Play on with no day limit — the run ends only when the cops get you.',
};

/**
 * Pick a mode. If a game of that mode is already in progress (auto-saved), offer
 * to resume it rather than silently discarding it; otherwise confirm a new game
 * (warning if it would replace an in-progress run of another mode).
 */
export function NewGameDialog() {
  const { dispatch, ui, pendingMode } = useGame();
  const label = LABEL[pendingMode] ?? 'Classic';

  const campaign = loadCampaign();
  const inProgress = campaign && campaign.status === 'playing' ? campaign : null;
  const resumable = inProgress && inProgress.mode === pendingMode ? inProgress : null;
  const otherInProgress = inProgress && inProgress.mode !== pendingMode ? inProgress : null;

  const resume = () => {
    ui.select(null);
    dispatch({ type: 'LOAD_GAME', state: resumable! });
    ui.close();
  };

  const startNew = () => {
    ui.select(null);
    dispatch({ type: 'NEW_GAME', mode: pendingMode });
    ui.close();
  };

  if (resumable) {
    return (
      <Modal title={`${label}`} onClose={ui.close}>
        <p className="dlg__message">{BLURB[pendingMode]}</p>
        <p className="dlg__message">
          You have a <b>{label}</b> game in progress — <b>Day {resumable.day}</b>.
        </p>
        <div className="dlg__actions">
          <button type="button" onClick={resume}>Resume Day {resumable.day}</button>
          <button type="button" onClick={startNew}>Start New</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`New ${label} Game`} onClose={ui.close}>
      <p className="dlg__message">{BLURB[pendingMode]}</p>
      <p className="dlg__message">
        Start a new {label} game?
        {otherInProgress &&
          ` This replaces your in-progress ${LABEL[otherInProgress.mode]} game (Day ${otherInProgress.day}).`}
      </p>
      <div className="dlg__actions">
        <button type="button" onClick={startNew}>Start</button>
        <button type="button" onClick={ui.close}>Cancel</button>
      </div>
    </Modal>
  );
}
