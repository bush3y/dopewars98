/**
 * Net-worth curve (cash + bank − debt) for each day played. Left = day 1, right =
 * the latest day; the dashed line is $0 (break-even). Proper axes: net-worth
 * scale (max/min) down the left, day range across the bottom.
 */
export function NetWorthChart({ data }: { data: number[] }) {
  const width = 300;
  const height = 132;
  const padX = 4;
  const padY = 8;

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
      <div className="chart__head">
        <span className="chart__title">Net worth by day</span>
      </div>
      <div className="chart__body">
        <div className="chart__yaxis">
          <span>{fmt(max)}</span>
          <span>{fmt(min)}</span>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart__svg"
          role="img"
          aria-label="Net worth over time"
          preserveAspectRatio="none"
        >
          <line x1={padX} y1={zeroY} x2={width - padX} y2={zeroY} className="chart__zero" />
          <text x={padX + 2} y={zeroY - 3} className="chart__zero-label">$0</text>
          <polyline points={pts} className="chart__line" fill="none" />
          <circle cx={padX + (data.length - 1) * stepX} cy={y(last)} r={2.5} className="chart__dot" />
        </svg>
      </div>
      <div className="chart__x">
        <span>Day 1</span>
        <span>Day {data.length}</span>
      </div>
    </div>
  );
}
