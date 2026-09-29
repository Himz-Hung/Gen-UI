import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { tokens, sp, font } from './tokens';
import { IconButton } from './IconButton';

export interface ModalProps {
  open: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
  children?: ReactNode;
}

const WIDTH = { sm: 320, md: 480, lg: 640 } as const;

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

export function Modal({ open, title, size = 'md', onClose, children }: ModalProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus moves into the dialog on open and returns to the opener on close;
  // background content is inert while open.
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

  return createPortal(
    <div ref={portalRef} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div data-ui-backdrop onClick={onClose} style={{ position: 'absolute', inset: 0, background: tokens.color.text, opacity: 0.5 }} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: WIDTH[size], maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', boxSizing: 'border-box',
          background: tokens.color.surface, borderRadius: tokens.radius.lg, padding: sp(5), fontFamily: font('body'),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 18, color: tokens.color.text }}>{title}</span>
          <span style={{ marginLeft: sp(3) }}>
            <IconButton icon="close" label="Close" size="sm" onPress={onClose} />
          </span>
        </div>
        <div style={{ marginTop: sp(4) }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
