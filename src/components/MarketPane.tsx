import { DRUG_NAME } from '../data/gameData';
import type { MarketEntry } from '../data/types';

/** The "Available drugs" list: drug name + price, sunken-panel styling. */
export function MarketPane({ market }: { market: MarketEntry[] }) {
  return (
    <div className="pane">
      <div className="pane__caption">Available drugs :</div>
      <div className="pane__list">
        <table className="grid">
          <thead>
            <tr>
              <th className="grid__col-name">Drug</th>
              <th className="grid__col-num">Price</th>
            </tr>
          </thead>
          <tbody>
            {market.map((row) => (
              <tr key={row.drug}>
                <td>{DRUG_NAME[row.drug]}</td>
                <td className="grid__col-num">{row.price.toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
