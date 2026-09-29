import { tokens, sp, font } from './tokens';

export interface BottomNavProps {
  items: { value: string; label: string; icon: string; badge?: string }[];
  value: string;
  onChange?: (value: string) => void;
}

export function BottomNav({ items, value, onChange }: BottomNavProps) {
  const shown = items.slice(0, 5);
  if (shown.length === 0) return null;
  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex',
        background: tokens.color.surface, borderTop: `1px solid ${tokens.color.muted}4d`,
        paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100,
      }}
    >
      {shown.map((item) => {
        const active = item.value === value;
        const name = item.badge ? `${item.label}, ${item.badge}` : item.label;
        return (
          <button
            key={item.value}
            type="button"
            aria-label={name}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange?.(item.value)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: sp(1), height: 56, background: 'none', border: 'none', cursor: 'pointer',
              color: active ? tokens.color.primary : tokens.color.muted, fontFamily: font('body'),
            }}
          >
            <span style={{ position: 'relative' }}>
              <span aria-hidden data-icon={item.icon} data-filled={active || undefined} />
              {item.badge && (
                <span aria-hidden style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, padding: '0 4px', borderRadius: tokens.radius.full, background: tokens.color.danger, color: tokens.color.surface, fontSize: 10, lineHeight: '16px', fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
