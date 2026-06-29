import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { RANKS, rankIndexFor } from '../../data/ranks';

/**
 * The rank ladder and its net-worth thresholds, opened from the rank chip.
 * Highlights the player's current rank. Read-only reference.
 */
export function RanksDialog() {
  const { snapshot: snap, ui } = useGame();
  const netWorth = snap.cash + snap.bank - snap.debt;
  const currentIdx = rankIndexFor(netWorth);

  return (
    <Modal title="Ranks" onClose={ui.close}>
      <p className="dlg__message">
        Your rank rises and falls with your <b>net worth</b> (cash + bank − debt).
      </p>
      <table className="grid ranks-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th className="grid__col-num">Net worth</th>
          </tr>
        </thead>
        <tbody>
          {RANKS.map((r, i) => ({ r, i }))
            .reverse()
            .map(({ r, i }) => (
              <tr key={r.name} className={i === currentIdx ? 'is-current' : ''}>
                <td>
                  {i === currentIdx && <span className="ranks-table__here">🎖</span>}
                  {r.name}
                </td>
                <td className="grid__col-num">
                  {r.min === -Infinity ? '—' : `$${r.min.toLocaleString('en-US')}+`}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
