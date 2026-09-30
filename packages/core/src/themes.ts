import type { ProjectConfig } from './define.ts';
import { normalizeTokens, resolveTheme, type ModeSelection } from './theme.ts';
import { cssVar, tokensCss } from './webtokens.ts';

/**
 * ui-spec/project.ts tokens, shaped for the styling library a project already uses, so there is one source:
 * import the project config in tailwind.config.ts / the MUI theme file / a CSS entry and call one of these.
 * Browser-safe and dependency-free (plain objects, no Tailwind or MUI types).
 */
type Tokens = ProjectConfig['tokens'];
/** Default-mode values in the 1.x shape these helpers were written for (rewritten in the theming work, phase 2). */
const px = (n: number) => `${n}px`;
const stack = (f: string) => `${f}, system-ui, sans-serif`;
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The full ui/tokens.css (default mode in :root, one block per mode value, OS dark preference): same as fw writes. */
export function cssVariables(project: { tokens: Tokens }): string {
  return tokensCss(project.tokens);
}

/**
 * A Tailwind preset: `presets: [tailwindPreset(project)]`. Every value points at the CSS custom properties of
 * ui/tokens.css, so modes switch Tailwind classes too: bg-primary, text-on-primary, rounded-md, p-ui-4, h-ui-control-md.
 */
export function tailwindPreset(project: { tokens: Tokens }) {
  const t = normalizeTokens(project.tokens);
  const vars = (group: string, o: Record<string, unknown>, key = (k: string) => kebab(k)) => Object.fromEntries(Object.keys(o).map((k) => [key(k), `var(${cssVar(`${group}.${k}`)})`]));
  return {
    theme: {
      extend: {
        colors: vars('color', t.semantic.color),
        spacing: Object.fromEntries(t.semantic.space.map((_, i) => [`ui-${i}`, `var(${cssVar(`space.${i}`)})`])),
        borderRadius: vars('radius', t.semantic.radius),
        fontFamily: Object.fromEntries(Object.keys(t.semantic.font).map((k) => [k, `var(${cssVar(`font.${k}`)})`])),
        ...(t.semantic.size ? { height: vars('size', t.semantic.size, (k) => `ui-${kebab(k)}`), minHeight: vars('size', t.semantic.size, (k) => `ui-${kebab(k)}`) } : {}),
      },
    },
  };
}

/**
 * MUI theme options: `createTheme(muiTheme(project))`. primary / secondary / danger → palette.primary / secondary /
 * error, success when present, surface → background, text / muted → text.primary / secondary; spacing(n) =
 * tokens.spacing[n]; shape.borderRadius = radius.md; typography from font.body / font.heading.
 */
export function muiTheme(project: { tokens: Tokens }, mode?: ModeSelection) {
  // MUI computes with real colors (hover shades, contrast text), so it gets the resolved values of one mode: rebuild the
  // theme with the new mode when the app switches (createTheme(muiTheme(project, { colorScheme: 'dark' }))).
  const r = resolveTheme(project.tokens, mode).theme;
  const { color: c, space: spacing, radius, font } = r;
  const main = (v?: string) => (v ? { main: v } : undefined);
  const palette = Object.fromEntries(Object.entries({
    primary: main(c.primary), secondary: main(c.secondary), error: main(c.danger), success: main(c.success), warning: main(c.warning), info: main(c.info),
    background: c.surface ? { default: c.background ?? c.surface, paper: c.surface } : undefined,
    text: c.text ? { primary: c.text, ...(c.muted ? { secondary: c.muted } : {}) } : undefined,
  }).filter(([, v]) => v !== undefined));
  const heading = font.heading ? stack(font.heading) : undefined;
  return {
    palette: { ...palette, ...(mode?.colorScheme === 'dark' ? { mode: 'dark' } : {}) },
    spacing: (n: number) => px(spacing[n] ?? n * 4),
    shape: { borderRadius: radius.md ?? 4 },
    typography: {
      fontFamily: font.body ? stack(font.body) : undefined,
      ...(heading ? Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => [h, { fontFamily: heading }])) : {}),
    },
  };
}
