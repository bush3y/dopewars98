import { DRUG_NAME } from '../data/gameData';
import type { DrugId, MarketEntry } from '../data/types';
import { Sparkline } from './Sparkline';
import { HeatBadge } from './HeatBadge';

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
  heldAvg,
  captionRight,
  heat,
}: {
  market: MarketEntry[];
  selected?: DrugId | null;
  onSelect?: (drug: DrugId) => void;
  /** Desktop: drugs carried, marked with a dot. */
  held?: Partial<Record<DrugId, boolean>>;
  /** Mobile (unified): quantity carried per drug → adds a "Held" column. */
  heldQty?: Partial<Record<DrugId, number>>;
  /** Mobile (unified): average price paid per held drug → shows a "paid" note. */
  heldAvg?: Partial<Record<DrugId, number>>;
  /** Optional right-aligned caption text (e.g. coat space). */
  captionRight?: string;
  /** Police heat (0–1) from cargo; shows a 🔥 badge in the caption when > 0. */
  heat?: number;
}) {
  const unified = heldQty != null;

  return (
    <div className="pane">
      <div className="pane__caption">
        <span>Available drugs :</span>
        <span className="pane__caption-right">
          {heat != null && <HeatBadge heat={heat} />}
          {captionRight}
        </span>
      </div>
      <div className="pane__list">
        <table className={`grid grid--selectable ${unified ? 'grid--unified' : ''}`}>
          <thead>
            <tr>
              <th className="grid__col-name">Drug</th>
              {unified && <th className="grid__col-qty">Qty</th>}
              {unified && <th className="grid__col-paid">Paid</th>}
              <th className="grid__col-spark">Trend</th>
              <th className="grid__col-num">Price</th>
            </tr>
          </thead>
          <tbody>
            {market.map((row) => {
              const qty = heldQty?.[row.drug] ?? 0;
              const heldCls = qty > 0 ? 'is-held' : '';
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
                    <td className={`grid__col-qty ${heldCls}`}>{qty > 0 ? qty : ''}</td>
                  )}
                  {unified && (
                    <td className={`grid__col-paid ${heldCls}`}>
                      {qty > 0 ? (heldAvg?.[row.drug] ?? 0).toLocaleString('en-US') : ''}
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
