import { tokens, sp, font } from './tokens';

export interface LineChartPoint { x: string; y: number }
export interface LineChartSeries { name: string; points: LineChartPoint[] }
export interface LineChartPointPress { series: number; index: number }

export interface LineChartProps {
  summary: string;
  series: LineChartSeries[];
  yLabel?: string;
  xLabel?: string;
  height?: number;
  showLegend?: boolean;
  onPointPress?: (value: LineChartPointPress) => void;
}

// Series colors come from the project tokens in a fixed order.
const PALETTE = [tokens.color.primary, tokens.color.secondary, tokens.color.success, tokens.color.warning, tokens.color.danger];
const WIDTH = 480;
const PAD = 16;

const srOnly = {
  position: 'absolute' as const, width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' as const, border: 0,
};

export function LineChart({ summary, series, yLabel, xLabel, height = 240, showLegend = true, onPointPress }: LineChartProps) {
  // empty (no points) shows the summary text in place of the plot.
  const isEmpty = series.length === 0 || series.every((s) => s.points.length === 0);
  if (isEmpty) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.color.muted, fontFamily: font('body'), textAlign: 'center', padding: sp(2), boxSizing: 'border-box' }}>
        {summary}
      </div>
    );
  }

  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of series) for (const p of s.points) { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
  // Y axis starts at 0 unless every value is far from it.
  const farFromZero = minY > 0 && minY > (maxY - minY) * 2;
  const lo = farFromZero ? minY : Math.min(0, minY);
  const hi = maxY === lo ? lo + 1 : maxY;
  const maxPoints = Math.max(1, ...series.map((s) => s.points.length));
  const plotW = WIDTH - PAD * 2;
  const plotH = height - PAD * 2;
  const xAt = (i: number) => PAD + (maxPoints > 1 ? i / (maxPoints - 1) : 0.5) * plotW;
  const yAt = (v: number) => PAD + (1 - Math.min(1, Math.max(0, (v - lo) / (hi - lo)))) * plotH;

  return (
    <div style={{ fontFamily: font('body') }}>
      {yLabel && <div style={{ fontSize: 12, color: tokens.color.muted, marginBottom: sp(1) }}>{yLabel}</div>}
      <div role="img" aria-label={summary}>
        <svg aria-hidden width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={{ display: 'block' }}>
          {/* gridlines are light */}
          {[0, 1, 2, 3].map((i) => {
            const y = PAD + (plotH * i) / 3;
            return <line key={i} x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} stroke={tokens.color.muted} strokeOpacity={0.15} strokeWidth={1} />;
          })}
          {series.map((s, si) => {
            const color = PALETTE[si % PALETTE.length];
            const pts = s.points.map((p, i) => ({ x: xAt(i), y: yAt(p.y) }));
            const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            return (
              <g key={s.name}>
                <path d={path} fill="none" stroke={color} strokeWidth={2} />
                {pts.map((p, i) => (
                  <circle
                    key={i}
                    data-ui-point={`${si}:${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={color}
                    style={{ cursor: onPointPress ? 'pointer' : undefined }}
                    onClick={() => onPointPress?.({ series: si, index: i })}
                  >
                    {/* Hover / press on a point shows its x, y and series name. */}
                    <title>{`${s.name}: ${s.points[i].x}, ${s.points[i].y}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {xLabel && <div style={{ fontSize: 12, color: tokens.color.muted, marginTop: sp(1) }}>{xLabel}</div>}
      {/* Legend only shown with more than one series. */}
      {showLegend && series.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(3), marginTop: sp(2) }}>
          {series.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: sp(1) }}>
              <span aria-hidden style={{ width: 10, height: 10, borderRadius: tokens.radius.full, background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: tokens.color.text }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}
      {/* Data table alternative reachable by assistive tech. */}
      <table style={srOnly}>
        <thead><tr><th>Series</th><th>{xLabel ?? 'X'}</th><th>{yLabel ?? 'Y'}</th></tr></thead>
        <tbody>
          {series.flatMap((s) => s.points.map((p, i) => (
            <tr key={`${s.name}-${i}`}><td>{s.name}</td><td>{p.x}</td><td>{p.y}</td></tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}
