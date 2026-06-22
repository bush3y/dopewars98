import { useState } from 'react';
import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { DRUG_NAME } from '../../data/gameData';
import type { DrugId } from '../../data/types';

export function SellDialog({ drug }: { drug: DrugId }) {
  const { state, dispatch, ui } = useGame();
  const price = state.market[drug];
  const held = state.inventory[drug];
  const maxQty = held?.qty ?? 0;
  const avg = held?.avgPrice ?? 0;
  const [qty, setQty] = useState(maxQty);

  const clamped = Math.max(0, Math.min(qty || 0, maxQty));
  const total = clamped * price;
  const profit = clamped * (price - avg);

  const sell = () => {
    dispatch({ type: 'SELL', drug, qty: clamped });
    ui.select(null);
    ui.close();
  };

  return (
    <Modal title={`Sell ${DRUG_NAME[drug]}`} onClose={ui.close}>
      <div className="dlg__stats">
        <div><span>Price</span><b>{price.toLocaleString()}</b></div>
        <div><span>You hold</span><b>{maxQty}</b></div>
        <div><span>Avg. paid</span><b>{avg.toLocaleString()}</b></div>
        <div>
          <span>P/L each</span>
          <b className={price - avg >= 0 ? 'pos' : 'neg'}>
            {(price - avg).toLocaleString()}
          </b>
        </div>
      </div>

      <div className="field-row dlg__qty">
        <label htmlFor="sell-qty">Quantity</label>
        <input
          id="sell-qty"
          type="number"
          min={0}
          max={maxQty}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10))}
        />
        <button type="button" onClick={() => setQty(maxQty)} disabled={maxQty === 0}>
          Max
        </button>
      </div>

      <div className="dlg__total">
        Total: <b>{total.toLocaleString()}</b>{' '}
        <span className={profit >= 0 ? 'pos' : 'neg'}>
          ({profit >= 0 ? '+' : ''}{profit.toLocaleString()})
        </span>
      </div>

      <div className="dlg__actions">
        <button type="button" onClick={sell} disabled={clamped <= 0}>Sell</button>
        <button type="button" onClick={ui.close}>Cancel</button>
      </div>
    </Modal>
  );
}
