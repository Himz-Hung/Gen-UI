import { tokens, sp, font } from './tokens';
import { IconButton } from './IconButton';
export interface TopBarProps { title: string; showBack?: boolean; actions?: { icon: string; label: string; action: string }[]; onBack?: () => void; onActionPress?: (action: string) => void }
export function TopBar({ title, showBack = false, actions = [], onBack, onActionPress }: TopBarProps) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, height: 56, display: 'flex', alignItems: 'center', gap: sp(2), background: tokens.color.surface, borderBottom: '1px solid #E5E7EB' }}>
      {showBack && <IconButton icon="arrow-left" label="Back" onPress={onBack} />}
      <h1 style={{ flex: 1, margin: 0, fontFamily: font('heading'), fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
      {actions.map((a) => <IconButton key={a.action} icon={a.icon} label={a.label} onPress={() => onActionPress?.(a.action)} />)}
    </header>
  );
}
