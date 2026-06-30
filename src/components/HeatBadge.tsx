/**
 * Police "heat" from the hardness of your current cargo (0–1). Harder, bulkier
 * product nudges up the cop-encounter odds, so this makes that risk legible.
 * Renders nothing when you're carrying nothing hot.
 */
export function HeatBadge({ heat }: { heat: number }) {
  if (heat <= 0) return null;
  const level = heat <= 0.25 ? 'Low' : heat <= 0.55 ? 'Med' : 'High';
  return (
    <span
      className={`heat heat--${level.toLowerCase()}`}
      title="Police heat — carrying more hard drugs draws more cops"
    >
      🔥 {level}
    </span>
  );
}
