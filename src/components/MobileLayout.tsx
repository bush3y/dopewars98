import { useState } from 'react';
import { Led } from './Led';
import { HealthBar } from './HealthBar';
import { MarketPane } from './MarketPane';
import { MobileDrawer } from './MobileDrawer';
import { useGame } from '../game/GameContext';
import { objectivesDone } from '../game/objectives';
import { rankName } from '../data/ranks';
import { locationName } from '../data/cities';
import type { DrugId } from '../data/types';
import type { GameMode } from '../engine/types';

const MODE_SHORT: Record<GameMode, string> = {
  classic: 'Classic',
  dynasty: 'Dynasty',
  daily: 'Daily',
};

/**
 * Portrait reflow (BRIEF.md §2). Full-bleed with safe-area insets and softened
 * corners. Structured header: brand + rank/mode chips, a location + day line, LED
 * stats, then a full-width health bar. A single unified drug list shows Held qty
 * inline. Action bar wires the loop. Same state as desktop — presentation only.
 */
export function MobileLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { snapshot: snap, state, ui, city } = useGame();
  const fmt = (n: number) => n.toLocaleString('en-US');

  const heldQty: Partial<Record<DrugId, number>> = {};
  const heldAvg: Partial<Record<DrugId, number>> = {};
  for (const row of snap.trenchcoat) {
    heldQty[row.drug] = row.qty;
    heldAvg[row.drug] = row.price; // avg price paid
  }
  const canSell = ui.selected != null && !!state.inventory[ui.selected];
  const netWorth = snap.cash + snap.bank - snap.debt;
  const objCount =
    state.mode === 'daily' ? objectivesDone(state.seed, state).filter(Boolean).length : 0;

  return (
    <div className="mobile">
      <header className="mobile__header">
        <div className="mobile__title">
          <button
            type="button"
            className="mobile__menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="mobile__brand">DOPE WARS</span>
          <span className={`mobile__mode mobile__mode--${state.mode}`}>
            {MODE_SHORT[state.mode]}
          </span>
        </div>

        <div className="mobile__where">
          <span className="mobile__loc">📍 {locationName(city, snap.location)}</span>
          <span className="mobile__day">
            Day {snap.day}{state.mode !== 'dynasty' && ` / ${snap.maxDays}`}
          </span>
        </div>

        <div className="mobile__stats">
          <div className="mobile__stat">
            <span className="stat-label stat-label--green">Cash</span>
            <Led value={fmt(snap.cash)} color="green" digits={6} />
          </div>
          <div className="mobile__stat">
            <span className="stat-label stat-label--green">Bank</span>
            <Led value={fmt(snap.bank)} color="green" digits={6} />
          </div>
          <div className="mobile__stat">
            <span className="stat-label stat-label--red">Debt</span>
            <Led value={fmt(snap.debt)} color="red" digits={6} />
          </div>
        </div>

        <div className="mobile__health">
          <span className="health__label">Health</span>
          <HealthBar value={snap.health} />
          <button
            type="button"
            className="mobile__rank-chip"
            onClick={() => ui.open('ranks')}
            aria-label="View ranks"
          >
            🎖 {rankName(netWorth)}
          </button>
        </div>
      </header>

      <main className="mobile__body">
        <section className="mobile__section mobile__section--market">
          <MarketPane
            market={snap.market}
            selected={ui.selected}
            onSelect={ui.select}
            heldQty={heldQty}
            heldAvg={heldAvg}
            captionRight={`Coat ${snap.capacity - snap.spaceUsed}/${snap.capacity} free`}
          />
        </section>
      </main>

      <div className="mobile__subbar">
        <button
          type="button"
          className="gunshop-btn mobile__gunshop"
          disabled={!state.gunShopOpen}
          onClick={() => ui.open('gun-shop')}
        >
          {state.gunShopOpen ? "🔫 Dan's Gun Shop" : '🔒 Gun Shop closed'}
        </button>
        {state.mode === 'daily' && (
          <button type="button" className="gunshop-btn mobile__obj-btn" onClick={() => ui.open('objectives')}>
            ⭐ Objectives {objCount}/3
          </button>
        )}
      </div>

      <nav className="mobile__actions">
        <button type="button" onClick={() => ui.open('travel')}>Travel</button>
        <button type="button" disabled={ui.selected == null} onClick={() => ui.open('buy')}>
          Buy
        </button>
        <button type="button" disabled={!canSell} onClick={() => ui.open('sell')}>
          Sell
        </button>
        <button type="button" onClick={() => ui.open('finances')}>$</button>
      </nav>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
