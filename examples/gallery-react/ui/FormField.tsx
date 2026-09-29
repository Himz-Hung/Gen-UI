import type { ReactNode } from 'react';
import { tokens, sp } from './tokens';

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  direction?: 'vertical' | 'horizontal';
  children?: ReactNode;
}

export function FormField({ label, hint, error, required = false, direction = 'vertical', children }: FormFieldProps) {
  const msgId = `ff-${label.replace(/\W+/g, '-').toLowerCase()}-msg`;
  return (
    <fieldset aria-describedby={error || hint ? msgId : undefined} style={{ display: 'grid', gap: sp(2), border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text, padding: 0 }}>
        {label}{required && <span aria-hidden style={{ color: tokens.color.danger }}> *</span>}
      </legend>
      <div style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column', gap: sp(3), alignItems: direction === 'horizontal' ? 'flex-start' : 'stretch' }}>
        {children}
      </div>
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </fieldset>
  );
}
