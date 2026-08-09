import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { GUNS } from '../../data/guns';
import { spaceUsed, effectiveCapacity } from '../../engine/reducer';

/** Dan's Gun Shop — buy guns when it's open here. Guns take coat space. */
export function GunShopDialog() {
  const { state, dispatch, ui } = useGame();
  const room = Math.max(0, effectiveCapacity(state) - spaceUsed(state));

  return (
    <Modal title="Dan's Gun Shop" onClose={ui.close} className="modal--shop">
      <p className="dlg__message">
        Guns take coat space and set your fight odds — each one different.
        Space free: <b>{room}</b>.
      </p>
      <table className="grid shop">
        <thead>
          <tr>
            <th className="grid__col-name">Gun</th>
            <th className="grid__col-num shop__col-owned">Owned</th>
            <th className="grid__col-num shop__col-space">Space</th>
            <th className="grid__col-num">Price</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {GUNS.map((g) => {
            const owned = state.guns[g.id] ?? 0;
            const canBuy = state.cash >= g.price && room >= g.space;
            return (
              <tr key={g.id}>
                <td>
                  <span className="shop__gun-name">
                    {g.name}
                    {/* Space column is hidden on mobile, so show it inline there. */}
                    <span className="shop__gun-slots"> · {g.space} slots</span>
                  </span>
                  <span className="shop__gun-role">{g.role}</span>
                </td>
                <td className="grid__col-num shop__col-owned">{owned}</td>
                <td className="grid__col-num shop__col-space">{g.space}</td>
                <td className="grid__col-num">{g.price.toLocaleString()}</td>
                <td className="grid__col-num">
                  <button
                    type="button"
                    className="shop__buy"
                    disabled={!canBuy}
                    onClick={() => dispatch({ type: 'BUY_GUN', gun: g.id })}
                  >
                    Buy
                  </button>
                </td>
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
