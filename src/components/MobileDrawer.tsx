import { useEffect, useState } from 'react';
import { MENUS } from '../data/menu';
import { CITIES } from '../data/cities';
import { useGame } from '../game/GameContext';
import { runMenuItem } from '../game/menuActions';

// Sections start collapsed so the drawer is a short, tidy category list.
const DEFAULT_COLLAPSED = MENUS.map((m) => m.title);

/**
 * Slide-out menu drawer for mobile — the home for everything that isn't the core
 * loop (File/View/Sounds/Help), mirroring the desktop menu bar from one source.
 * Sections collapse/expand (accordion) to keep the list short.
 */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const game = useGame();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(DEFAULT_COLLAPSED));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggle = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const activeCity = CITIES.find((c) => c.id === game.city)?.name;

  // When collapsed, show the section's current selection (mode / city) as a hint.
  const hintFor = (menu: (typeof MENUS)[number]): string | undefined => {
    if (menu.items.some((i) => i.city)) return activeCity;
    if (menu.items.some((i) => i.mode))
      return menu.items.find((i) => i.mode === game.state.mode)?.label;
    return undefined;
  };

  return (
    <>
      <div
        className={`drawer__scrim ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`drawer ${open ? 'is-open' : ''}`} role="menu" aria-hidden={!open}>
        <div className="drawer__head">
          <span className="drawer__brand">DOPE WARS <span className="brand-98">98</span></span>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        {MENUS.map((menu) => {
          const isCollapsed = collapsed.has(menu.title);
          const hint = hintFor(menu);
          return (
            <div key={menu.title} className="drawer__group">
              <button
                type="button"
                className="drawer__group-title"
                onClick={() => toggle(menu.title)}
                aria-expanded={!isCollapsed}
              >
                <span className="drawer__chevron">{isCollapsed ? '▸' : '▾'}</span>
                <span>{menu.title}</span>
                {isCollapsed && hint && <span className="drawer__group-hint">{hint}</span>}
              </button>
              {!isCollapsed &&
                menu.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="drawer__item"
                    onClick={() => {
                      if (item.city) game.setCity(item.city);
                      else if (item.random) game.randomCity();
                      else runMenuItem(item.label, game);
                      onClose();
                    }}
                  >
                    <span>
                      {((item.mode && game.state.mode === item.mode) ||
                        (item.city && game.city === item.city) ||
                        (item.label === 'Sound On / Off' && game.settings.sound)) ? '✓ ' : ''}
                      {item.label}
                    </span>
                    {item.phase && <span className="dropdown__hint">P{item.phase}</span>}
                  </button>
                ))}
            </div>
          );
        })}
      </aside>
    </>
  );
}
