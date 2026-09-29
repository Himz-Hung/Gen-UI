import { useRef } from 'react';
import { tokens, sp } from './tokens';

export interface FileUploadFile { name: string; sizeLabel: string }

export interface FileUploadProps {
  label: string;
  buttonLabel: string;
  accept?: string;
  multiple?: boolean;
  files?: FileUploadFile[];
  hint?: string;
  error?: string;
  disabled?: boolean;
  onSelect?: () => void;
  onRemove?: (value: string) => void;
}

export function FileUpload({ label, buttonLabel, accept, multiple = false, files = [], hint, error, disabled = false, onSelect, onRemove }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles() {
    // The component never uploads by itself; the screen owns the file objects and the `files` list.
    onSelect?.();
    if (inputRef.current) inputRef.current.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) onSelect?.();
  }

  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{ border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, borderRadius: tokens.radius.md, padding: sp(3), display: 'grid', gap: sp(2), position: 'relative' }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          style={{ justifySelf: 'start', height: 40, padding: `0 ${sp(3)}`, borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.muted}`, background: tokens.color.surface, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {buttonLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          aria-hidden
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFiles}
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, top: 0, left: 0 }}
        />
        {files.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: sp(1) }}>
            {files.map((f) => (
              <li key={f.name} style={{ display: 'flex', alignItems: 'center', gap: sp(2) }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ color: tokens.color.muted, fontSize: 12 }}>{f.sizeLabel}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  disabled={disabled}
                  onClick={() => onRemove?.(f.name)}
                  style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', color: tokens.color.muted }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(error || hint) && <div style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
