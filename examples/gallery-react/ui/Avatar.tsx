import { useState } from 'react';
import { tokens } from './tokens';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'none' | 'online' | 'away' | 'offline';
}

const DIM = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 } as const;
const STATUS_COLOR: Record<NonNullable<AvatarProps['status']>, string | undefined> = {
  none: undefined,
  online: tokens.color.success,
  away: tokens.color.warning,
  offline: tokens.color.muted,
};

// Mirrors the Flutter initials rule: one word -> its first two letters; two+ words -> the
// first letter of the first two words.
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', shape = 'circle', status = 'none' }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const dim = DIM[size];
  const radius = shape === 'circle' ? dim / 2 : tokens.radius.md;
  const showImage = !!src && !errored;
  return (
    <span role="img" aria-label={name} style={{ position: 'relative', display: 'inline-block', width: dim, height: dim, flex: '0 0 auto' }}>
      <span
        aria-hidden
        style={{
          position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden',
          background: tokens.color.secondary, display: 'grid', placeItems: 'center',
          color: tokens.color.surface, fontWeight: 600, fontSize: dim * 0.36,
        }}
      >
        {initialsOf(name)}
      </span>
      {showImage && (
        <img
          src={src}
          alt=""
          aria-hidden
          onError={() => setErrored(true)}
          style={{ position: 'absolute', inset: 0, width: dim, height: dim, borderRadius: radius, objectFit: 'cover' }}
        />
      )}
      {status !== 'none' && (
        <span
          aria-hidden
          style={{
            position: 'absolute', right: -1, bottom: -1, width: dim * 0.28, height: dim * 0.28,
            borderRadius: '50%', background: STATUS_COLOR[status], border: `2px solid ${tokens.color.surface}`,
          }}
        />
      )}
    </span>
  );
}
