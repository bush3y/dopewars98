import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { LOCATIONS, LOCATION_NAME } from '../../data/gameData';

/** Mobile travel picker — the destinations the desktop shows inline as the grid. */
export function TravelDialog() {
  const { state, dispatch, ui } = useGame();
  const isLastDay = state.day >= state.maxDays;

  const travel = (location: typeof LOCATIONS[number]['id']) => {
    dispatch({ type: 'TRAVEL', location });
    ui.close();
  };

  return (
    <Modal title={`Subway from ${LOCATION_NAME[state.location]}`} onClose={ui.close}>
      {isLastDay && <p className="dlg__message">Final day — travelling ends the run.</p>}
      <div className="travel-grid">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            type="button"
            disabled={loc.id === state.location}
            onClick={() => travel(loc.id)}
          >
            {loc.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}
