import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Button', category: 'action',
  purpose: 'Triggers an action. Not for navigation to another screen — use Link.',
  props: {
    label: t.string(),
    variant: t.enum(['primary', 'secondary', 'ghost', 'danger']).def('primary'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
    disabled: t.boolean().def(false),
    loading: t.boolean().def(false),
    icon: t.string().opt().desc('icon name shown before the label'),
    fullWidth: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused', 'disabled', 'loading'],
  rules: [
    'loading=true implies disabled, replaces the label with a spinner, and keeps the same width and height.',
    'Never emits press while disabled or loading.',
    'Height by size: sm 32, md 40, lg 48 logical pixels. Horizontal padding from tokens.spacing.',
    'primary uses tokens.color.primary background; danger uses tokens.color.danger; secondary is outlined; ghost has no background or border.',
    'Radius from tokens.radius.md.',
  ],
  a11y: ['Role button.', 'Label is the accessible name; if label is empty an accessible name must still be provided.', 'Visible focus ring.'],
  composition: { canContain: [], cannotBeInside: ['Button', 'Link'] },
  platform: { react: ['use <button type="button">, never a div with onClick', 'aria-busy while loading'], flutter: ['FilledButton / OutlinedButton / TextButton by variant', 'onPressed null when disabled or loading'] },
  examples: [{ label: 'Add to cart' }, { label: 'Remove', variant: 'danger', size: 'sm' }, { label: 'Saving…', loading: true }],
});
