import { useEffect, type ReactNode } from 'react';

/** Centered 98.css window over a scrim. Esc / close button / scrim dismiss it. */
export function Modal({
  title,
  onClose,
  children,
  closable = true,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Game-over has no dismiss; set false to hide the ✕ and ignore Esc/scrim. */
  closable?: boolean;
}) {
  useEffect(() => {
    if (!closable) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, closable]);

  return (
    <div className="modal-scrim" onClick={() => closable && onClose()}>
      <div
        className="window modal"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
          {closable && (
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={onClose} />
            </div>
          )}
        </div>
        <div className="window-body modal__body">{children}</div>
      </div>
    </div>
  );
}
