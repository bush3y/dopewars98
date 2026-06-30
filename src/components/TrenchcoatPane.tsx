import { DRUG_NAME } from '../data/gameData';
import type { DrugId, InventoryEntry } from '../data/types';

/** The "Trenchcoat. Space: X/Y" inventory list. Rows selectable to drive Sell. */
export function TrenchcoatPane({
  trenchcoat,
  spaceUsed,
  capacity,
  emptyText,
  selected,
  onSelect,
}: {
  trenchcoat: InventoryEntry[];
  spaceUsed: number;
  capacity: number;
  /** Optional hint shown when nothing is held (used in the mobile stacked view). */
  emptyText?: string;
  selected?: DrugId | null;
  onSelect?: (drug: DrugId) => void;
}) {
  return (
    <div className="pane">
      <div className="pane__caption">
        Trenchcoat. Space : {capacity - spaceUsed}/{capacity}
      </div>
      <div className="pane__list">
        <table className="grid grid--selectable">
          <thead>
            <tr>
              <th className="grid__col-name">Drug</th>
              <th className="grid__col-num">Qty</th>
              <th className="grid__col-num">Price</th>
            </tr>
          </thead>
          <tbody>
            {trenchcoat.map((row) => (
              <tr
                key={row.drug}
                className={selected === row.drug ? 'is-selected' : ''}
                onClick={() => onSelect?.(row.drug)}
                aria-selected={selected === row.drug}
              >
                <td>{DRUG_NAME[row.drug]}</td>
                <td className="grid__col-num">{row.qty.toLocaleString('en-US')}</td>
                <td className="grid__col-num">{row.price.toLocaleString('en-US')}</td>
              </tr>
            ))}
            {trenchcoat.length === 0 && emptyText && (
              <tr className="grid__no-hover">
                <td colSpan={3} className="grid__empty">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
