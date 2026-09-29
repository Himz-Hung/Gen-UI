import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { tokens, sp } from './tokens';
import { Icon } from './Icon';

export interface ImageViewerProps {
  open: boolean;
  label: string;
  images: { src: string; alt: string }[];
  index?: number;
  onClose?: () => void;
  onChange?: (value: number) => void;
}

export function ImageViewer({ open, label, images, index = 0, onClose, onChange }: ImageViewerProps) {
  const count = images.length;
  const clamped = count === 0 ? 0 : Math.min(Math.max(index, 0), count - 1);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const go = (delta: number) => {
    const next = clamped + delta;
    if (next < 0 || next > count - 1) return;
    onChange?.(next);
  };

  // Focus moves in on open and returns to the opener on close, like Modal.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => { previouslyFocused.current?.focus?.(); };
  }, [open]);

  useEffect(() => { setZoomed(false); }, [clamped, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!open || count === 0) return null;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => { dragRef.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = null;
    if (zoomed) return;
    // Swipe down closes; swipe sideways moves between images.
    if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) { if (dy > 0) onClose?.(); return; }
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };
  const toggleZoom = () => setZoomed((z) => !z);

  const image = images[clamped];
  const position = `${clamped + 1} of ${count}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${tokens.color.text}F0`,
      }}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{ position: 'absolute', top: sp(3), right: sp(3), background: 'none', border: 0, color: tokens.color.surface, cursor: 'pointer' }}
      >
        <Icon name="close" color="inherit" size="lg" />
      </button>
      {count > 1 && (
        <div aria-hidden style={{ position: 'absolute', top: sp(4), left: 0, right: 0, textAlign: 'center', color: tokens.color.surface, fontWeight: 600 }}>
          {clamped + 1} / {count}
        </div>
      )}
      <img
        src={image.src}
        alt={`${image.alt}, ${position}`}
        onDoubleClick={toggleZoom}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: zoomed ? 'scale(2)' : 'none', transition: 'transform 200ms', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
      />
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            disabled={clamped === 0}
            onClick={() => go(-1)}
            style={{ position: 'absolute', left: sp(2), top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: tokens.color.surface, cursor: 'pointer' }}
          >
            <Icon name="chevron-left" color="inherit" size="lg" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            disabled={clamped === count - 1}
            onClick={() => go(1)}
            style={{ position: 'absolute', right: sp(2), top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: tokens.color.surface, cursor: 'pointer' }}
          >
            <Icon name="chevron-right" color="inherit" size="lg" />
          </button>
        </>
      )}
    </div>
  );
}
