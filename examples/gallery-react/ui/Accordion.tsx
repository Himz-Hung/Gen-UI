import { Children, type ReactNode } from 'react';
import { tokens, sp } from './tokens';
import { Icon } from './Icon';

export interface AccordionProps {
  items: { value: string; title: string }[];
  open: string[];
  multiple?: boolean;
  onChange?: (value: string[]) => void;
  children?: ReactNode;
}

export function Accordion({ items, open, multiple = false, onChange, children }: AccordionProps) {
  const kids = Children.toArray(children);

  const toggle = (value: string) => {
    const isOpen = open.includes(value);
    const next = multiple
      ? (isOpen ? open.filter((v) => v !== value) : [...open, value])
      : (isOpen ? [] : [value]);
    onChange?.(next);
  };

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open.includes(item.value);
        const regionId = `accordion-${item.value}`;
        return (
          <div key={item.value} style={{ borderBottom: i < items.length - 1 ? '1px solid #E5E7EB' : undefined }}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={regionId}
              onClick={() => toggle(item.value)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: sp(3), background: 'none', border: 0, textAlign: 'left', font: 'inherit',
                fontWeight: 600, color: tokens.color.text, cursor: 'pointer', padding: `${sp(3)} ${sp(4)}`,
              }}
            >
              <span>{item.title}</span>
              <span aria-hidden style={{ display: 'inline-flex', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                <Icon name="chevron-down" size="sm" color="muted" />
              </span>
            </button>
            {/* children[i] is the content of items[i]; a closed section keeps its content out of the layout entirely. */}
            {isOpen && (
              <div id={regionId} role="region" style={{ padding: `0 ${sp(4)} ${sp(3)}` }}>
                {kids[i]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
