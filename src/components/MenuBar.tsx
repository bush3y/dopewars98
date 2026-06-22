import { useEffect, useRef, useState } from 'react';
import { MENUS } from '../data/menu';

/** Renders a title with its accelerator letter underlined (e.g. "File"). */
function Title({ text, accel }: { text: string; accel: number }) {
  return (
    <>
      {text.slice(0, accel)}
      <u>{text[accel]}</u>
      {text.slice(accel + 1)}
    </>
  );
}

/** Win9x menu bar with click-to-open dropdowns. Items are inert stubs (Phase 0). */
export function MenuBar() {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="menubar" ref={ref}>
      {MENUS.map((menu) => (
        <div key={menu.title} className="menubar__menu">
          <button
            type="button"
            className={`menubar__item ${open === menu.title ? 'is-open' : ''}`}
            onClick={() => setOpen((o) => (o === menu.title ? null : menu.title))}
            // Hovering another title while a menu is open switches to it (Win9x).
            onMouseEnter={() => open && setOpen(menu.title)}
          >
            <Title text={menu.title} accel={menu.accel} />
          </button>

          {open === menu.title && (
            <ul className="dropdown" role="menu">
              {menu.items.map((item) => (
                <li key={item.label} role="menuitem">
                  <button
                    type="button"
                    className="dropdown__item"
                    onClick={() => setOpen(null)}
                  >
                    <span>{item.label}</span>
                    {item.phase && <span className="dropdown__hint">P{item.phase}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
