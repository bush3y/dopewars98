import { Led } from './Led';
import { HealthBar } from './HealthBar';
import type { GameSnapshot } from '../data/types';

/** The four LED stat rows (Cash / Bank / Debt / Guns) plus the health bar. */
export function StatPanel({ snap }: { snap: GameSnapshot }) {
  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <div className="stats">
      <div className="stat-row">
        <span className="stat-label stat-label--green">Cash:</span>
        <Led value={fmt(snap.cash)} color="green" />
      </div>
      <div className="stat-row">
        <span className="stat-label stat-label--green">Bank:</span>
        <Led value={fmt(snap.bank)} color="green" />
      </div>
      <div className="stat-row">
        <span className="stat-label stat-label--red">Debt:</span>
        <Led value={fmt(snap.debt)} color="red" />
      </div>
      <div className="stat-row">
        <span className="stat-label stat-label--yellow">Guns:</span>
        <Led value={fmt(snap.guns)} color="yellow" />
      </div>

      <div className="health">
        <span className="health__label">Health :</span>
        <HealthBar value={snap.health} />
      </div>
    </div>
  );
}
