import type { CSSProperties } from 'react';
import { tokens, sp } from './tokens';

export interface SkeletonProps {
  shape?: 'text' | 'rect' | 'circle' | 'card';
  lines?: number;
  ratio?: '1:1' | '4:3' | '16:9' | '5:7';
}

const RATIO = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '5:7': 5 / 7 } as const;

// Subtle pulse; a reduced-motion viewer sees the static midpoint instead.
const KEYFRAMES = `
@keyframes genui-skeleton-pulse { 0%, 100% { opacity: 0.16; } 50% { opacity: 0.3; } }
@media (prefers-reduced-motion: reduce) {
  .genui-skeleton-pulse { animation: none !important; opacity: 0.22 !important; }
}
`;

function Block({ style }: { style: CSSProperties }) {
  return (
    <div
      className="genui-skeleton-pulse"
      style={{ background: tokens.color.muted, animation: 'genui-skeleton-pulse 1.2s ease-in-out infinite', ...style }}
    />
  );
}

export function Skeleton({ shape = 'rect', lines = 1, ratio }: SkeletonProps) {
  const body = (() => {
    if (shape === 'text') {
      const n = Math.max(1, Math.min(100, Math.trunc(lines)));
      return (
        <div style={{ display: 'grid', gap: sp(2) }}>
          {Array.from({ length: n }, (_, i) => (
            // Last line of a paragraph is shorter, like real text.
            <Block key={i} style={{ width: i === n - 1 && n > 1 ? 160 : '100%', height: 12, borderRadius: tokens.radius.sm }} />
          ))}
        </div>
      );
    }
    if (shape === 'circle') {
      return <Block style={{ width: 40, height: 40, borderRadius: tokens.radius.full }} />;
    }
    const radius = shape === 'card' ? tokens.radius.lg : tokens.radius.md;
    const r = ratio ? RATIO[ratio] : undefined;
    if (r) {
      // Takes the same space as the real content so nothing shifts on load.
      return (
        <div style={{ aspectRatio: `${r}`, position: 'relative' }}>
          <Block style={{ position: 'absolute', inset: 0, borderRadius: radius }} />
        </div>
      );
    }
    return <Block style={{ width: '100%', height: 120, borderRadius: radius }} />;
  })();

  // Hidden from assistive tech; the parent announces loading.
  return (
    <div aria-hidden>
      <style>{KEYFRAMES}</style>
      {body}
    </div>
  );
}
