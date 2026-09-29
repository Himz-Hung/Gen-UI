import type { ReactNode } from 'react';
import { tokens, sp, font } from './tokens';

export interface RichTextProps {
  markdown: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'muted';
  onLink?: (value: string) => void;
}

const FONT_SIZE = { sm: 13, md: 15, lg: 17 } as const;
// **bold** | *italic* | [label](url)
const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function parseInline(text: string, onLink?: (value: string) => void): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  let key = 0;
  const re = new RegExp(INLINE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > at) out.push(text.slice(at, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={key++}>{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(<em key={key++}>{m[2]}</em>);
    } else {
      const linkLabel = m[3]!;
      const url = m[4]!;
      out.push(
        // Links use tokens.color.primary and an underline, are real links, and emit `link` instead of navigating.
        <a
          key={key++}
          href={url}
          style={{ color: tokens.color.primary, textDecoration: 'underline' }}
          onClick={(e) => {
            e.preventDefault();
            onLink?.(url);
          }}
        >
          {linkLabel}
        </a>,
      );
    }
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

export function RichText({ markdown, size = 'md', color = 'default', onLink }: RichTextProps) {
  const fontSize = FONT_SIZE[size];
  const textColor = color === 'muted' ? tokens.color.muted : tokens.color.text;
  const paraStyle = { margin: 0, fontSize, color: textColor, lineHeight: 1.5, fontFamily: font('body') };

  // Blank lines separate paragraphs; anything outside the subset (HTML, images, tables, code)
  // is left as plain text, never executed or embedded.
  const blocks = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  const rendered = blocks.flatMap((block, bi): ReactNode[] => {
    const lines = block.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const first = lines[0].trimStart();

    if (first.startsWith('### ') || first.startsWith('## ')) {
      const isSub = first.startsWith('### ');
      const Tag = (isSub ? 'h3' : 'h2') as 'h2' | 'h3';
      const headingText = first.slice(isSub ? 4 : 3);
      const nodes: ReactNode[] = [
        <Tag key={`${bi}-h`} style={{ margin: 0, fontSize: isSub ? 18 : 22, fontWeight: 700, color: tokens.color.text, fontFamily: font('heading') }}>
          {parseInline(headingText, onLink)}
        </Tag>,
      ];
      if (lines.length > 1) {
        nodes.push(
          <p key={`${bi}-r`} style={paraStyle}>
            {parseInline(lines.slice(1).join(' '), onLink)}
          </p>,
        );
      }
      return nodes;
    }

    if (lines.every((l) => /^\s*(-|\d+\.)\s+/.test(l))) {
      const ordered = /^\s*\d+\./.test(first);
      const ListTag = (ordered ? 'ol' : 'ul') as 'ol' | 'ul';
      return [
        <ListTag key={bi} style={{ paddingLeft: 20, ...paraStyle }}>
          {lines.map((l, li) => (
            <li key={li} style={paraStyle}>
              {parseInline(l.replace(/^\s*(-|\d+\.)\s+/, ''), onLink)}
            </li>
          ))}
        </ListTag>,
      ];
    }

    return [
      <p key={bi} style={paraStyle}>
        {parseInline(lines.join(' '), onLink)}
      </p>,
    ];
  });

  return <div style={{ display: 'flex', flexDirection: 'column', gap: sp(3) }}>{rendered}</div>;
}
