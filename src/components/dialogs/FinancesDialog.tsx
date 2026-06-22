import { useState } from 'react';
import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { ECONOMY } from '../../data/economy';

/** Bank deposit/withdraw + loan-shark repayment. One amount, three actions. */
export function FinancesDialog() {
  const { state, dispatch, ui } = useGame();
  const [amount, setAmount] = useState(0);
  const amt = Math.max(0, Math.floor(amount || 0));

  return (
    <Modal title="Finances" onClose={ui.close}>
      <div className="dlg__stats dlg__stats--col">
        <div><span>Cash on hand</span><b>{state.cash.toLocaleString()}</b></div>
        <div><span>Bank ({Math.round(ECONOMY.bankInterest * 100)}%/day)</span><b>{state.bank.toLocaleString()}</b></div>
        <div><span>Debt ({Math.round(ECONOMY.debtInterest * 100)}%/day)</span><b className="neg">{state.debt.toLocaleString()}</b></div>
      </div>

      <div className="field-row dlg__qty">
        <label htmlFor="fin-amt">Amount</label>
        <input
          id="fin-amt"
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="dlg__actions dlg__actions--wrap">
        <button
          type="button"
          onClick={() => dispatch({ type: 'DEPOSIT', amount: amt })}
          disabled={amt <= 0 || amt > state.cash}
        >
          Deposit
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'WITHDRAW', amount: amt })}
          disabled={amt <= 0 || amt > state.bank}
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'REPAY_DEBT', amount: amt })}
          disabled={amt <= 0 || amt > Math.min(state.cash, state.debt)}
        >
          Repay Debt
        </button>
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
