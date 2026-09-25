import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Image', category: 'media',
  purpose: 'Displays an image with a fixed aspect ratio and a placeholder while loading.',
  props: {
    src: t.string(),
    alt: t.string().desc('empty string for decorative images'),
    ratio: t.enum(['1:1', '4:3', '3:4', '16:9', '5:7']).def('5:7').desc('5:7 is a trading card'),
    fit: t.enum(['cover', 'contain']).def('contain'),
    radius: t.enum(['none', 'sm', 'md', 'lg']).def('md'),
  },
  states: ['loading', 'loaded', 'error'],
  rules: ['The box keeps its ratio before, during and after load — no layout shift.', 'loading shows a neutral placeholder; error shows a neutral placeholder with an icon.', 'Never upscales beyond natural size when fit=contain.'],
  a11y: ['alt is the accessible description; alt="" hides it from assistive tech.'],
  platform: { react: ['use <img loading="lazy">'] },
});
