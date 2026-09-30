import { useRef, useState } from 'react';
import { tokens, sp, alpha } from './tokens';
import { Icon } from './Icon';

export interface VideoProps {
  src: string;
  label: string;
  poster?: string;
  ratio?: '16:9' | '4:3' | '1:1' | '9:16';
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  onEnded?: () => void;
}

const RATIO: Record<NonNullable<VideoProps['ratio']>, number> = { '16:9': 16 / 9, '4:3': 4 / 3, '1:1': 1, '9:16': 9 / 16 };

function reducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function Video({ src, label, poster, ratio = '16:9', controls = true, autoplay = false, loop = false, onEnded }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // autoplay is only ever muted, and is skipped entirely when the platform requests reduced motion.
  const [playing, setPlaying] = useState(autoplay && !reducedMotion());
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const toggle = () => {
    const el = videoRef.current;
    if (playing) {
      el?.pause();
      setPlaying(false);
    } else {
      const p = el?.play();
      if (p && typeof p.then === 'function') p.catch(() => setError(true));
      setPlaying(true);
    }
  };
  const retry = () => { setError(false); setPlaying(false); setReloadKey((k) => k + 1); };

  return (
    <div
      role="group"
      aria-label={label}
      style={{ position: 'relative', width: '100%', aspectRatio: `${RATIO[ratio]}`, borderRadius: tokens.radius.md, overflow: 'hidden', background: tokens.color.muted }}
    >
      {error ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', gap: sp(2), justifyItems: 'center' }}>
          <Icon name="error" color="muted" size="lg" />
          <button
            type="button"
            onClick={retry}
            style={{ background: 'none', border: `1px solid ${tokens.color.muted}`, borderRadius: tokens.radius.md, padding: `${sp(1)} ${sp(3)}`, cursor: 'pointer', color: tokens.color.text }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <video
            key={reloadKey}
            ref={videoRef}
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoplay && !reducedMotion()}
            muted={autoplay}
            loop={loop}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => { setPlaying(false); onEnded?.(); }}
            onError={() => setError(true)}
          />
          {controls && (
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={toggle}
              style={{
                position: 'absolute', inset: 0, margin: 'auto', width: 48, height: 48, borderRadius: '50%',
                border: 0, background: alpha(tokens.color.scrim, 0.5), color: tokens.color.surface, cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}
            >
              <Icon name={playing ? 'pause' : 'play'} color="inherit" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
