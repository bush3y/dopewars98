import { useRef } from 'react';
import { MenuBar } from './MenuBar';
import { StatPanel } from './StatPanel';
import { SubwayGrid } from './SubwayGrid';
import { MarketPane } from './MarketPane';
import { TrenchcoatPane } from './TrenchcoatPane';
import { useDragWindow } from '../hooks/useDragWindow';
import type { GameSnapshot } from '../data/types';

/**
 * The faithful square game window (BRIEF.md §2): a fixed-size 98.css window,
 * draggable by its titlebar, not resizable, centered on a desktop backdrop.
 */
export function DesktopWindow({ snap }: { snap: GameSnapshot }) {
  const ref = useRef<HTMLDivElement>(null);
  const { titlebarProps } = useDragWindow(ref);

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
          <MarketPane market={snap.market} />
        </div>

        <div className="dw-right">
          <SubwayGrid current={snap.location} />
          <TrenchcoatPane
            trenchcoat={snap.trenchcoat}
            spaceUsed={snap.spaceUsed}
            capacity={snap.capacity}
          />
        </div>
      </div>

      <div className="status-bar dw-footer">
        <button type="button" disabled>New Game</button>
        <button type="button">Exit</button>
      </div>
    </div>
  );
}
