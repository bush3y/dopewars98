import { useRef } from 'react';
import { MenuBar } from './MenuBar';
import { StatPanel } from './StatPanel';
import { SubwayGrid } from './SubwayGrid';
import { MarketPane } from './MarketPane';
import { TrenchcoatPane } from './TrenchcoatPane';
import { useDragWindow } from '../hooks/useDragWindow';
import { useGame } from '../game/GameContext';

/**
 * The faithful square game window (BRIEF.md §2): a fixed-size 98.css window,
 * draggable by its titlebar, not resizable, centered on a desktop backdrop.
 */
export function DesktopWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const { titlebarProps } = useDragWindow(ref);
  const { snapshot: snap, state, ui } = useGame();

  const held: Partial<Record<string, boolean>> = {};
  for (const row of snap.trenchcoat) held[row.drug] = true;

  return (
    <div className="window dw-window" ref={ref}>
      <div className="title-bar" {...titlebarProps}>
        <div className="title-bar-text">
          Dope Wars, Day {snap.day} of {snap.maxDays}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>

      <MenuBar />

      <div className="window-body dw-body">
        <div className="dw-left">
          <StatPanel snap={snap} />
          <MarketPane
            market={snap.market}
            selected={ui.selected}
            onSelect={ui.select}
            held={held}
          />
        </div>

        <div className="dw-right">
          <SubwayGrid />
          <TrenchcoatPane
            trenchcoat={snap.trenchcoat}
            spaceUsed={snap.spaceUsed}
            capacity={snap.capacity}
            selected={ui.selected}
            onSelect={ui.select}
          />
        </div>
      </div>

      <div className="status-bar dw-footer">
        <span className="dw-footer__mode">
          {state.mode === 'daily' ? 'Daily' : 'Classic'}
        </span>
        <button type="button" onClick={() => ui.open('new-game')}>New Game</button>
        <button type="button" onClick={() => ui.open('new-game')}>Exit</button>
      </div>
    </div>
  );
}
