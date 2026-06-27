import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { outcome } from '../../game/daily';

const RESULT_LABEL = { win: '✅ won', red: '📉 in the red', busted: '💀 busted' };
const MODE_LABEL = { classic: 'Classic', endless: 'Endless', daily: 'Daily' };

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
                <td>{RESULT_LABEL[outcome(s.status, s.score)]}</td>
                <td>{MODE_LABEL[s.mode]}</td>
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
