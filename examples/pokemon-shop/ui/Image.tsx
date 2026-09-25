import { useState } from 'react';
import { tokens } from './tokens';
export interface ImageProps { src: string; alt: string; ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '5:7'; fit?: 'cover' | 'contain'; radius?: 'none' | 'sm' | 'md' | 'lg' }
export function Image({ src, alt, ratio = '5:7', fit = 'contain', radius = 'md' }: ImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [w, h] = ratio.split(':').map(Number);
  return (
    <div style={{ aspectRatio: `${w} / ${h}`, background: '#F3F4F6', borderRadius: radius === 'none' ? 0 : tokens.radius[radius], overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      {state !== 'error' && <img src={src} alt={alt} loading="lazy" onLoad={() => setState('loaded')} onError={() => setState('error')} style={{ width: '100%', height: '100%', objectFit: fit, display: state === 'loaded' ? 'block' : 'none' }} />}
      {state === 'error' && <span aria-hidden data-icon="image-off" />}
    </div>
  );
}
