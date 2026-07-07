import { Children, isValidElement, useEffect, type ReactNode } from 'react';

/** True for the `.dlg__actions` footer row that dialogs render as their last child. */
function isActions(node: ReactNode): boolean {
  if (!isValidElement<{ className?: string }>(node)) return false;
  const cls = node.props.className;
  return typeof cls === 'string' && cls.split(' ').includes('dlg__actions');
}

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

  // Pull the actions row out of the scrolling body so it sits in a fixed footer.
  // Otherwise a sticky footer inside the scroller paints over the content at the
  // viewport bottom (e.g. the Share/Copy buttons in game-over), hiding it until
  // the user scrolls all the way down.
  const kids = Children.toArray(children);
  const actions = kids.filter(isActions);
  const body = kids.filter((k) => !isActions(k));

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
        <div className="window-body modal__body">{body}</div>
        {actions.length > 0 && <div className="modal__footer">{actions}</div>}
      </div>
    </div>
  );
}
