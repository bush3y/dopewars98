import { useEffect } from 'react';
import { MENUS } from '../data/menu';
import { useGame } from '../game/GameContext';
import { runMenuItem } from '../game/menuActions';

/**
 * Slide-out menu drawer for mobile — the home for everything that isn't the core
 * loop (File/View/Sounds/Help), mirroring the desktop menu bar from one source.
 */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const game = useGame();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawer__scrim ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`drawer ${open ? 'is-open' : ''}`} role="menu" aria-hidden={!open}>
        <div className="drawer__head">
          <span className="drawer__brand">DOPE WARS</span>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        {MENUS.map((menu) => (
          <div key={menu.title} className="drawer__group">
            <div className="drawer__group-title">{menu.title}</div>
            {menu.items.map((item) => (
              <button
                key={item.label}
                type="button"
                className="drawer__item"
                onClick={() => {
                  runMenuItem(item.label, game);
                  onClose();
                }}
              >
                <span>
                  {item.label === 'Sound On / Off' && game.settings.sound ? '✓ ' : ''}
                  {item.label}
                </span>
                {item.phase && <span className="dropdown__hint">P{item.phase}</span>}
              </button>
            ))}
          </div>
        ))}
      </aside>
    </>
  );
}
