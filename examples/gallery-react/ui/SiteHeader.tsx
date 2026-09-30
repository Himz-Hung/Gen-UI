import { useEffect, useState } from 'react';
import { tokens, sp, font, alpha } from './tokens';
import { Button } from './Button';

export interface SiteHeaderProps {
  brand: string;
  logo?: string;
  links?: { value: string; label: string; active?: boolean }[];
  actions?: { value: string; label: string; icon?: string; variant?: 'primary' | 'secondary' | 'ghost' }[];
  menuLabel: string;
  sticky?: boolean;
  onBrandPress?: () => void;
  onNavigate?: (value: string) => void;
  onAction?: (value: string) => void;
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

export function SiteHeader({ brand, logo, links = [], actions = [], menuLabel, sticky = true, onBrandPress, onNavigate, onAction }: SiteHeaderProps) {
  const wide = useWide();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header
      style={{
        position: sticky ? 'sticky' : 'static', top: 0, zIndex: 50, height: wide ? 64 : 56, display: 'flex',
        alignItems: 'center', padding: `0 ${sp(4)}`, background: tokens.color.surface, borderBottom: `1px solid ${alpha(tokens.color.muted, 0.25)}`,
        fontFamily: font('body'),
      }}
    >
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onBrandPress?.(); }}
        aria-label={brand}
        style={{ display: 'inline-flex', alignItems: 'center', gap: sp(2), textDecoration: 'none' }}
      >
        {logo && <img src={logo} alt="" height={28} />}
        <span style={{ fontWeight: 800, fontSize: 18, color: tokens.color.text }}>{brand}</span>
      </a>

      {wide ? (
        <>
          <nav aria-label="Primary" style={{ display: 'flex', marginLeft: sp(5) }}>
            {links.map((l) => (
              <button
                key={l.value}
                type="button"
                aria-current={l.active ? 'page' : undefined}
                onClick={() => onNavigate?.(l.value)}
                style={{
                  height: 64, padding: `0 ${sp(3)}`, background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `3px solid ${l.active ? tokens.color.primary : 'transparent'}`,
                  color: tokens.color.text, fontWeight: l.active ? 700 : 500,
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: sp(2) }}>
            {actions.map((a) => (
              <Button key={a.value} label={a.label} icon={a.icon} variant={a.variant ?? 'ghost'} size="sm" onPress={() => onAction?.(a.value)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            aria-label={menuLabel}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span aria-hidden data-icon="menu" />
          </button>
        </>
      )}

      {!wide && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div
            onClick={close}
            style={{ position: 'absolute', inset: 0, background: alpha(tokens.color.scrim, 0.5) }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={brand}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(320px, 100%)',
              background: tokens.color.surface, display: 'flex', flexDirection: 'column',
              boxShadow: `-4px 0 12px ${alpha(tokens.color.shadow, 0.2)}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: sp(4) }}>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 18, color: tokens.color.text }}>{brand}</span>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.color.muted }}
              >
                <span aria-hidden data-icon="close" />
              </button>
            </div>
            <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', padding: `0 ${sp(4)}` }}>
              {links.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  aria-current={l.active ? 'page' : undefined}
                  onClick={() => { close(); onNavigate?.(l.value); }}
                  style={{
                    textAlign: 'left', padding: `${sp(3)} 0`, background: 'none', border: 'none', cursor: 'pointer',
                    color: tokens.color.text, fontWeight: l.active ? 700 : 500,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </nav>
            {actions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: sp(2), padding: sp(4) }}>
                {actions.map((a) => (
                  <Button key={a.value} label={a.label} icon={a.icon} variant={a.variant ?? 'ghost'} fullWidth onPress={() => { close(); onAction?.(a.value); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
