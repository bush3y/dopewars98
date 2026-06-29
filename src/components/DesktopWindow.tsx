import { useRef } from 'react';
import { MenuBar } from './MenuBar';
import { StatPanel } from './StatPanel';
import { SubwayGrid } from './SubwayGrid';
import { MarketPane } from './MarketPane';
import { TrenchcoatPane } from './TrenchcoatPane';
import { useDragWindow } from '../hooks/useDragWindow';
import { useGame } from '../game/GameContext';
import { modeLabel } from '../game/daily';
import { objectivesDone } from '../game/objectives';
import type { GameMode } from '../engine/types';

const MODE_BADGE: Record<GameMode, string> = {
  classic: 'Classic',
  dynasty: 'Dynasty',
  daily: 'Daily Challenge',
};

/**
 * The faithful square game window (BRIEF.md §2): a fixed-size 98.css window,
 * draggable by its titlebar, not resizable, centered on a desktop backdrop.
 */
export function DesktopWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const { titlebarProps } = useDragWindow(ref);
  const { snapshot: snap, state, ui, requestNewGame } = useGame();

  const held: Partial<Record<string, boolean>> = {};
  for (const row of snap.trenchcoat) held[row.drug] = true;

  return (
    <div className="window dw-window" ref={ref}>
      <div className="title-bar" {...titlebarProps}>
        <div className="title-bar-text">
          Dope Wars 98 — {modeLabel(state.mode, state.seed)} — Day {snap.day}
          {state.mode !== 'dynasty' && ` of ${snap.maxDays}`}
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
        <span className={`dw-footer__mode dw-footer__mode--${state.mode}`}>
          {MODE_BADGE[state.mode]}
        </span>
        {state.mode === 'daily' && (
          <button type="button" className="footer-objectives" onClick={() => ui.open('objectives')}>
            ⭐ {objectivesDone(state.seed, state).filter(Boolean).length}/3
          </button>
        )}
        <button
          type="button"
          onClick={() => requestNewGame(state.mode === 'daily' ? 'classic' : state.mode)}
        >
          New Game
        </button>
        <button type="button" onClick={() => requestNewGame('classic')}>Exit</button>
      </div>
    </div>
  );
}
