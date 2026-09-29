import { useEffect, useState } from 'react';
import { tokens, sp, font } from './tokens';

export interface StepperProps {
  steps: { label: string; description?: string }[];
  current: number;
  orientation?: 'horizontal' | 'vertical';
  allowBack?: boolean;
  onPress?: (value: number) => void;
}

function useMediaQuery(query: string, defaultValue = true) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return defaultValue;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
    else if (typeof mql.addListener === 'function') mql.addListener(onChange);
    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      else if (typeof mql.removeListener === 'function') mql.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

function Marker({ index, currentIndex, label, pressable, onPress }: { index: number; currentIndex: number; label: string; pressable: boolean; onPress?: (i: number) => void }) {
  const completed = index < currentIndex;
  const isCurrent = index === currentIndex;
  const color = completed || isCurrent ? tokens.color.primary : `${tokens.color.muted}66`;
  const name = completed ? `${label}, completed` : isCurrent ? `${label}, current step` : label;
  const content = (
    <span
      aria-hidden
      style={{
        width: 28, height: 28, borderRadius: tokens.radius.full, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${color}`, background: isCurrent ? tokens.color.primary : 'transparent',
        color: isCurrent ? tokens.color.surface : tokens.color.muted, fontWeight: 600, fontSize: 12, flexShrink: 0,
      }}
    >
      {completed ? '✓' : index + 1}
    </span>
  );
  return pressable ? (
    <button type="button" aria-label={name} onClick={() => onPress?.(index)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
      {content}
    </button>
  ) : (
    <span aria-label={name} role="img" style={{ display: 'inline-flex' }}>{content}</span>
  );
}

export function Stepper({ steps, current, orientation = 'horizontal', allowBack = true, onPress }: StepperProps) {
  const currentIndex = steps.length === 0 ? 0 : Math.min(Math.max(current, 0), steps.length - 1);
  const compact = !useMediaQuery('(min-width: 480px)');

  if (orientation === 'vertical') {
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, fontFamily: font('body') }}>
        {steps.map((step, i) => {
          const completed = i < currentIndex;
          const isCurrent = i === currentIndex;
          const pressable = completed && allowBack;
          return (
            <li key={i} aria-current={isCurrent ? 'step' : undefined} style={{ display: 'flex', gap: sp(3) }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Marker index={i} currentIndex={currentIndex} label={step.label} pressable={pressable} onPress={onPress} />
                {i < steps.length - 1 && <div aria-hidden style={{ width: 2, height: 24, background: completed ? tokens.color.primary : `${tokens.color.muted}4d` }} />}
              </div>
              <div style={{ paddingBottom: sp(4) }}>
                <div style={{ color: isCurrent ? tokens.color.primary : tokens.color.text, fontWeight: isCurrent ? 700 : 400 }}>{step.label}</div>
                {step.description && <div style={{ color: tokens.color.muted, fontSize: 12 }}>{step.description}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  if (compact) {
    const step = steps[currentIndex];
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: `${sp(2)} 0`, fontFamily: font('body') }}>
        <li aria-current="step">
          <div style={{ color: tokens.color.muted, fontSize: 12 }}>Step {currentIndex + 1} of {steps.length}</div>
          <div style={{ color: tokens.color.primary, fontWeight: 700 }}>{step?.label}</div>
        </li>
      </ol>
    );
  }

  return (
    <ol style={{ display: 'flex', alignItems: 'flex-start', listStyle: 'none', margin: 0, padding: 0, fontFamily: font('body') }}>
      {steps.map((step, i) => {
        const completed = i < currentIndex;
        const isCurrent = i === currentIndex;
        const pressable = completed && allowBack;
        return (
          <li key={i} aria-current={isCurrent ? 'step' : undefined} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 96 }}>
              <Marker index={i} currentIndex={currentIndex} label={step.label} pressable={pressable} onPress={onPress} />
              <span style={{
                marginTop: sp(1), textAlign: 'center', color: isCurrent ? tokens.color.primary : tokens.color.text,
                fontWeight: isCurrent ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 96,
              }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div aria-hidden style={{ flex: 1, height: 2, marginTop: 13, background: i < currentIndex ? tokens.color.primary : `${tokens.color.muted}4d` }} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
