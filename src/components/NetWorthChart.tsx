/**
 * End-of-run net-worth curve (cash + bank − debt over the days played).
 * Lightweight hand-rolled SVG: a zero baseline, the curve, and min/max labels.
 */
export function NetWorthChart({ data }: { data: number[] }) {
  const width = 300;
  const height = 140;
  const padX = 6;
  const padY = 10;

  if (data.length === 0) {
    return <div className="chart chart--empty">No data yet.</div>;
  }

  const min = Math.min(0, ...data);
  const max = Math.max(0, ...data);
  const span = max - min || 1;
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
  const y = (v: number) => padY + (1 - (v - min) / span) * (height - padY * 2);

  const pts = data.map((v, i) => `${(padX + i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  const last = data[data.length - 1];

  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart__svg" role="img" aria-label="Net worth over time">
        {/* zero baseline */}
        <line x1={padX} y1={zeroY} x2={width - padX} y2={zeroY} className="chart__zero" />
        <polyline points={pts} className="chart__line" fill="none" />
        {data.length > 0 && (
          <circle cx={padX + (data.length - 1) * stepX} cy={y(last)} r={2.5} className="chart__dot" />
        )}
      </svg>
      <div className="chart__axis">
        <span>peak {fmt(max)}</span>
        <span>day {data.length}</span>
        <span>low {fmt(min)}</span>
      </div>
    </div>
  );
}
