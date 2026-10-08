/*
  Actual sales vs forecast demand line chart drawn with plain SVG.
  data: [{ date: 'YYYY-MM-DD', actual?: number, forecast?: number }]
*/
import { formatShortDate } from '../../utils/format';

const W = 640;
const H = 260;
const PAD = { top: 20, right: 20, bottom: 36, left: 56 };

export default function DemandChart({ data, unitLabel = 'Units' }) {
  const values = data.map((d) => d.actual ?? d.forecast);
  const max = Math.ceil((Math.max(...values) * 1.3) / 5) * 5;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v) => PAD.top + innerH - (v / max) * innerH;

  const actualPts = data.map((d, i) => (d.actual != null ? [x(i), y(d.actual)] : null)).filter(Boolean);
  const firstForecast = data.findIndex((d) => d.forecast != null);
  // Join the forecast line to the last actual point so the lines connect
  const forecastPts = data
    .map((d, i) => {
      if (d.forecast != null) return [x(i), y(d.forecast)];
      if (i === firstForecast - 1) return [x(i), y(d.actual)];
      return null;
    })
    .filter(Boolean);

  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const ticks = [0, max / 2, max].map(Math.round);
  const todayX = firstForecast > 0 ? x(firstForecast) - innerW / (data.length - 1) / 2 : null;
  const labelEvery = data.length > 16 ? 3 : data.length > 10 ? 2 : 1;
  const forecastTotal = data.reduce((s, d) => s + (d.forecast ?? 0), 0);

  return (
    <figure className="chart">
      <div className="chart-legend">
        <span><i className="legend-line legend-actual" /> Actual sales</span>
        <span><i className="legend-line legend-forecast" /> Forecast demand</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily sales and forecast. Forecast total ${forecastTotal} units.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e1e4dc" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="chart-axis">
              {t}
            </text>
          </g>
        ))}
        <text x={12} y={PAD.top + innerH / 2} className="chart-axis" transform={`rotate(-90 12 ${PAD.top + innerH / 2})`} textAnchor="middle">
          {unitLabel}
        </text>

        {todayX && (
          <g>
            <rect x={todayX} y={PAD.top} width={W - PAD.right - todayX} height={innerH} fill="#fdf1d3" opacity="0.45" />
            <text x={todayX + 6} y={PAD.top + 12} className="chart-axis">Forecast period</text>
          </g>
        )}

        {data.map((d, i) => (i % labelEvery === 0 ? (
          <text key={d.date} x={x(i)} y={H - 12} textAnchor="middle" className="chart-axis">
            {formatShortDate(d.date)}
          </text>
        ) : null))}

        <path d={line(actualPts)} fill="none" stroke="var(--green-700)" strokeWidth="2.5" />
        <path d={line(forecastPts)} fill="none" stroke="#c98a12" strokeWidth="2.5" strokeDasharray="6 5" />
        {actualPts.map(([cx, cy]) => (
          <circle key={`a${cx}`} cx={cx} cy={cy} r="4" fill="var(--green-700)" />
        ))}
        {data.map((d, i) =>
          d.forecast != null ? (
            <rect key={`f${d.date}`} x={x(i) - 4} y={y(d.forecast) - 4} width="8" height="8" fill="#c98a12" transform={`rotate(45 ${x(i)} ${y(d.forecast)})`} />
          ) : null,
        )}
      </svg>
      <figcaption className="sr-only">
        {data.map((d) => `${formatShortDate(d.date)}: ${d.actual ?? d.forecast} ${d.actual != null ? 'sold' : 'forecast'}`).join('; ')}
      </figcaption>
    </figure>
  );
}
