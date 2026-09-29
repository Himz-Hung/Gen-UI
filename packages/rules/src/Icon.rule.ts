import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Icon', category: 'media',
  purpose: 'A single icon from the project icon set. Decorative unless label is given. For a pressable icon use IconButton.',
  props: {
    name: t.string().desc('icon name from the project set, e.g. "cart", "star"'),
    size: t.enum(['xs', 'sm', 'md', 'lg', 'xl']).def('md'),
    color: t.enum(['inherit', 'primary', 'muted', 'success', 'warning', 'danger']).def('inherit'),
    label: t.text().opt().desc('when present the icon carries meaning and this is its accessible name'),
  },
  rules: [
    'Sizes xs 12, sm 16, md 20, lg 24, xl 32 logical pixels; square box, no layout shift while loading.',
    'color inherit uses the surrounding text color; the others use tokens.color.*.',
    'One icon set for the whole project; unknown names render a neutral placeholder, never nothing.',
  ],
  a11y: ['Without label: hidden from assistive tech. With label: an image named by label.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'size', byProp: 'size', height: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 }, width: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 } },
    { kind: 'role', role: 'img', name: { fromProp: 'label' }, props: { name: 'star', label: 'Favourite' } },
  ],
  platform: { react: ['inline SVG from one icon module; aria-hidden when no label'], flutter: ['m.Icon from one IconData map keyed by name; semanticLabel = label'] },
  examples: [{ name: 'cart' }, { name: 'star', color: 'warning', label: 'Favourite' }],
});
