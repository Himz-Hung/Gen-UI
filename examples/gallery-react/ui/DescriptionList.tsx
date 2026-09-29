import { tokens, sp } from './tokens';

export interface DescriptionListProps {
  items: { label: string; value: string }[];
  layout?: 'inline' | 'stacked';
  columns?: '1' | '2';
}

function Row({ label, value, layout }: { label: string; value: string; layout: 'inline' | 'stacked' }) {
  return layout === 'inline' ? (
    <div style={{ display: 'contents' }}>
      <dt style={{ margin: 0, color: tokens.color.muted, fontSize: 13, paddingRight: sp(3), paddingBottom: sp(1) }}>{label}</dt>
      <dd style={{ margin: 0, color: tokens.color.text, paddingBottom: sp(1) }}>{value}</dd>
    </div>
  ) : (
    <div style={{ marginBottom: sp(2) }}>
      <dt style={{ margin: 0, color: tokens.color.muted, fontSize: 13 }}>{label}</dt>
      <dd style={{ margin: 0, color: tokens.color.text }}>{value}</dd>
    </div>
  );
}

function Group({ items, layout }: { items: { label: string; value: string }[]; layout: 'inline' | 'stacked' }) {
  return (
    <dl style={{ margin: 0, display: layout === 'inline' ? 'grid' : 'block', gridTemplateColumns: layout === 'inline' ? 'auto 1fr' : undefined }}>
      {items.map((item, i) => <Row key={i} label={item.label} value={item.value} layout={layout} />)}
    </dl>
  );
}

export function DescriptionList({ items, layout = 'inline', columns = '1' }: DescriptionListProps) {
  // On narrow screens columns=2 falls back to 1 and inline may fall back to stacked; both
  // handled with pure CSS (no measurement) so it also degrades sensibly without JS layout.
  if (columns === '2') {
    const mid = Math.ceil(items.length / 2);
    const left = items.slice(0, mid);
    const right = items.slice(mid);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: sp(5) }}>
        <Group items={left} layout={layout} />
        <Group items={right} layout={layout} />
      </div>
    );
  }
  return <Group items={items} layout={layout} />;
}
