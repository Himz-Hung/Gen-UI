import { defineProject } from '@himz-genui/core';

export default defineProject({
  name: 'Gallery',
  platforms: ['flutter'],
  agent: 'claude',
  // Tokens: primitives (raw palette) → semantic roles (what components and contracts use) → modes.
  // fw checks references and WCAG contrast in every mode; ui/tokens.css and lib/ui/theme.g.dart are generated from here.
  tokens: {
    primitives: {
      color: {
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 400: '#94A3B8', 500: '#64748B', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
        blue: { 400: '#60A5FA', 600: '#2563EB' }, red: { 400: '#F87171', 600: '#DC2626' },
        green: { 400: '#4ADE80', 700: '#15803D' }, amber: { 400: '#FBBF24', 700: '#B45309' },
        white: '#FFFFFF', black: '#000000',
      },
    },
    semantic: {
      color: {
        primary: '{color.blue.600}', onPrimary: '{color.white}', secondary: '{color.slate.500}', onSecondary: '{color.white}',
        danger: '{color.red.600}', onDanger: '{color.white}', success: '{color.green.700}', onSuccess: '{color.white}',
        warning: '{color.amber.700}', onWarning: '{color.white}',
        surface: '{color.white}', surfaceAlt: '{color.slate.100}', text: '{color.slate.900}', muted: '{color.slate.500}',
        border: '{color.slate.200}', scrim: '{color.slate.900}', onScrim: '{color.white}', shadow: '{color.slate.900}',
      },
      space: [0, 4, 8, 12, 16, 24, 32, 48],
      radius: { sm: 4, md: 8, lg: 16, full: 9999 },
      size: { controlSm: 32, controlMd: 40, controlLg: 48 },
      font: { body: 'Inter', heading: 'Inter' },
    },
    modes: {
      colorScheme: {
        light: {},
        dark: {
          color: {
            primary: '{color.blue.400}', onPrimary: '{color.slate.900}', secondary: '{color.slate.400}', onSecondary: '{color.slate.900}',
            danger: '{color.red.400}', onDanger: '{color.slate.900}', success: '{color.green.400}', onSuccess: '{color.slate.900}',
            warning: '{color.amber.400}', onWarning: '{color.slate.900}',
            surface: '{color.slate.900}', surfaceAlt: '{color.slate.800}', text: '{color.slate.100}', muted: '{color.slate.400}',
            border: '{color.slate.700}', scrim: '{color.black}', shadow: '{color.black}',
          },
        },
      },
    },
    contrast: [['text', 'surface'], ['text', 'surfaceAlt'], ['muted', 'surface'], ['primary', 'surface'], ['danger', 'surface']],
  },

  guards: [],
  // Several languages? List them (the first is the default), add ui-spec/strings/<lang>.ts per language,
  // and say how code translates: languages: ['en', 'vi'], i18nLibrary: 'i18next',
});
