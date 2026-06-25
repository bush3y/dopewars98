/** A tiny inline price trend. No chart lib — just a normalized SVG polyline. */
export function Sparkline({
  data,
  width = 56,
  height = 16,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) {
    // Single observation — a flat baseline so the column doesn't jump.
    return (
      <svg className="sparkline" width={width} height={height} aria-hidden>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 1.5;
  const stepX = (width - pad * 2) / (data.length - 1);

  const pts = data
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const rising = data[data.length - 1] >= data[0];

  return (
    <svg className={`sparkline ${rising ? 'sparkline--up' : 'sparkline--down'}`} width={width} height={height} aria-hidden>
      <polyline points={pts} fill="none" />
    </svg>
  );
}
