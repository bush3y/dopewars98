import { DRUG_NAME } from '../data/gameData';
import type { DrugId, MarketEntry } from '../data/types';
import { Sparkline } from './Sparkline';

/**
 * The "Available drugs" list. Rows are selectable to drive Buy/Sell.
 * Desktop passes `held` (a dot marker, alongside a separate Trenchcoat pane);
 * mobile passes `heldQty` to render a unified "Held" column and drop that pane.
 */
export function MarketPane({
  market,
  selected,
  onSelect,
  held,
  heldQty,
  captionRight,
}: {
  market: MarketEntry[];
  selected?: DrugId | null;
  onSelect?: (drug: DrugId) => void;
  /** Desktop: drugs carried, marked with a dot. */
  held?: Partial<Record<DrugId, boolean>>;
  /** Mobile (unified): quantity carried per drug → adds a "Held" column. */
  heldQty?: Partial<Record<DrugId, number>>;
  /** Optional right-aligned caption text (e.g. coat space). */
  captionRight?: string;
}) {
  const unified = heldQty != null;

  return (
    <div className="pane">
      <div className="pane__caption">
        <span>Available drugs :</span>
        {captionRight && <span className="pane__caption-right">{captionRight}</span>}
      </div>
      <div className="pane__list">
        <table className="grid grid--selectable">
          <thead>
            <tr>
              <th className="grid__col-name">Drug</th>
              {unified && <th className="grid__col-held">Held</th>}
              <th className="grid__col-spark">Trend</th>
              <th className="grid__col-num">Price</th>
            </tr>
          </thead>
          <tbody>
            {market.map((row) => {
              const qty = heldQty?.[row.drug] ?? 0;
              return (
                <tr
                  key={row.drug}
                  className={selected === row.drug ? 'is-selected' : ''}
                  onClick={() => onSelect?.(row.drug)}
                  aria-selected={selected === row.drug}
                >
                  <td>
                    {!unified && held?.[row.drug] && (
                      <span className="grid__held" aria-label="held">●</span>
                    )}
                    {DRUG_NAME[row.drug]}
                  </td>
                  {unified && (
                    <td className={`grid__col-held ${qty > 0 ? 'is-held' : ''}`}>
                      {qty > 0 ? qty : ''}
                    </td>
                  )}
                  <td className="grid__col-spark">
                    <Sparkline data={row.history} />
                  </td>
                  <td className="grid__col-num">{row.price.toLocaleString('en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
