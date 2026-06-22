import { useCallback, useRef } from 'react';

/**
 * Makes a window draggable by its titlebar (BRIEF.md §2 "Desktop window").
 * Not resizable by design. Returns props to spread onto the titlebar element.
 */
export function useDragWindow(ref: React.RefObject<HTMLDivElement | null>) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      // Ignore clicks on the titlebar control buttons.
      if ((e.target as HTMLElement).closest('.title-bar-controls')) return;

      const rect = el.getBoundingClientRect();
      drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      el.style.position = 'absolute';
      el.style.margin = '0';

      const onMove = (ev: PointerEvent) => {
        if (!drag.current || !ref.current) return;
        ref.current.style.left = `${ev.clientX - drag.current.dx}px`;
        ref.current.style.top = `${ev.clientY - drag.current.dy}px`;
      };
      const onUp = () => {
        drag.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [ref],
  );

  return { titlebarProps: { onPointerDown, style: { cursor: 'move' as const } } };
}
