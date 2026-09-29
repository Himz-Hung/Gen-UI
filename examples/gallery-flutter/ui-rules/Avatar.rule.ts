import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Avatar', category: 'data',
  purpose: 'Picture of a person or account, falling back to initials.',
  props: {
    name: t.string().desc('person or account name: used for initials and the accessible name'),
    src: t.string().opt(),
    size: t.enum(['xs', 'sm', 'md', 'lg', 'xl']).def('md'),
    shape: t.enum(['circle', 'square']).def('circle'),
    status: t.enum(['none', 'online', 'away', 'offline']).def('none'),
  },
  states: ['image', 'initials', 'loading'],
  rules: [
    'Sizes xs 24, sm 32, md 40, lg 56, xl 80 logical pixels.',
    'Without src, or when it fails, shows up to two initials of name on a tokens.color.secondary background.',
    'status shows a small dot at the bottom-end with a surface-colored ring.',
  ],
  a11y: ['Image named by name; decorative (hidden) when a visible name is right next to it.'],
  composition: { canContain: [] },
  platform: { react: ['<img> with an initials fallback <span>'], flutter: ['m.CircleAvatar (or ClipRRect for square) with foregroundImage and initials child'] },
  examples: [{ name: 'Ash Ketchum', size: 'lg', status: 'online' }],
});
