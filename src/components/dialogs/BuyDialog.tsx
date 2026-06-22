import { useState } from 'react';
import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { spaceUsed } from '../../engine/reducer';
import { DRUG_NAME } from '../../data/gameData';
import type { DrugId } from '../../data/types';

export function BuyDialog({ drug }: { drug: DrugId }) {
  const { state, dispatch, ui } = useGame();
  const price = state.market[drug];
  const room = state.capacity - spaceUsed(state);
  const maxQty = Math.max(0, Math.min(room, Math.floor(state.cash / price)));
  const [qty, setQty] = useState(maxQty);

  const clamped = Math.max(0, Math.min(qty || 0, maxQty));
  const total = clamped * price;

  const buy = () => {
    dispatch({ type: 'BUY', drug, qty: clamped });
    ui.select(null);
    ui.close();
  };

  return (
    <Modal title={`Buy ${DRUG_NAME[drug]}`} onClose={ui.close}>
      <div className="dlg__stats">
        <div><span>Price</span><b>{price.toLocaleString()}</b></div>
        <div><span>Cash</span><b>{state.cash.toLocaleString()}</b></div>
        <div><span>Coat space</span><b>{room}</b></div>
        <div><span>Can afford</span><b>{maxQty}</b></div>
      </div>

      <div className="field-row dlg__qty">
        <label htmlFor="buy-qty">Quantity</label>
        <input
          id="buy-qty"
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

      <div className="dlg__total">Total: <b>{total.toLocaleString()}</b></div>

      <div className="dlg__actions">
        <button type="button" onClick={buy} disabled={clamped <= 0}>Buy</button>
        <button type="button" onClick={ui.close}>Cancel</button>
      </div>
    </Modal>
  );
}
