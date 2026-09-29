import { defineProject } from '@himz-genui/core';

// Compatibility fixture: screens using popular Flutter packages. Each lib/screens file says what fw check must answer.
export default defineProject({
  name: 'Compat Flutter',
  platforms: ['flutter'],
  agent: 'claude',
  tokens: {
    color: { primary: '#2563EB', danger: '#DC2626', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  stateLibrary: 'flutter_bloc, get, hooks_riverpod, flutter_hooks, provider, reactive_forms, flutter_form_builder',
});
