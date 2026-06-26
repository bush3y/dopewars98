import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

export function HighScoresDialog() {
  const { scores, ui } = useGame();

  return (
    <Modal title="High Scores" onClose={ui.close}>
      {scores.length === 0 ? (
        <p className="dlg__message">No finished games yet. Survive to day 31!</p>
      ) : (
        <table className="grid scores">
          <thead>
            <tr>
              <th className="grid__col-num">#</th>
              <th className="grid__col-num">Net Worth</th>
              <th>Result</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s.date}>
                <td className="grid__col-num">{i + 1}</td>
                <td className="grid__col-num">{s.score.toLocaleString()}</td>
                <td>{s.status === 'dead' ? `died d${s.day}` : 'survived'}</td>
                <td>{s.mode === 'daily' ? 'Daily' : 'Free Play'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
