import { LOCATIONS } from '../data/gameData';
import { locationName, transportWord } from '../data/cities';
import { useGame } from '../game/GameContext';

/** The "<transport> from <neighborhood>" grid plus Buy/Sell/Finances. */
export function SubwayGrid() {
  const { state, dispatch, ui, city } = useGame();
  const current = state.location;
  const isLastDay = state.mode !== 'endless' && state.day >= state.maxDays;

  const canSell = ui.selected != null && !!state.inventory[ui.selected];

  return (
    <div className="subway">
      <fieldset className="subway__box">
        <legend>{transportWord(city)} from {locationName(city, current)} :</legend>
        <div className="subway__grid">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="subway__dest"
              disabled={loc.id === current}
              onClick={() => dispatch({ type: 'TRAVEL', location: loc.id })}
            >
              {locationName(city, loc.id)}
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

      {/* Always shown so the shop reads as periodic, not gone — dimmed when shut. */}
      <button
        type="button"
        className="gunshop-btn"
        disabled={!state.gunShopOpen}
        onClick={() => ui.open('gun-shop')}
      >
        {state.gunShopOpen ? "🔫 Dan's Gun Shop is open" : '🔒 Gun Shop closed'}
      </button>
    </div>
  );
}
