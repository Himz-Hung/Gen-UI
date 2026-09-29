import { tokens, font } from './tokens';
export interface HeadingProps { value: string; level?: '1' | '2' | '3' | '4'; size?: 'sm' | 'md' | 'lg' | 'xl' }
const S = { sm: 16, md: 20, lg: 26, xl: 34 } as const;
const DEFAULT = { '1': 'xl', '2': 'lg', '3': 'md', '4': 'sm' } as const;
export function Heading({ value, level = '2', size }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return <Tag style={{ margin: 0, fontFamily: font('heading'), fontWeight: 700, fontSize: S[size ?? DEFAULT[level]], color: tokens.color.text }}>{value}</Tag>;
}
