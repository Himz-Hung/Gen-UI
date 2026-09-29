import { tokens, sp, font } from './tokens';

export interface SpinnerProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const DIAMETER = { sm: 16, md: 24, lg: 40 } as const;

export function Spinner({ label, size = 'md', showLabel = false }: SpinnerProps) {
  const diameter = DIAMETER[size];
  const stroke = diameter <= 16 ? 2 : 3;
  const indicator = (
    <svg
      width={diameter}
      height={diameter}
      viewBox="0 0 24 24"
      className="ui-spinner-anim"
      style={{ animation: 'ui-spinner-spin 0.8s linear infinite' }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke={tokens.color.primary} strokeOpacity={0.25} strokeWidth={stroke} />
      <circle cx="12" cy="12" r="10" fill="none" stroke={tokens.color.primary} strokeWidth={stroke} strokeDasharray="16 47" strokeLinecap="round" />
    </svg>
  );
  return (
    <span role="status" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: sp(3) }}>
      <style>{`@media (prefers-reduced-motion: reduce) { .ui-spinner-anim { animation-duration: 2.4s; } } @keyframes ui-spinner-spin { to { transform: rotate(360deg); } }`}</style>
      {indicator}
      {showLabel && <span style={{ color: tokens.color.text, fontFamily: font('body') }}>{label}</span>}
    </span>
  );
}
