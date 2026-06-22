import { useState } from 'react';
import { Led } from './Led';
import { HealthBar } from './HealthBar';
import { MarketPane } from './MarketPane';
import { TrenchcoatPane } from './TrenchcoatPane';
import { MobileDrawer } from './MobileDrawer';
import type { GameSnapshot } from '../data/types';

/**
 * Portrait reflow (BRIEF.md §2). Full-bleed with safe-area insets and softened
 * corners (mobile only). Header carries the menu (☰ drawer), LED stats and a
 * slim health bar; Market and Trenchcoat are stacked, both visible, no tabs.
 * Same snapshot/data as desktop — presentation only.
 */
export function MobileLayout({ snap }: { snap: GameSnapshot }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fmt = (n: number) => n.toLocaleString('en-US');

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
          <span className="mobile__day">Day {snap.day} / {snap.maxDays}</span>
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
        </div>
      </header>

      <main className="mobile__body">
        <section className="mobile__section mobile__section--market">
          <MarketPane market={snap.market} />
        </section>
        <section className="mobile__section mobile__section--coat">
          <TrenchcoatPane
            trenchcoat={snap.trenchcoat}
            spaceUsed={snap.spaceUsed}
            capacity={snap.capacity}
            emptyText="Empty — buy drugs to fill your trenchcoat."
          />
        </section>
      </main>

      <nav className="mobile__actions">
        <button type="button">Travel</button>
        <button type="button" disabled>Buy</button>
        <button type="button" disabled>Sell</button>
        <button type="button">$</button>
      </nav>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
