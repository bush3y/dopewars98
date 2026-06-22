/** Solid blue progress fill with centered percentage, matching the screenshot. */
export function HealthBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="healthbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="healthbar__fill" style={{ width: `${pct}%` }} />
      <span className="healthbar__text">{pct}%</span>
    </div>
  );
}
