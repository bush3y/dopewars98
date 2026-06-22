import { LOCATIONS, LOCATION_NAME } from '../data/gameData';
import { useGame } from '../game/GameContext';

/** The "Subway from <location>" grid plus Buy/Sell/Finances, wired to the engine. */
export function SubwayGrid() {
  const { state, dispatch, ui } = useGame();
  const current = state.location;
  const isLastDay = state.day >= state.maxDays;

  const canSell = ui.selected != null && !!state.inventory[ui.selected];

  return (
    <div className="subway">
      <fieldset className="subway__box">
        <legend>Subway from {LOCATION_NAME[current]} :</legend>
        <div className="subway__grid">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="subway__dest"
              disabled={loc.id === current}
              onClick={() => dispatch({ type: 'TRAVEL', location: loc.id })}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </fieldset>

      {isLastDay && <div className="subway__note">Final day — travel to end the run.</div>}

      <div className="actions">
        <button type="button" disabled={ui.selected == null} onClick={() => ui.open('buy')}>
          Buy
        </button>
        <button type="button" disabled={!canSell} onClick={() => ui.open('sell')}>
          Sell
        </button>
        <button type="button" onClick={() => ui.open('finances')}>Finances</button>
      </div>
    </div>
  );
}
