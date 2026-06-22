import { DRUG_NAME } from '../data/gameData';
import type { DrugId, MarketEntry } from '../data/types';

/** The "Available drugs" list. Rows are selectable to drive Buy/Sell. */
export function MarketPane({
  market,
  selected,
  onSelect,
  held,
}: {
  market: MarketEntry[];
  selected?: DrugId | null;
  onSelect?: (drug: DrugId) => void;
  /** Drugs currently carried, marked with a dot so holdings are visible here. */
  held?: Partial<Record<DrugId, boolean>>;
}) {
  return (
    <div className="pane">
      <div className="pane__caption">Available drugs :</div>
      <div className="pane__list">
        <table className="grid grid--selectable">
          <thead>
            <tr>
              <th className="grid__col-name">Drug</th>
              <th className="grid__col-num">Price</th>
            </tr>
          </thead>
          <tbody>
            {market.map((row) => (
              <tr
                key={row.drug}
                className={selected === row.drug ? 'is-selected' : ''}
                onClick={() => onSelect?.(row.drug)}
                aria-selected={selected === row.drug}
              >
                <td>
                  {held?.[row.drug] && <span className="grid__held" aria-label="held">●</span>}
                  {DRUG_NAME[row.drug]}
                </td>
                <td className="grid__col-num">{row.price.toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
