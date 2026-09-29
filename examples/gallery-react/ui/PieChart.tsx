import { tokens, sp, font } from './tokens';

export interface PieChartSlice { label: string; value: number }

export interface PieChartProps {
  summary: string;
  slices: PieChartSlice[];
  donut?: boolean;
  centerLabel?: string;
  height?: number;
  onSlicePress?: (value: number) => void;
}

// Slices colored from the tokens in a fixed order.
const PALETTE = [tokens.color.primary, tokens.color.secondary, tokens.color.success, tokens.color.warning, tokens.color.danger];
const FULL_TURN = Math.PI * 2;

const srOnly = {
  position: 'absolute' as const, width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' as const, border: 0,
};

function pct(value: number, total: number) {
  return total <= 0 ? 0 : Math.round((value / total) * 100);
}

export function PieChart({ summary, slices, donut = true, centerLabel, height = 200, onSlicePress }: PieChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  // empty (all values 0) shows the summary text.
  const isEmpty = slices.length === 0 || total <= 0;
  if (isEmpty) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.color.muted, fontFamily: font('body'), textAlign: 'center', padding: sp(2), boxSizing: 'border-box' }}>
        {summary}
      </div>
    );
  }

  const size = height;
  const r = size / 2;
  const cx = r;
  const cy = r;
  // Slices in the given order, clockwise from the top.
  let angle = -Math.PI / 2;
  const arcs = slices.map((s, index) => {
    const sweep = (s.value / total) * FULL_TURN;
    const start = angle;
    angle += sweep;
    return { ...s, start, sweep, index };
  });
  const pointAt = (a: number, radius: number) => ({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });

  return (
    <div style={{ fontFamily: font('body') }}>
      <div role="img" aria-label={summary} style={{ display: 'flex', justifyContent: 'center' }}>
        <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((a) => {
            const color = PALETTE[a.index % PALETTE.length];
            // A full-turn slice (the only nonzero one) degenerates to a point as an SVG arc; draw a circle instead.
            if (a.sweep >= FULL_TURN - 1e-6) {
              return (
                <circle key={a.index} data-ui-slice={a.index} cx={cx} cy={cy} r={r} fill={color}
                  style={{ cursor: onSlicePress ? 'pointer' : undefined }} onClick={() => onSlicePress?.(a.index)} />
              );
            }
            const end = a.start + a.sweep;
            const large = a.sweep > Math.PI ? 1 : 0;
            const p1 = pointAt(a.start, r);
            const p2 = pointAt(end, r);
            const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
            return (
              <path key={a.index} data-ui-slice={a.index} d={d} fill={color}
                style={{ cursor: onSlicePress ? 'pointer' : undefined }} onClick={() => onSlicePress?.(a.index)} />
            );
          })}
          {donut && <circle cx={cx} cy={cy} r={r * 0.55} fill={tokens.color.surface} />}
          {donut && centerLabel && (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill={tokens.color.text}>{centerLabel}</text>
          )}
        </svg>
      </div>
      {/* A legend lists every slice with its label and percentage; the chart never relies on color alone. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(3), justifyContent: 'center', marginTop: sp(3) }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: sp(1) }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: tokens.radius.full, background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: tokens.color.text }}>{s.label} ({pct(s.value, total)}%)</span>
          </div>
        ))}
      </div>
      <table style={srOnly}>
        <thead><tr><th>Label</th><th>Value</th><th>Percent</th></tr></thead>
        <tbody>{slices.map((s, i) => <tr key={i}><td>{s.label}</td><td>{s.value}</td><td>{pct(s.value, total)}%</td></tr>)}</tbody>
      </table>
    </div>
  );
}
