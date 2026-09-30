import { tokens, sp, alpha } from './tokens';

export interface TagProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({ label, removable = true, onRemove }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 28,
        borderRadius: tokens.radius.full,
        background: alpha(tokens.color.secondary, 0.12),
        color: tokens.color.text,
        fontSize: 13,
        paddingLeft: sp(3),
        paddingRight: removable ? sp(1) : sp(3),
        gap: sp(1),
        maxWidth: '100%',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          style={{
            width: 20,
            height: 20,
            display: 'inline-grid',
            placeItems: 'center',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: tokens.color.text,
            cursor: 'pointer',
            borderRadius: tokens.radius.full,
            flexShrink: 0,
          }}
        >
          <span aria-hidden data-icon="close" style={{ fontSize: 14, lineHeight: 1 }}>
            ×
          </span>
        </button>
      )}
    </span>
  );
}
