import { LOCATIONS, LOCATION_NAME } from '../data/gameData';
import type { LocationId } from '../data/types';

/** The "Subway from <location>" destination grid plus Buy/Sell/Finances. */
export function SubwayGrid({ current }: { current: LocationId }) {
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
              // The current location can't be travelled to (disabled in screenshot).
              disabled={loc.id === current}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="actions">
        {/* Buy/Sell are disabled until a market row is selected (Phase 1). */}
        <button type="button" disabled>Buy</button>
        <button type="button" disabled>Sell</button>
        <button type="button">Finances</button>
      </div>
    </div>
  );
}
