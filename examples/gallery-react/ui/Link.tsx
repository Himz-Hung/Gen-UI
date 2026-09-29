import { tokens } from './tokens';
export interface LinkProps { label: string; variant?: 'inline' | 'standalone'; onPress?: () => void }
export function Link({ label, variant = 'inline', onPress }: LinkProps) {
  return <a href="#" onClick={(e) => { e.preventDefault(); onPress?.(); }} style={{ color: tokens.color.primary, textDecoration: variant === 'inline' ? 'underline' : 'none', display: variant === 'standalone' ? 'block' : 'inline' }}>{label}</a>;
}
