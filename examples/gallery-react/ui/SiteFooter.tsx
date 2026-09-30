import { useEffect, useState } from 'react';
import { tokens, sp, font, alpha } from './tokens';

export interface SiteFooterProps {
  brand?: string;
  description?: string;
  columns?: { title: string; links: { value: string; label: string }[] }[];
  social?: { value: string; label: string; icon: string }[];
  legal?: string;
  onNavigate?: (value: string) => void;
}

function useWide() {
  const [wide, setWide] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = () => setWide(mql.matches);
    onChange();
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
    else if (typeof mql.addListener === 'function') mql.addListener(onChange);
    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      else if (typeof mql.removeListener === 'function') mql.removeListener(onChange);
    };
  }, []);
  return wide;
}

function CollapsedColumn({ col, linkRow }: { col: { title: string; links: { value: string; label: string }[] }; linkRow: (l: { value: string; label: string }) => JSX.Element }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 700, color: tokens.color.text, padding: `${sp(2)} 0`, textAlign: 'left',
        }}
      >
        <span style={{ flex: 1 }}>{col.title}</span>
        <span aria-hidden data-icon={open ? 'chevron-up' : 'chevron-down'} />
      </button>
      {open && (
        <nav aria-label={col.title} style={{ display: 'flex', flexDirection: 'column' }}>
          {col.links.map(linkRow)}
        </nav>
      )}
    </div>
  );
}

export function SiteFooter({ brand, description, columns = [], social = [], legal, onNavigate }: SiteFooterProps) {
  const wide = useWide();
  const hasBrand = Boolean(brand || description);
  const collapse = !wide && columns.length > 2;

  const linkRow = (l: { value: string; label: string }) => (
    <a
      key={l.value}
      href="#"
      onClick={(e) => { e.preventDefault(); onNavigate?.(l.value); }}
      style={{ display: 'flex', alignItems: 'center', minHeight: 44, color: tokens.color.text, textDecoration: 'none' }}
    >
      {l.label}
    </a>
  );

  const columnBlock = (col: { title: string; links: { value: string; label: string }[] }) => (
    <nav aria-label={col.title} key={col.title} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontWeight: 700, color: tokens.color.text, marginBottom: sp(1) }}>{col.title}</div>
      {col.links.map(linkRow)}
    </nav>
  );

  const collapsedColumn = (col: { title: string; links: { value: string; label: string }[] }) => (
    <CollapsedColumn key={col.title} col={col} linkRow={linkRow} />
  );

  const brandBlock = hasBrand ? (
    <div>
      {brand && <div style={{ fontWeight: 800, fontSize: 18, color: tokens.color.text }}>{brand}</div>}
      {description && <div style={{ marginTop: sp(2), color: tokens.color.muted }}>{description}</div>}
    </div>
  ) : null;

  const socialRow = social.length > 0 ? (
    <div style={{ display: 'flex', gap: sp(1), flexWrap: 'wrap' }}>
      {social.map((s) => (
        <button
          key={s.value}
          type="button"
          aria-label={s.label}
          onClick={() => onNavigate?.(s.value)}
          style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: tokens.color.text }}
        >
          <span aria-hidden data-icon={s.icon} />
        </button>
      ))}
    </div>
  ) : null;

  return (
    <footer style={{ background: alpha(tokens.color.muted, 0.08), padding: sp(wide ? 6 : 4), fontFamily: font('body') }}>
      {wide ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: sp(4) }}>
          {brandBlock && <div style={{ flex: 2 }}>{brandBlock}</div>}
          {columns.map((col) => (
            <div key={col.title} style={{ flex: 1 }}>{columnBlock(col)}</div>
          ))}
          {socialRow}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {brandBlock && <div style={{ marginBottom: sp(4) }}>{brandBlock}</div>}
          {columns.map((col) => (
            <div key={col.title} style={{ marginBottom: collapse ? 0 : sp(4) }}>
              {collapse ? collapsedColumn(col) : columnBlock(col)}
            </div>
          ))}
          {socialRow}
        </div>
      )}
      {legal && (
        <>
          <hr aria-hidden style={{ margin: `${sp(5)} 0 ${sp(2)}`, border: 'none', borderTop: `1px solid ${alpha(tokens.color.muted, 0.25)}` }} />
          <div style={{ color: tokens.color.muted, fontSize: 12 }}>{legal}</div>
        </>
      )}
    </footer>
  );
}
