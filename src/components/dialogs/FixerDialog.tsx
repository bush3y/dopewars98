import { Modal } from '../Modal';
import { useGame } from '../../game/GameContext';
import { fixerPerks, fixerPerkDef, FIXER } from '../../data/fixer';

/**
 * The Fixer — 3 perks a day, usable once each and held until you want them. The
 * same three for everyone on a given seed (the Daily's seed is the date), so in
 * the Daily it's a shared strategic layer, not an advantage. Unlocks at day
 * FIXER.unlockDay.
 */
export function FixerDialog() {
  const { state, dispatch, ui } = useGame();
  const unlocked = state.day >= FIXER.unlockDay;
  const perks = fixerPerks(state.seed);
  const used = state.fixerUsed ?? [];

  return (
    <Modal title="The Fixer" onClose={ui.close}>
      {!unlocked ? (
        <p className="dlg__message">
          The Fixer doesn't deal with nobodies. Make a name for yourself and he'll be in touch
          around <b>day {FIXER.unlockDay}</b>.
        </p>
      ) : (
        <>
          <p className="dlg__message">
            Today's angles — use each once, whenever you like. Fresh set tomorrow.
          </p>
          <ul className="fixer">
            {perks.map((id) => {
              const def = fixerPerkDef(id);
              const isUsed = used.includes(id);
              return (
                <li key={id} className={isUsed ? 'fixer__item is-used' : 'fixer__item'}>
                  <div className="fixer__info">
                    <span className="fixer__title">{def.title}</span>
                    <span className="fixer__desc">{def.description}</span>
                  </div>
                  <button
                    type="button"
                    className="fixer__use"
                    disabled={isUsed}
                    onClick={() => dispatch({ type: 'USE_PERK', perk: id })}
                  >
                    {isUsed ? 'Used' : 'Use'}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <div className="dlg__actions">
        <button type="button" onClick={ui.close}>Close</button>
      </div>
    </Modal>
  );
}
