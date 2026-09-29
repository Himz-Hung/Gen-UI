import { tokens, font } from './tokens';
export interface StatProps { label: string; value: string; trend?: 'up' | 'down' | 'flat'; hint?: string }
const ARROW = { up: '↑', down: '↓', flat: '→' } as const;
const COLOR = { up: tokens.color.success, down: tokens.color.danger, flat: tokens.color.muted } as const;
export function Stat({ label, value, trend, hint }: StatProps) {
  return (
    <div>
      <div style={{ fontSize: 13, color: tokens.color.muted }}>{label}</div>
      <div style={{ fontFamily: font('heading'), fontSize: 26, fontWeight: 700, color: tokens.color.text }}>{value}{trend && <span style={{ color: COLOR[trend], fontSize: 16, marginLeft: 6 }}>{ARROW[trend]}</span>}</div>
      {hint && <div style={{ fontSize: 12, color: tokens.color.muted }}>{hint}</div>}
    </div>
  );
}
