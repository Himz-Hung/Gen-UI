import type { ProjectConfig } from './define.ts';

/**
 * ui-spec/project.ts tokens, shaped for the styling library a project already uses, so there is one source:
 * import the project config in tailwind.config.ts / the MUI theme file / a CSS entry and call one of these.
 * Browser-safe and dependency-free (plain objects, no Tailwind or MUI types).
 */
type Tokens = ProjectConfig['tokens'];
const px = (n: number) => `${n}px`;
const stack = (f: string) => `${f}, system-ui, sans-serif`;
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** `:root { --ui-color-primary: …; --ui-space-4: 16px; --ui-radius-md: 8px; --ui-font-body: …; }` */
export function cssVariables(project: { tokens: Tokens }, prefix = '--ui'): string {
  const t = project.tokens;
  const lines = [
    ...Object.entries(t.color).map(([k, v]) => `${prefix}-color-${kebab(k)}: ${v};`),
    ...t.spacing.map((v, i) => `${prefix}-space-${i}: ${px(v)};`),
    ...Object.entries(t.radius).map(([k, v]) => `${prefix}-radius-${kebab(k)}: ${px(v)};`),
    ...Object.entries(t.font).map(([k, v]) => `${prefix}-font-${kebab(k)}: ${stack(v)};`),
    ...Object.entries(t.size ?? {}).map(([k, v]) => `${prefix}-size-${kebab(k)}: ${px(v)};`),
  ];
  return `:root {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;
}

/**
 * A Tailwind preset: `presets: [tailwindPreset(project)]`. Colors and radius extend the theme under their token
 * names (bg-primary, rounded-md); spacing is prefixed (p-ui-4 = tokens.spacing[4]) so Tailwind's own scale stays.
 */
export function tailwindPreset(project: { tokens: Tokens }) {
  const t = project.tokens;
  return {
    theme: {
      extend: {
        colors: { ...t.color },
        spacing: Object.fromEntries(t.spacing.map((v, i) => [`ui-${i}`, px(v)])),
        borderRadius: Object.fromEntries(Object.entries(t.radius).map(([k, v]) => [k, px(v)])),
        fontFamily: Object.fromEntries(Object.entries(t.font).map(([k, v]) => [k, [v, 'system-ui', 'sans-serif']])),
        ...(t.size ? { height: Object.fromEntries(Object.entries(t.size).map(([k, v]) => [`ui-${kebab(k)}`, px(v)])) } : {}),
      },
    },
  };
}

/**
 * MUI theme options: `createTheme(muiTheme(project))`. primary / secondary / danger → palette.primary / secondary /
 * error, success when present, surface → background, text / muted → text.primary / secondary; spacing(n) =
 * tokens.spacing[n]; shape.borderRadius = radius.md; typography from font.body / font.heading.
 */
export function muiTheme(project: { tokens: Tokens }) {
  const { color: c, spacing, radius, font } = project.tokens;
  const main = (v?: string) => (v ? { main: v } : undefined);
  const palette = Object.fromEntries(Object.entries({
    primary: main(c.primary), secondary: main(c.secondary), error: main(c.danger), success: main(c.success), warning: main(c.warning), info: main(c.info),
    background: c.surface ? { default: c.background ?? c.surface, paper: c.surface } : undefined,
    text: c.text ? { primary: c.text, ...(c.muted ? { secondary: c.muted } : {}) } : undefined,
  }).filter(([, v]) => v !== undefined));
  const heading = font.heading ? stack(font.heading) : undefined;
  return {
    palette,
    spacing: (n: number) => px(spacing[n] ?? n * 4),
    shape: { borderRadius: radius.md ?? 4 },
    typography: {
      fontFamily: font.body ? stack(font.body) : undefined,
      ...(heading ? Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => [h, { fontFamily: heading }])) : {}),
    },
  };
}
