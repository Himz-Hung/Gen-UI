import { defineProject } from '@himz-genui/core';

export default defineProject({
  name: 'Gallery',
  platforms: ['react'],
  agent: 'claude',
  tokens: {
    color: { primary: '#2563EB', secondary: '#64748B', danger: '#DC2626', success: '#15803D', warning: '#B45309', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  guards: [],
  // Several languages? List them (the first is the default), add ui-spec/strings/<lang>.ts per language,
  // and say how code translates: languages: ['en', 'vi'], i18nLibrary: 'i18next',
});
