import { tokens, font } from './tokens';
export interface TextProps { value: string; size?: 'xs' | 'sm' | 'md' | 'lg'; weight?: 'regular' | 'medium' | 'bold'; color?: 'text' | 'muted' | 'primary' | 'danger'; truncate?: boolean; align?: 'start' | 'center' | 'end' }
const S = { xs: 12, sm: 13, md: 15, lg: 18 } as const, W = { regular: 400, medium: 500, bold: 700 } as const;
export function Text({ value, size = 'md', weight = 'regular', color = 'text', truncate = false, align = 'start' }: TextProps) {
  return <p title={truncate ? value : undefined} style={{ margin: 0, fontFamily: font('body'), fontSize: S[size], fontWeight: W[weight], color: tokens.color[color], textAlign: align, ...(truncate ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}) }}>{value}</p>;
}
