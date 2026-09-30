// Theme model (packages/core/src/theme.ts, built to dist/): references, modes, integrity and contrast diagnostics.
import assert from 'node:assert/strict';
import { resolveTheme, modeCombos, defaultMode, themeProblems, contrastRatio, normalizeTokens, toDesignTokens, fromDesignTokens } from '../packages/core/dist/theme.js';
import { tokensCss, tokensTs } from '../packages/core/dist/webtokens.js';
import { tailwindPreset, muiTheme } from '../packages/core/dist/themes.js';
import { themeDart } from '../packages/core/dist/flutter.js';
import { rawValues } from '../packages/core/dist/rawcheck.js';
import { Report } from '../packages/core/dist/diagnostics.js';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log(`ok    ${name}`); };

const base = {
  primitives: { color: { blue: { 600: '#2563EB' }, gray: { 50: '#F8FAFC', 500: '#64748B', 900: '#0F172A' }, white: '#FFFFFF' } },
  semantic: {
    color: { primary: '{color.blue.600}', onPrimary: '{color.white}', surface: '{color.white}', onSurface: '{color.gray.900}', link: '{color.primary}' },
    space: [0, 4, 8, 12, 16], radius: { md: 8 }, size: { controlMd: 40 }, font: { body: 'Inter' },
    component: { button: { primaryBg: '{color.primary}' } },
  },
  modes: {
    colorScheme: { light: {}, dark: { color: { surface: '{color.gray.900}', onSurface: '{color.gray.50}' } } },
    density: { comfortable: {}, compact: { size: { controlMd: 36 }, space: [0, 2, 4] } },
  },
};

test('primitive and semantic references resolve', () => {
  const { theme, problems } = resolveTheme(base);
  assert.deepEqual(problems, []);
  assert.equal(theme.color.primary, '#2563EB');
  assert.equal(theme.color.link, '#2563EB');                 // semantic → semantic → primitive
  assert.equal(theme.component.button.primaryBg, '#2563EB');
});
test('modes override only what they name', () => {
  const { theme } = resolveTheme(base, { colorScheme: 'dark', density: 'compact' });
  assert.equal(theme.color.surface, '#0F172A');
  assert.equal(theme.color.primary, '#2563EB');
  assert.equal(theme.size.controlMd, 36);
  assert.deepEqual(theme.space, [0, 2, 4, 12, 16]);          // step-wise override
});
test('default mode is the first value of each axis; combos cover every pair', () => {
  assert.deepEqual(defaultMode(base), { colorScheme: 'light', density: 'comfortable' });
  assert.equal(modeCombos(base).length, 4);
});
test('a clean theme has no problems', () => assert.deepEqual(themeProblems(base), []));
test('broken reference and cycle are reported', () => {
  const t = structuredClone(base);
  t.semantic.color.focus = '{color.teal.500}';
  t.semantic.color.a = '{color.b}'; t.semantic.color.b = '{color.a}';
  const msgs = themeProblems(t).map((p) => p.message).join('\n');
  assert.match(msgs, /color\.focus: \{color\.teal\.500\} does not exist/);
  assert.match(msgs, /reference cycle/);
});
test('overriding a token the semantic layer lacks is an error', () => {
  const t = structuredClone(base);
  t.modes.colorScheme.dark.color.surfce = '#000000';
  assert.ok(themeProblems(t).some((p) => p.where.endsWith('color.surfce') && p.level === 'error'));
});
test('contrast is checked in every mode', () => {
  const t = structuredClone(base);
  t.modes.colorScheme.dark.color.onSurface = '{color.gray.500}';   // gray 500 on gray 900: ~3.8
  const bad = themeProblems(t).filter((p) => /contrast/.test(p.message));
  assert.equal(bad.length, 2);                                      // dark × both densities
  assert.ok(bad.every((p) => p.where.includes('colorScheme=dark')));
});
test('declared pairs and ratios', () => {
  const t = structuredClone(base);
  t.semantic.color.muted = '{color.gray.500}';
  t.contrast = [['muted', 'surface', 7]];
  assert.ok(themeProblems(t).some((p) => /color\.muted .* < 7/.test(p.message)));
  assert.equal(Math.round(contrastRatio('#FFFFFF', '#000000')), 21);
});
test('the 1.x flat shape still resolves', () => {
  const legacy = { color: { primary: '#2563EB' }, spacing: [0, 4], radius: { md: 8 }, font: { body: 'Inter' } };
  assert.deepEqual(normalizeTokens(legacy).semantic.space, [0, 4]);
  assert.equal(resolveTheme(legacy).theme.color.primary, '#2563EB');
  assert.deepEqual(themeProblems(legacy), []);
});
test('web: default in :root, only the diff per mode value, OS dark preference', () => {
  const css = tokensCss(base);
  assert.match(css, /:root \{[^}]*--ui-color-surface: #FFFFFF;/);
  const dark = css.match(/\[data-ui-color-scheme="dark"\] \{([^}]*)\}/)[1];
  assert.match(dark, /--ui-color-surface: #0F172A;/);
  assert.doesNotMatch(dark, /--ui-color-primary/);                 // unchanged tokens are not repeated
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(css, /\[data-ui-density="compact"\] \{[^}]*--ui-size-control-md: 36px;/);
});
test('web: a reference to a semantic token stays a var() and follows modes', () => {
  const css = tokensCss(base);
  assert.match(css, /--ui-color-link: var\(--ui-color-primary\);/);
  assert.match(css, /--ui-component-button-primary-bg: var\(--ui-color-primary\);/);
  assert.match(css, /--ui-color-primary: #2563EB;/);               // primitive references resolve to the value
});
test('web: tokens.g.ts points at the variables and types the modes', () => {
  const ts = tokensTs(base);
  assert.match(ts, /primary: 'var\(--ui-color-primary\)'/);
  assert.match(ts, /colorScheme: 'light' \| 'dark' \| 'system';/);
  assert.match(ts, /density: 'comfortable' \| 'compact';/);
  assert.match(ts, /export function setMode/);
});
test('tailwind preset uses the variables; MUI gets resolved colors per mode', () => {
  assert.equal(tailwindPreset({ tokens: base }).theme.extend.colors['on-primary'], 'var(--ui-color-on-primary)');
  const dark = muiTheme({ tokens: base }, { colorScheme: 'dark' });
  assert.equal(dark.palette.mode, 'dark');
  assert.equal(dark.palette.background.paper, '#0F172A');
});
test('flutter: an enum per axis, a const UiTheme per combination, ThemeData from the tokens', () => {
  const dart = themeDart({ tokens: base });
  assert.match(dart, /enum UiColorScheme \{ light, dark \}/);
  assert.match(dart, /enum UiDensity \{ comfortable, compact \}/);
  assert.equal((dart.match(/const UiTheme _theme\d+ =/g) ?? []).length, 4);
  assert.match(dart, /\(UiColorScheme\.dark, UiDensity\.compact\) => _theme3/);
  assert.match(dart, /extension UiThemeContext on BuildContext/);
  assert.match(dart, /onPrimary: t\.color\.onPrimary/);
  const flat = themeDart({ tokens: { color: { primary: '#2563EB' }, spacing: [0, 4], radius: {}, font: {} } });
  assert.match(flat, /const UiRadius\(\);/);                        // empty groups and no axes stay valid Dart
  assert.match(flat, /ThemeData uiTheme\(\) \{/);
});
test('raw values: hard-coded colors are errors with ThemeTokens, warnings with 1.x tokens', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fw-raw-'));
  const tsx = join(dir, 'X.tsx');
  writeFileSync(tsx, "import { tokens, alpha } from './tokens';\nexport const s = { color: '#fff', border: `1px solid #E5E7EB`, background: `${tokens.color.primary}22`, fill: 'white', ok: tokens.color.primary, tint: alpha(tokens.color.primary, 0.1) };\n");
  const strict = new Report('X.tsx'); rawValues(tsx, 'react', base, strict);
  assert.equal(strict.errors.length, 4);                              // #fff, #E5E7EB, hex alpha on a token, 'white' on fill
  const legacy = new Report('X.tsx'); rawValues(tsx, 'react', { color: {}, spacing: [], radius: {}, font: {} }, legacy);
  assert.equal(legacy.errors.length, 0); assert.equal(legacy.items.length, 4);
  const dart = join(dir, 'x.dart');
  writeFileSync(dart, "final a = Color(0xFF112233); final b = Colors.red; final c = Colors.transparent; final d = Color(0x00000000); final e = UiTokens.colorPrimary; final f = UiTokens.space(2);\n");
  const d = new Report('x.dart'); rawValues(dart, 'flutter', base, d);
  const msgs = d.errors.map((e) => e.message).join('\n');
  assert.equal(d.errors.length, 4);                                   // Color(0x…), Colors.red, UiTokens.colorPrimary, UiTokens.space (density changes space)
  assert.match(msgs, /context\.ui\.color\.primary/);
});
test('W3C Design Tokens: token sets per layer and mode, round trip', () => {
  const sets = toDesignTokens(base);
  assert.deepEqual(Object.keys(sets), ['primitives', 'semantic', 'mode/colorScheme/light', 'mode/colorScheme/dark', 'mode/density/comfortable', 'mode/density/compact']);
  assert.deepEqual(sets.semantic.color.primary, { $value: '{color.blue.600}', $type: 'color' });
  assert.deepEqual(sets.semantic.space['4'], { $value: '16px', $type: 'dimension' });
  const back = fromDesignTokens(JSON.parse(JSON.stringify(sets)));
  assert.deepEqual(resolveTheme(back, { colorScheme: 'dark', density: 'compact' }).theme, resolveTheme(base, { colorScheme: 'dark', density: 'compact' }).theme);
});
console.log(`theme: ${n} passed`);
