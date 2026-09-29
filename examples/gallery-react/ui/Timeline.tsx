import { tokens, sp } from './tokens';

export interface TimelineProps {
  items: { title: string; time?: string; description?: string; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }[];
  order?: 'oldest-first' | 'newest-first';
}

const TONE_COLOR: Record<NonNullable<TimelineProps['items'][number]['tone']>, string> = {
  neutral: tokens.color.muted,
  primary: tokens.color.primary,
  success: tokens.color.success,
  warning: tokens.color.warning,
  danger: tokens.color.danger,
};

export function Timeline({ items, order = 'oldest-first' }: TimelineProps) {
  const ordered = order === 'newest-first' ? [...items].reverse() : items;
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {ordered.map((item, i) => {
        const color = TONE_COLOR[item.tone ?? 'neutral'];
        const isLast = i === ordered.length - 1;
        return (
          <li key={i} style={{ display: 'flex', gap: sp(3), paddingBottom: isLast ? 0 : sp(4) }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flex: '0 0 auto' }}>
              <span aria-hidden style={{ width: 10, height: 10, marginTop: 4, borderRadius: '50%', background: color, flex: '0 0 auto' }} />
              {!isLast && <span aria-hidden style={{ flex: 1, width: 1.5, marginTop: 2, background: tokens.color.muted, opacity: 0.25 }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: sp(2), flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: tokens.color.text }}>{item.title}</span>
                {item.time && <span style={{ fontSize: 12, color: tokens.color.muted }}>{item.time}</span>}
              </div>
              {item.description && <div style={{ fontSize: 13, color: tokens.color.text, marginTop: sp(1) }}>{item.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
