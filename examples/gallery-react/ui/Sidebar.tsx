import { tokens, sp, font, alpha } from './tokens';
import { Tooltip } from './Tooltip';

export interface SidebarProps {
  items: { value: string; label: string; icon?: string; badge?: string; section?: string }[];
  value: string;
  title?: string;
  collapsed?: boolean;
  onChange?: (value: string) => void;
  onToggle?: () => void;
}

function groupBySection(items: SidebarProps['items']) {
  const order: (string | undefined)[] = [];
  const byKey = new Map<string | undefined, SidebarProps['items']>();
  for (const item of items) {
    const key = item.section;
    if (!byKey.has(key)) { order.push(key); byKey.set(key, []); }
    byKey.get(key)!.push(item);
  }
  return order.map((k) => [k, byKey.get(k)!] as const);
}

export function Sidebar({ items, value, title, collapsed = false, onChange, onToggle }: SidebarProps) {
  const groups = groupBySection(items);
  return (
    <nav
      aria-label={title}
      style={{
        width: collapsed ? 64 : 240, height: '100%', display: 'flex', flexDirection: 'column',
        background: tokens.color.surface, fontFamily: font('body'),
      }}
    >
      {title && !collapsed && (
        <div style={{ padding: `${sp(4)} ${sp(4)} ${sp(2)}`, fontWeight: 700, fontSize: 16, color: tokens.color.text }}>{title}</div>
      )}
      {onToggle && (
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', padding: `0 ${sp(2)}` }}>
          <button
            type="button"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!collapsed}
            onClick={onToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.color.muted, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span aria-hidden data-icon={collapsed ? 'chevron-right' : 'chevron-left'} />
          </button>
        </div>
      )}
      {groups.map(([section, groupItems]) => (
        <div key={section ?? '__default'}>
          {section && !collapsed && (
            <div style={{ padding: `${sp(4)} ${sp(4)} ${sp(1)}`, fontSize: 12, fontWeight: 600, color: tokens.color.muted }}>{section}</div>
          )}
          {groupItems.map((item) => {
            const selected = item.value === value;
            const row = (
              <button
                key={item.value}
                type="button"
                aria-label={item.label}
                aria-current={selected ? 'page' : undefined}
                onClick={() => onChange?.(item.value)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: sp(3),
                  height: 40, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
                  padding: `0 ${collapsed ? sp(3) : sp(4)}`, background: selected ? alpha(tokens.color.primary, 0.08) : 'transparent',
                  color: selected ? tokens.color.primary : tokens.color.text, fontWeight: selected ? 700 : 400,
                }}
              >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {item.icon && <span aria-hidden data-icon={item.icon} style={{ color: selected ? tokens.color.primary : tokens.color.muted }} />}
                  {item.badge && collapsed && (
                    <span aria-hidden style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: tokens.radius.full, background: tokens.color.danger }} />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ padding: `0 ${sp(2)}`, borderRadius: tokens.radius.full, background: alpha(tokens.color.muted, 0.15), color: tokens.color.muted, fontSize: 12 }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
            return collapsed ? <Tooltip key={item.value} text={item.label}>{row}</Tooltip> : row;
          })}
        </div>
      ))}
    </nav>
  );
}
