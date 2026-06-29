import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

/** About — credits, version, and a link to the repo (Help menu). */
export function AboutDialog() {
  const { ui } = useGame();

  return (
    <Modal title="About Dope Wars 98" onClose={ui.close}>
      <p className="dlg__message">
        <b>Dope Wars 98</b> — a browser homage to the classic Windows dopewars, rebuilt in the
        Win98 style. Clean-room recreation: no original code or assets.
      </p>
      <p className="dlg__message">
        Buy low, sell high, dodge the cops, and pay off the loan shark before the month is out.
      </p>
      <p className="dlg__message dlg__message--muted">
        Version 0.1.0 ·{' '}
        <a href="https://github.com/bush3y/dopewars98" target="_blank" rel="noreferrer">
          github.com/bush3y/dopewars98
        </a>
      </p>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
