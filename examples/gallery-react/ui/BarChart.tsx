import { tokens, sp, font } from './tokens';

export interface BarChartBar { label: string; value: number; valueLabel?: string }

export interface BarChartProps {
  summary: string;
  bars: BarChartBar[];
  orientation?: 'vertical' | 'horizontal';
  height?: number;
  showValues?: boolean;
  onBarPress?: (value: number) => void;
}

const WIDTH = 480;
const PAD = 16;

const srOnly = {
  position: 'absolute' as const, width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' as const, border: 0,
};

function truncate(label: string) {
  return label.length > 10 ? `${label.slice(0, 9)}…` : label;
}

export function BarChart({ summary, bars, orientation = 'vertical', height = 240, showValues = false, onBarPress }: BarChartProps) {
  // empty shows the summary text in place of the plot.
  if (bars.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.color.muted, fontFamily: font('body'), textAlign: 'center', padding: sp(2), boxSizing: 'border-box' }}>
        {summary}
      </div>
    );
  }

  // Bars start at 0; one color (tokens.color.primary).
  const maxValue = Math.max(0, ...bars.map((b) => b.value));
  const safeMax = maxValue <= 0 ? 1 : maxValue;

  const table = (
    <table style={srOnly}>
      <thead><tr><th>Label</th><th>Value</th></tr></thead>
      <tbody>{bars.map((b, i) => <tr key={i}><td>{b.label}</td><td>{b.valueLabel ?? b.value}</td></tr>)}</tbody>
    </table>
  );

  if (orientation === 'horizontal') {
    const rowH = height / bars.length;
    const labelW = 84;
    const barMaxW = WIDTH - labelW - PAD;
    return (
      <div style={{ fontFamily: font('body') }}>
        <div role="img" aria-label={summary}>
          <svg aria-hidden width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={{ display: 'block' }}>
            {bars.map((b, i) => {
              const w = Math.max(2, (b.value / safeMax) * barMaxW);
              const barH = rowH * 0.5;
              const y = i * rowH + rowH * 0.25;
              return (
                <g key={i}>
                  <title>{b.label}</title>
                  <text x={0} y={i * rowH + rowH / 2 + 4} fontSize={11} fill={tokens.color.muted}>{truncate(b.label)}</text>
                  <rect
                    data-ui-bar={i}
                    x={labelW}
                    y={y}
                    width={w}
                    height={barH}
                    rx={tokens.radius.sm}
                    fill={tokens.color.primary}
                    style={{ cursor: onBarPress ? 'pointer' : undefined }}
                    onClick={() => onBarPress?.(i)}
                  />
                  {showValues && b.valueLabel && (
                    <text x={labelW + w + 4} y={i * rowH + rowH / 2 + 4} fontSize={11} fill={tokens.color.text}>{b.valueLabel}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {table}
      </div>
    );
  }

  // vertical
  const plotH = height - PAD * 2 - 18;
  const bw = (WIDTH - PAD * 2) / bars.length;
  return (
    <div style={{ fontFamily: font('body') }}>
      <div role="img" aria-label={summary}>
        <svg aria-hidden width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={{ display: 'block' }}>
          {bars.map((b, i) => {
            const h = Math.max(2, (b.value / safeMax) * plotH);
            const x = PAD + i * bw + bw * 0.15;
            const barW = bw * 0.7;
            const y = PAD + (plotH - h);
            return (
              <g key={i}>
                <title>{b.label}</title>
                {showValues && b.valueLabel && (
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={11} fill={tokens.color.text}>{b.valueLabel}</text>
                )}
                <rect
                  data-ui-bar={i}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={tokens.radius.sm}
                  fill={tokens.color.primary}
                  style={{ cursor: onBarPress ? 'pointer' : undefined }}
                  onClick={() => onBarPress?.(i)}
                />
                <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize={11} fill={tokens.color.muted}>{truncate(b.label)}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {table}
    </div>
  );
}
