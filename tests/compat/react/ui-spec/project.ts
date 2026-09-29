import { defineProject } from '@himz-genui/core';

// Compatibility fixture: every library a screen may meet. Each src/screens file says what fw check must answer.
export default defineProject({
  name: 'Compat React',
  platforms: ['react'],
  agent: 'claude',
  tokens: {
    color: { primary: '#2563EB', danger: '#DC2626', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  stateLibrary: 'zustand, react-redux, @tanstack/react-query, @apollo/client, swr, react-hook-form, @tanstack/react-form, formik, react-router',
  i18nLibrary: 'react-intl',
  screenDirs: ['src/screens', 'app'],
  freeformDirs: ['app/marketing'],
});
