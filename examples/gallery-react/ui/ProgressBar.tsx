import { tokens, sp, font } from './tokens';

export interface ProgressBarProps {
  label: string;
  value?: number;
  valueLabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

const TONE_COLOR = {
  primary: tokens.color.primary,
  success: tokens.color.success,
  warning: tokens.color.warning,
  danger: tokens.color.danger,
} as const;

export function ProgressBar({ label, value, valueLabel, tone = 'primary', showLabel = true }: ProgressBarProps) {
  const clamped = value === undefined ? undefined : Math.min(100, Math.max(0, value));
  const text = valueLabel ?? (clamped === undefined ? undefined : `${Math.round(clamped)}%`);
  const color = TONE_COLOR[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped === undefined ? undefined : Math.round(clamped)}
      style={{ display: 'flex', flexDirection: 'column', fontFamily: font('body') }}
    >
      {showLabel && (
        <div style={{ display: 'flex', marginBottom: sp(2) }}>
          <span style={{ flex: 1, color: tokens.color.text, fontWeight: 600 }}>{label}</span>
          {text !== undefined && <span style={{ color: tokens.color.muted }}>{text}</span>}
        </div>
      )}
      <div aria-hidden style={{ height: 8, borderRadius: tokens.radius.full, background: `${color}26`, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: tokens.radius.full, background: color,
            width: clamped === undefined ? '40%' : `${clamped}%`,
            animation: clamped === undefined ? 'ui-progress-indeterminate 1.2s ease-in-out infinite' : undefined,
          }}
        />
      </div>
      <style>{`@keyframes ui-progress-indeterminate { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }`}</style>
    </div>
  );
}
