import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { LOCATIONS } from '../../data/gameData';
import { locationName, transportWord } from '../../data/cities';

/** Mobile travel picker — the destinations the desktop shows inline as the grid. */
export function TravelDialog() {
  const { state, dispatch, ui, city } = useGame();
  const isLastDay = state.mode !== 'endless' && state.day >= state.maxDays;

  const travel = (location: typeof LOCATIONS[number]['id']) => {
    dispatch({ type: 'TRAVEL', location });
    ui.close();
  };

  return (
    <Modal title={`${transportWord(city)} from ${locationName(city, state.location)}`} onClose={ui.close}>
      {isLastDay && <p className="dlg__message">Final day — travelling ends the run.</p>}
      <div className="travel-grid">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            type="button"
            disabled={loc.id === state.location}
            onClick={() => travel(loc.id)}
          >
            {locationName(city, loc.id)}
          </button>
        ))}
      </div>
    </Modal>
  );
}
