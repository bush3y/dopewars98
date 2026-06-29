import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { RANKS, rankIndexFor } from '../../data/ranks';

/**
 * The rank ladder and its net-worth thresholds, opened from the rank chip.
 * Highlights the player's current rank. Read-only reference.
 */
export function RanksDialog() {
  const { snapshot: snap, ui, rankCounts } = useGame();
  const netWorth = snap.cash + snap.bank - snap.debt;
  const currentIdx = rankIndexFor(netWorth);
  const next = currentIdx + 1 < RANKS.length ? RANKS[currentIdx + 1] : null;
  const toNext = next ? next.min - netWorth : 0;

  return (
    <Modal title="Ranks" onClose={ui.close}>
      <p className="dlg__message">
        Your rank rises and falls with your <b>net worth</b> (cash + bank − debt).{' '}
        <b>Reached</b> counts how many games you've hit each rank in.
      </p>
      <p className="dlg__message">
        {next ? (
          <>
            You're a <b>{RANKS[currentIdx].name}</b> — <b>${toNext.toLocaleString('en-US')}</b> to{' '}
            <b>{next.name}</b>.
          </>
        ) : (
          <>
            You've reached the top rank — <b>{RANKS[currentIdx].name}</b>. 👑
          </>
        )}
      </p>
      <table className="grid ranks-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th className="grid__col-num">Net worth</th>
            <th className="grid__col-num">Reached</th>
          </tr>
        </thead>
        <tbody>
          {RANKS.map((r, i) => ({ r, i }))
            .reverse()
            .map(({ r, i }) => {
              const count = rankCounts[i] ?? 0;
              const cls = i === currentIdx ? 'is-current' : count === 0 ? 'is-locked' : '';
              return (
                <tr key={r.name} className={cls}>
                  <td>
                    {i === currentIdx && <span className="ranks-table__here">🎖</span>}
                    {r.name}
                  </td>
                  <td className="grid__col-num">
                    {r.min === -Infinity ? '—' : `$${r.min.toLocaleString('en-US')}+`}
                  </td>
                  <td className="grid__col-num">{count > 0 ? `×${count}` : '—'}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
