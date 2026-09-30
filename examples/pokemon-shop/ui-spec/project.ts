import { defineProject } from '@himz-genui/core';

export default defineProject({
  name: 'PokéCards Shop',
  platforms: ['react'],
  agent: 'claude',
  // Tokens: primitives → semantic roles → modes (single mode here). primary is the brand red darkened from #E3350D
  // to #D12F0C: white on #E3350D is 4.39:1, under WCAG AA (4.5) for button text; fw checks it.
  tokens: {
    primitives: {
      color: {
        red: { 700: '#D12F0C', 800: '#B91C1C' }, indigo: { 700: '#3B4CCA' }, green: { 700: '#15803D' }, amber: { 700: '#B45309' },
        gray: { 100: '#F3F4F6', 200: '#E5E7EB', 500: '#6B7280', 800: '#1F2937' }, white: '#FFFFFF', black: '#000000',
      },
    },
    semantic: {
      color: {
        primary: '{color.red.700}', onPrimary: '{color.white}', secondary: '{color.indigo.700}', onSecondary: '{color.white}',
        danger: '{color.red.800}', onDanger: '{color.white}', success: '{color.green.700}', onSuccess: '{color.white}',
        warning: '{color.amber.700}', onWarning: '{color.white}',
        surface: '{color.white}', surfaceAlt: '{color.gray.100}', text: '{color.gray.800}', muted: '{color.gray.500}',
        border: '{color.gray.200}', scrim: '{color.black}', shadow: '{color.black}',
      },
      space: [0, 4, 8, 12, 16, 24, 32, 48],
      radius: { sm: 4, md: 8, lg: 16, full: 9999 },
      size: { controlSm: 32, controlMd: 40, controlLg: 48 },
      font: { body: 'Inter', heading: 'Inter' },
    },
    contrast: [['text', 'surface'], ['muted', 'surface'], ['primary', 'surface']],
  },

  guards: ['requireCartNotEmpty'],
  stateLibrary: 'zustand',
  languages: ['en', 'vi'],
  i18nLibrary: 'src/i18n.ts (t(key, params))',
});
