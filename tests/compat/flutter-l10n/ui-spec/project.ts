import { defineProject } from '@himz-genui/core';

// Compatibility fixture: two languages through ARB files that fw generates from ui-spec/strings.
export default defineProject({
  name: 'Compat Flutter l10n',
  platforms: ['flutter'],
  agent: 'claude',
  tokens: {
    color: { primary: '#2563EB', danger: '#DC2626', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  languages: ['en', 'vi'],
  i18nLibrary: 'flutter_localizations',
});
