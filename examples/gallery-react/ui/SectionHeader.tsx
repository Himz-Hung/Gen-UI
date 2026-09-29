import type { CSSProperties } from 'react';
import { tokens, sp, font } from './tokens';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  level?: '2' | '3';
  onAction?: () => void;
}

export function SectionHeader({ title, description, actionLabel, level = '2', onAction }: SectionHeaderProps) {
  const Tag = (level === '3' ? 'h3' : 'h2') as 'h2' | 'h3';
  const titleStyle: CSSProperties = {
    margin: 0,
    fontFamily: font('heading'),
    fontWeight: 700,
    fontSize: level === '3' ? 17 : 20,
    color: tokens.color.text,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: sp(3), paddingTop: sp(5), paddingBottom: sp(3) }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tag style={titleStyle}>{title}</Tag>
        {description && (
          <p style={{ margin: 0, marginTop: sp(1), color: tokens.color.muted, fontFamily: font('body'), fontSize: 14 }}>{description}</p>
        )}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          aria-label={`${actionLabel} ${title}`}
          style={{
            minHeight: 44,
            padding: `0 ${sp(1)}`,
            background: 'none',
            border: 'none',
            color: tokens.color.primary,
            textDecoration: 'underline',
            fontFamily: font('body'),
            fontSize: 14,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
