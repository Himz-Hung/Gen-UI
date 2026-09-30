import { useEffect, useState } from 'react';
import { getMode, onModeChange, setMode, tokens, sp } from '../ui/tokens';

type Scheme = 'light' | 'dark' | 'system';
const OPTIONS: Scheme[] = ['light', 'dark', 'system'];

/** Shell-only light / dark / system switch (hand-written, not part of the contract). */
export function ModeSwitch() {
  const [scheme, setScheme] = useState<Scheme>(() => getMode().colorScheme);
  useEffect(() => onModeChange((m) => setScheme(m.colorScheme)), []);
  return (
    <div role="group" aria-label="Color scheme" style={{ position: 'fixed', right: sp(3), bottom: sp(3), zIndex: 2000, display: 'flex', gap: 2, padding: 2, borderRadius: tokens.radius.full, background: tokens.color.surface, border: `1px solid ${tokens.color.border}` }}>
      {OPTIONS.map((o) => (
        <button key={o} type="button" aria-pressed={scheme === o} onClick={() => setMode({ colorScheme: o })}
          style={{ border: 0, cursor: 'pointer', padding: `${sp(1)} ${sp(2)}`, borderRadius: tokens.radius.full, background: scheme === o ? tokens.color.primary : 'transparent', color: scheme === o ? tokens.color.onPrimary : tokens.color.text }}>
          {o}
        </button>
      ))}
    </div>
  );
}
