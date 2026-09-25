import { tokens, sp } from './tokens';
export interface ListItemProps { title: string; subtitle?: string; trailing?: string; pressable?: boolean; onPress?: () => void }
export function ListItem({ title, subtitle, trailing, pressable = false, onPress }: ListItemProps) {
  return (
    <li role="listitem" onClick={pressable ? onPress : undefined} tabIndex={pressable ? 0 : undefined}
      style={{ minHeight: subtitle ? 56 : 48, display: 'flex', alignItems: 'center', gap: sp(3), padding: `${sp(2)} 0`, cursor: pressable ? 'pointer' : undefined }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: tokens.color.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: tokens.color.muted }}>{subtitle}</div>}
      </div>
      {trailing && <div style={{ fontWeight: 500 }}>{trailing}</div>}
    </li>
  );
}
