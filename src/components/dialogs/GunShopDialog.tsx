import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { GUNS } from '../../data/guns';
import { spaceUsed } from '../../engine/reducer';

/** Dan's Gun Shop — buy guns when it's open here. Guns take coat space. */
export function GunShopDialog() {
  const { state, dispatch, ui } = useGame();
  const room = state.capacity - spaceUsed(state);

  return (
    <Modal title="Dan's Gun Shop" onClose={ui.close}>
      <p className="dlg__message">Coat space free: <b>{room}</b></p>
      <table className="grid shop">
        <thead>
          <tr>
            <th className="grid__col-name">Gun</th>
            <th className="grid__col-num">Owned</th>
            <th className="grid__col-num">Space</th>
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
                <td>{g.name}</td>
                <td className="grid__col-num">{owned}</td>
                <td className="grid__col-num">{g.space}</td>
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
