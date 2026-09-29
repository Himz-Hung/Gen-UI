import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { tokens, sp, font } from './tokens';
import { IconButton } from './IconButton';

export interface DrawerProps {
  open: boolean;
  title: string;
  side?: 'start' | 'end' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
  children?: ReactNode;
}

const EXTENT = { sm: 320, md: 400, lg: 560 } as const;

/** Marks every other direct child of <body> inert while an overlay is open; returns the restorer. */
function applyInert(exclude: HTMLElement | null) {
  const siblings = Array.from(document.body.children).filter((el) => el !== exclude) as HTMLElement[];
  const saved = siblings.map((el) => ({ el, hadInert: el.hasAttribute('inert'), ariaHidden: el.getAttribute('aria-hidden') }));
  siblings.forEach((el) => { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); });
  return () => {
    saved.forEach(({ el, hadInert, ariaHidden }) => {
      if (!hadInert) el.removeAttribute('inert');
      if (ariaHidden === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', ariaHidden);
    });
  };
}

export function Drawer({ open, title, side = 'end', size = 'md', onClose, children }: DrawerProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Same focus and inert-background rules as Modal.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const restoreInert = applyInert(portalRef.current);
    const target = panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]') ?? panelRef.current;
    target?.focus();
    return () => {
      restoreInert();
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]')).filter(
        (el) => !el.hasAttribute('disabled'),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isBottom = side === 'bottom';
  const justify = side === 'start' ? 'flex-start' : side === 'end' ? 'flex-end' : 'center';

  return createPortal(
    <div ref={portalRef} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: isBottom ? 'flex-end' : 'stretch', justifyContent: justify }}>
      <div data-ui-backdrop onClick={onClose} style={{ position: 'absolute', inset: 0, background: tokens.color.text, opacity: 0.5 }} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
          background: tokens.color.surface, fontFamily: font('body'),
          width: isBottom ? '100%' : `min(${EXTENT[size]}px, 100vw)`,
          height: isBottom ? `min(${EXTENT[size]}px, 90vh)` : '100%',
          maxHeight: isBottom ? '90vh' : undefined,
          borderRadius: isBottom ? `${tokens.radius.lg}px ${tokens.radius.lg}px 0 0` : 0,
          overflow: 'hidden',
        }}
      >
        {/* Title bar with a close control; the content scrolls, the title bar does not. */}
        <div style={{ display: 'flex', alignItems: 'center', padding: `${sp(4)} ${sp(4)} ${sp(3)} ${sp(5)}`, flex: '0 0 auto' }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 18, color: tokens.color.text }}>{title}</span>
          <IconButton icon="close" label="Close" size="sm" onPress={onClose} />
        </div>
        <div style={{ flex: '1 1 auto', overflow: 'auto', padding: `0 ${sp(5)} ${sp(5)}`, boxSizing: 'border-box' }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
