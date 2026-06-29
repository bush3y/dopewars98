import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';

/** How to Play — a concise rules/tips reference (Help menu). */
export function HelpDialog() {
  const { ui } = useGame();

  return (
    <Modal title="How to Play" onClose={ui.close}>
      <div className="help">
        <p className="dlg__message">
          You start with <b>$2,000</b> cash and owe a loan shark <b>$5,500</b>. Buy low, sell
          high, and build your net worth. <b>Classic</b> runs 31 days, <b>Dynasty</b> goes until
          you're dead or broke, and the <b>Daily</b> is a seeded run everyone shares.
        </p>

        <h4 className="help__h">Trading</h4>
        <p className="dlg__message">
          Every neighborhood has its own prices that swing each day — watch the <b>Trend</b> line.
          Pick a drug, then <b>Buy</b> or <b>Sell</b>. Your trenchcoat holds <b>100 units</b>. Held
          drugs show your quantity and the average price you <b>paid</b>, so you can spot a profit.
        </p>

        <h4 className="help__h">Travel</h4>
        <p className="dlg__message">
          <b>Travel</b> to a new area to advance a day and reshuffle prices. The road is risky —
          you may run into cops or rival dealers along the way.
        </p>

        <h4 className="help__h">Money</h4>
        <p className="dlg__message">
          Loan-shark debt grows <b>+10%/day</b>, so pay it down fast (<b>Finances → Repay</b>).
          Cash in the <b>bank</b> is safe and earns <b>+5%/day</b> — stash profits there.
        </p>

        <h4 className="help__h">Guns &amp; trouble</h4>
        <p className="dlg__message">
          When <b>Dan's Gun Shop</b> is open you can arm up. In a fight, your guns and{' '}
          <b>health</b> decide whether you win, run, or get hurt. Don't let your health hit zero.
        </p>

        <h4 className="help__h">Rank &amp; objectives</h4>
        <p className="dlg__message">
          Your <b>rank</b> (tap the badge) climbs with net worth, Recruit → Kingpin. In the Daily,
          chase the <b>⭐ objectives</b> for bragging rights and share your result.
        </p>
      </div>
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
