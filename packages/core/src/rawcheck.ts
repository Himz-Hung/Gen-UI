import ts from 'typescript';
import { readFileSync } from 'node:fs';
import type { Report } from './diagnostics.ts';
import { maskDart } from './dart.ts';
import { isLegacyTokens, normalizeTokens, type ProjectTokens } from './theme.ts';

/**
 * Raw design values inside a component implementation: a hard-coded color does not follow the theme modes, so dark
 * mode (or a brand) silently breaks there. With ThemeTokens these are errors; with the 1.x flat tokens, warnings.
 */
export function rawValues(file: string, platform: 'react' | 'flutter', tokens: ProjectTokens, r: Report): void {
  const strict = !isLegacyTokens(tokens);
  const report = (where: string, msg: string) => (strict ? r.error(where, msg) : r.warn(where, msg));
  const src = readFileSync(file, 'utf8');
  if (platform === 'react') react(file, src, report);
  else flutter(src, tokens, strict, report);
}

const COLOR_PROPS = /\b(color|background|backgroundColor|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outlineColor|fill|stroke|caretColor|accentColor|textDecorationColor|boxShadow|border)\s*:\s*$/;
const NAMED = /^(white|black|red|blue|green|gray|grey|yellow|orange|purple|pink|brown|navy|teal|silver|maroon|olive|lime|aqua|fuchsia)$/i;

function react(file: string, src: string, report: (where: string, msg: string) => void) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const at = (n: ts.Node) => `line ${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;
  const visit = (n: ts.Node) => {
    let text: string | null = null;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) text = n.text;
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) text = n.text;
    if (text !== null && !(ts.isImportDeclaration(n.parent) || ts.isExportDeclaration(n.parent))) {
      const hex = text.match(/(^|[^\w&])#([0-9a-f]{3,8})\b/i);
      if (hex && [3, 4, 6, 8].includes(hex[2].length)) report(at(n), `hard-coded color "#${hex[2]}": use a semantic token (tokens.color.x) so every theme mode applies`);
      else if (/\b(rgba?|hsla?)\(/i.test(text)) report(at(n), `hard-coded color "${text.trim().slice(0, 40)}": use tokens.color.x, or alpha(tokens.color.x, 0.5) for transparency`);
      else if (NAMED.test(text.trim())) {
        const before = src.slice(Math.max(0, n.getStart(sf) - 40), n.getStart(sf));
        if (COLOR_PROPS.test(before)) report(at(n), `hard-coded color "${text.trim()}": use a semantic token (tokens.color.x)`);
      }
    }
    // `${tokens.color.primary}22`: hex alpha appended to a token (breaks once tokens are CSS variables)
    if (ts.isTemplateSpan(n) && /^tokens\.color\.\w+$/.test(n.expression.getText(sf)) && /^[0-9a-f]{2}\b/i.test(n.literal.text))
      report(at(n), `appends a hex alpha to ${n.expression.getText(sf)}: use alpha(${n.expression.getText(sf)}, ${(parseInt(n.literal.text.slice(0, 2), 16) / 255).toFixed(2)})`);
    n.forEachChild(visit);
  };
  visit(sf);
}

function flutter(src: string, tokens: ProjectTokens, strict: boolean, report: (where: string, msg: string) => void) {
  const m = maskDart(src);
  const line = (i: number) => `line ${m.slice(0, i).split('\n').length}`;
  for (const x of m.matchAll(/\bColor\s*\(\s*0x([0-9a-fA-F]+)\s*\)|\bColor\.from(ARGB|RGBO)\s*\(|\bColors\.(?!transparent\b)([a-z]\w*)/g)) {
    if (x[1] && /^0{2}/.test(x[1].padStart(8, '0'))) continue; // alpha 00: transparent
    report(line(x.index!), `hard-coded color ${x[0].replace(/\s+/g, '').replace(/\($/, '(…)')}: use a semantic token (context.ui.color.x) so every theme mode applies`);
  }
  if (!strict) return;
  // UiTokens holds the default mode only; values a mode can change must be read from the active theme
  const t = normalizeTokens(tokens);
  const changed = new Set(Object.values(t.modes ?? {}).flatMap((values) => Object.values(values).flatMap((o) => Object.keys(o).filter((g) => (o as Record<string, unknown>)[g] !== undefined))));
  for (const x of m.matchAll(/\bUiTokens\.(color|space|spacing|radius|size)(\w*)/g)) {
    const group = x[1] === 'spacing' ? 'space' : x[1];
    if (group === 'color' || changed.has(group)) report(line(x.index!), `UiTokens.${x[1]}${x[2]} is the default mode only: read context.ui.${group === 'color' ? `color.${x[2][0]?.toLowerCase() ?? ''}${x[2].slice(1)}` : group === 'space' ? 'space(n)' : `${group}.x`} so theme modes apply`);
  }
}
