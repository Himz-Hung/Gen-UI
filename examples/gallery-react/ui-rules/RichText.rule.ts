import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'RichText', category: 'typography',
  purpose: 'A block of formatted text written in a small Markdown subset: product descriptions, terms, help text. For a single plain line use Text.',
  props: {
    markdown: t.text().desc('paragraphs, **bold**, *italic*, [links](url), "- " and "1. " lists, "## " / "### " headings'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
    color: t.enum(['default', 'muted']).def('default'),
  },
  events: { link: t.string().desc('url of a pressed link; the screen decides what to open') },
  rules: [
    'Only the listed subset is formatted; anything else (HTML, images, tables, code) is shown as plain text, never executed or embedded.',
    'Blank lines separate paragraphs; lists and headings use the same font as Text with the heading sizes of Heading.',
    'Links use tokens.color.primary and an underline, are real links for assistive tech, and emit link instead of navigating by themselves.',
  ],
  a11y: ['Headings keep their levels, lists keep list semantics, links are focusable in reading order.'],
  composition: { canContain: [] },
  platform: { react: ['parse the subset into React elements; never dangerouslySetInnerHTML'], flutter: ['parse the subset into a Column of Text.rich / TextSpan with TapGestureRecognizer for links'] },
  examples: [{ markdown: '**Near mint.** Shipped in a toploader.\n\n- Base Set, 1999\n- [Grading guide](https://example.com/grading)' }],
});
