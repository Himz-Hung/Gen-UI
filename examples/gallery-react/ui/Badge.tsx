import { tokens, sp, alpha } from './tokens';
export interface BadgeProps { label: string; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }
const BG = { neutral: tokens.color.border, primary: alpha(tokens.color.primary, 0.12), success: alpha(tokens.color.success, 0.12), warning: alpha(tokens.color.warning, 0.14), danger: alpha(tokens.color.danger, 0.12) } as const;
const FG = { neutral: tokens.color.text, primary: tokens.color.primary, success: tokens.color.success, warning: tokens.color.warning, danger: tokens.color.danger } as const;
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: `0 ${sp(2)}`, borderRadius: tokens.radius.full, background: BG[tone], color: FG[tone], fontSize: 12, fontWeight: 500 }}>{label}</span>;
}
