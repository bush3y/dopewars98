import { useState } from 'react';
import { Led } from './Led';
import { HealthBar } from './HealthBar';
import { MarketPane } from './MarketPane';
import { TrenchcoatPane } from './TrenchcoatPane';
import { MobileDrawer } from './MobileDrawer';
import { useGame } from '../game/GameContext';
import { modeLabel } from '../game/daily';
import { rankName } from '../data/ranks';

/**
 * Portrait reflow (BRIEF.md §2). Full-bleed with safe-area insets and softened
 * corners. Header carries the menu (☰ drawer), LED stats and a slim health bar;
 * Market and Trenchcoat are stacked, both visible, no tabs. Action bar wires the
 * loop (Travel/Buy/Sell/Finances). Same state as desktop — presentation only.
 */
export function MobileLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { snapshot: snap, state, ui } = useGame();
  const fmt = (n: number) => n.toLocaleString('en-US');

  const held: Partial<Record<string, boolean>> = {};
  for (const row of snap.trenchcoat) held[row.drug] = true;
  const canSell = ui.selected != null && !!state.inventory[ui.selected];

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
          <span className="mobile__day">
            Day {snap.day}{state.mode !== 'dynasty' && ` / ${snap.maxDays}`}
          </span>
        </div>
        <div className={`mobile__mode mobile__mode--${state.mode}`}>
          {modeLabel(state.mode, state.seed)}
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
          <span className="mobile__rank">{rankName(snap.cash + snap.bank - snap.debt)}</span>
        </div>
      </header>

      <main className="mobile__body">
        <section className="mobile__section mobile__section--market">
          <MarketPane
            market={snap.market}
            selected={ui.selected}
            onSelect={ui.select}
            held={held}
          />
        </section>
        <section className="mobile__section mobile__section--coat">
          <TrenchcoatPane
            trenchcoat={snap.trenchcoat}
            spaceUsed={snap.spaceUsed}
            capacity={snap.capacity}
            emptyText="Empty — buy drugs to fill your trenchcoat."
            selected={ui.selected}
            onSelect={ui.select}
          />
        </section>
      </main>

      <button
        type="button"
        className="gunshop-btn mobile__gunshop"
        disabled={!state.gunShopOpen}
        onClick={() => ui.open('gun-shop')}
      >
        {state.gunShopOpen ? "🔫 Dan's Gun Shop is open" : '🔒 Gun Shop closed'}
      </button>

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
