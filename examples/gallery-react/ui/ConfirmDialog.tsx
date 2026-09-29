import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { tokens, sp, font } from './tokens';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

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

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, tone = 'default', loading = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const messageId = useId();

  // loading keeps the dialog open and disables cancel: backdrop/Escape/cancel all route through here.
  const cancel = () => { if (!loading) onCancel?.(); };

  // Initial focus is on cancel when tone=danger, otherwise on confirm; background is inert while open.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const restoreInert = applyInert(portalRef.current);
    const selector = tone === 'danger' ? '[data-ui-role="cancel"] button' : '[data-ui-role="confirm"] button';
    const target = panelRef.current?.querySelector<HTMLElement>(selector) ?? panelRef.current;
    target?.focus();
    return () => {
      restoreInert();
      previouslyFocused.current?.focus?.();
    };
  }, [open, tone]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { cancel(); return; }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).filter((el) => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const danger = tone === 'danger';

  return createPortal(
    <div ref={portalRef} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div data-ui-backdrop onClick={cancel} style={{ position: 'absolute', inset: 0, background: tokens.color.text, opacity: 0.5 }} />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={messageId}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: 420, maxWidth: '90vw', boxSizing: 'border-box',
          background: tokens.color.surface, borderRadius: tokens.radius.lg, padding: sp(5), fontFamily: font('body'),
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: tokens.color.text }}>{title}</div>
        <div id={messageId} style={{ marginTop: sp(3), color: tokens.color.text }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: sp(3), marginTop: sp(5) }}>
          <span data-ui-role="cancel" style={{ display: 'contents' }}>
            <Button label={cancelLabel} variant="secondary" disabled={loading} onPress={cancel} />
          </span>
          <span data-ui-role="confirm" style={{ display: 'contents' }}>
            <Button label={confirmLabel} variant={danger ? 'danger' : 'primary'} loading={loading} onPress={onConfirm} />
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
