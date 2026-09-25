import { defineProject } from '@genui/core';

export default defineProject({
  name: 'PokéCards Shop',
  platforms: ['react'],
  agent: 'claude',
  tokens: {
    color: { primary: '#E3350D', secondary: '#3B4CCA', danger: '#B91C1C', success: '#15803D', surface: '#FFFFFF', text: '#1F2937', muted: '#6B7280' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],
    radius: { sm: 4, md: 8, lg: 16, full: 9999 },
    font: { body: 'Inter', heading: 'Inter' },
  },
  guards: ['requireCartNotEmpty'],
  stateLibrary: 'zustand',
});
