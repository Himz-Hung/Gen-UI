import { tokens, sp } from './tokens';
export interface BadgeProps { label: string; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }
const BG = { neutral: '#E5E7EB', primary: '#FDE2DC', success: '#DCFCE7', warning: '#FEF3C7', danger: '#FEE2E2' } as const;
const FG = { neutral: tokens.color.text, primary: tokens.color.primary, success: tokens.color.success, warning: '#92400E', danger: tokens.color.danger } as const;
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: `0 ${sp(2)}`, borderRadius: tokens.radius.full, background: BG[tone], color: FG[tone], fontSize: 12, fontWeight: 500 }}>{label}</span>;
}
