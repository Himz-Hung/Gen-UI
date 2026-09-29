import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Catalog, ProjectConfig } from './define.ts';
import { screenWrappers } from './wrappers.ts';
import { usesArb } from './flutter.ts';

/**
 * Agent rules: one source, rendered per agent dialect.
 * The base text stays short on purpose; contract details are read on demand via `fw docs`.
 */
export function baseRules(config: ProjectConfig, catalog: Catalog, hasOutline = true): string {
  const names = Object.values(catalog.components).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const byCat = new Map<string, string[]>();
  for (const c of names) byCat.set(c.category, [...(byCat.get(c.category) ?? []), c.name]);
  const platforms = config.platforms.join(', ');
  return `# UI rules for ${config.name}

This project builds UI from contracts (\`ui-rules/\`, \`ui-spec/components/\`). Target platform(s): ${platforms}.
Design tokens live in \`ui-spec/project.ts\`. Never hard-code colors, spacing, radius or fonts.

## The rules

${rules(hasOutline, config).map((r, i) => `${i + 1}. ${r}`).join('\n')}

Before finishing, run \`fw check\` with no arguments: it checks everything and prints what is still to do for each outline entry.
If a needed component has no contract, write one in \`ui-spec/components/<Name>.rule.ts\` (compose from existing primitives), then follow the rule for a component not yet in \`ui/\`. Every \`fw\` command refreshes the catalog.

## Catalog (names only — read details with \`fw docs <Name>\`)

${[...byCat.entries()].map(([cat, ns]) => `- **${cat}**: ${ns.join(', ')}`).join('\n')}

## Commands

\`fw docs <Name>\` · \`fw verify <Name>\` · \`fw check ui-spec/app.ts\` · \`fw check <spec.ui.json>\` · \`fw check <Screen.tsx>\` · \`fw check\` (everything)
`;
}

/** The numbered rules. The outline rules change when the project has no ui-spec/app.ts yet. */
function rules(hasOutline: boolean, config: ProjectConfig): string[] {
  const langs = config.languages ?? [];
  const react = config.platforms.includes('react'), flutter = config.platforms.includes('flutter');
  const wrappers = screenWrappers(config);
  return [
    hasOutline
      ? `**\`ui-spec/app.ts\` is the outline.** Only the screens and components listed there exist for this app. Need a new screen or component? Add its name to the outline first (a new component also needs a contract), then \`fw check ui-spec/app.ts\`. When \`fw check\` says *Did you mean …?* and it is a typo, fix the name; do not add the misspelled one.`
      : `**No outline yet.** Create \`ui-spec/app.ts\` with \`defineApp({ screens, components })\` listing every screen and component this app uses, then \`fw check ui-spec/app.ts\`.`,
    `**${hasOutline ? 'Screen in the outline' : 'Screen'} with no \`ui-spec/screens/<name>.ts\` yet?** Draft it from ${hasOutline ? 'its purpose in \`ui-spec/app.ts\`' : 'what the user asked for'}, \`ui-spec/domain.ts\` and the screens around it: \`shows\` (what the user sees), \`local\` (actions that stay on the screen), \`when\` (empty / loading / error / disabled cases), \`data\`, \`goTo\` (target screen → how the user gets there), \`back\`, \`params\`. If \`data\` or \`params\` need a type that \`ui-spec/domain.ts\` does not declare yet, draft that type too (\`t.object\`, \`t.array\`, \`t.ref\`; values shown as text are pre-formatted strings such as \`priceLabel: t.string()\`). Run \`fw check ui-spec/screens\`, then **show the drafts (screen and any new types) to the user and wait for approval** before writing its spec.`,
    `**Need a component that is not yet ${react && flutter ? 'implemented' : react ? 'in \`ui/\`' : 'in \`lib/ui/\`'}?** Run \`fw docs <Name>\`, read the contract, write the implementation${react ? ' into \`ui/<Name>.tsx\`' : ''}${react && flutter ? ' and' : ''}${flutter ? ' into \`lib/ui/<snake_name>.dart\`' : ''}, then run \`fw verify <Name>\` until it passes. \`fw verify\` also runs the contract's \`checks\` as generated tests (\`test/fw/\`): a failing \`checks[i]\` means the component breaks that commitment, so fix the component, never the check or the generated test. Never write a component anywhere else. Never rewrite one that already exists.`,
    ...(flutter ? [`**Flutter components** live in \`lib/ui/<snake_name>.dart\` as \`class Ui<Name>\` (\`ListItem\` → \`lib/ui/list_item.dart\`, \`UiListItem\`). \`fw docs <Name>\` prints the exact Dart signature — enums, item classes, constructor, fields, \`onX\` callbacks, \`List<Widget> children\` — and \`fw verify <Name>\` checks exactly that; fill in \`build()\` only. Colors, spacing, radius, fonts come from \`UiTokens\` (\`lib/ui/tokens.g.dart\`). Run \`flutter analyze\` too. Never edit \`*.g.dart\` or \`lib/ui/ui.dart\`: fw generates them.`] : []),
    `**Building a screen?** Write \`screens/<name>.ui.json\` first, from \`ui-spec/screens/<name>.ts\`. No code yet.`,
    `**Specs only use names from \`ui.catalog.json\`.** Run \`fw check screens/<name>.ui.json\` until it passes. Props are literals or bindings: \`{ "path": "/cart/subtotalLabel" }\` reads screen data (every segment is typed through \`domain.ts\`); to show each item of a list put \`"repeat": { "path": "/cart/items", "as": "line" }\` on the element and read \`{ "path": "line/card/name" }\` inside it — never leave \`""\` placeholders. Events map to the screen's actions — never code. Actions are: \`go<Target>\` for each \`goTo\` (or its \`action\`), each \`local\` key, and \`goBack\` unless \`back: false\` or first screen. Do not repeat \`data\` / \`actions\` in the spec when the description has them.`,
    ...(react ? [`**Compose the React screen in \`src/screens/<Name>Screen.tsx\` from \`ui/\` only.** No raw markup outside \`ui/\`, and pass contract props only (no \`className\` / \`style\`: spacing comes from Stack, Inline, Grid, Container, Spacer). Run \`fw check src/screens/<Name>Screen.tsx\`. App shell (router, store, main) lives in \`src/\` outside \`screens/\` and is hand-written.`] : []),
    ...(flutter ? [`**Compose the Flutter screen in \`lib/screens/<snake_name>_screen.dart\` (\`class <Name>Screen\`) from \`lib/ui/\` only.** Import \`lib/ui/ui.dart\`; Flutter libraries only with \`show\` (\`package:flutter/widgets.dart show StatelessWidget, Widget, BuildContext, MediaQuery, Navigator\`). Construct no widget from outside \`lib/ui/\` (no \`Text\`, \`Padding\`, package widgets); static calls like \`MediaQuery.sizeOf(context)\`, \`Navigator.of(context)\`, \`context.go\` are fine. Never another widget class in the screen file. Run \`fw check lib/screens/<snake_name>_screen.dart\`. The app shell (\`main.dart\`, routing, state) lives in \`lib/\` outside \`screens/\` and \`ui/\`.`] : []),
    `**Tokens** come from \`ui-spec/project.ts\`.`,
    ...(wrappers.length ? [`**State and forms** use ${config.stateLibrary ? `\`${config.stateLibrary}\`` : 'the project libraries'}. In screens, only these wrappers may appear besides ui components: ${wrappers.map((w) => `\`${w}\``).join(', ')}. They pass state and draw nothing; the UI inside them still comes from ${flutter && !react ? '\`lib/ui/\`' : '\`ui/\`'}. Hooks and calls (\`useStore\`, \`useForm\`, \`context.watch\`, \`ref.watch\`) need no listing. Validation results go into the \`error\` prop of the input.`] : []),
    ...(langs.length > 1 ? [`**Languages: ${langs.join(', ')}** (${langs[0]} is the default). Props marked _(text)_ in \`fw docs\` are never hard-coded: in specs write \`{ "i18n": "cart.title" }\` (with \`"params": { "count": { "path": "/cart/count" } }\` for \`{count}\` placeholders); in React code call the project's i18n function${config.i18nLibrary ? ` (\`${config.i18nLibrary}\`)` : ''} with the same key${flutter ? (usesArb(config) ? '; in Flutter code use \`AppLocalizations.of(context)!\` (fw writes the ARB files from ui-spec/strings: \`cart.empty.title\` → \`cartEmptyTitle\`, placeholders are arguments)' : '; in Flutter code use the generated \`UiStrings\` (\`cart.empty.title\` → \`UiStrings.cartEmptyTitle\`, placeholders are named arguments)') : ''}. Add every new key to \`ui-spec/strings/${langs[0]}.ts\`, draft the other languages, and show the new strings to the user. \`fw check ui-spec/strings\` checks them.`] : []),
    `**Navigation** follows \`goTo\` / \`back\` / \`params\` in \`ui-spec/screens/*.ts\` (or \`ui-spec/flows/\` in older projects). Do not invent routes. \`fw check ui-spec/screens\` checks them.`,
  ];
}

interface Target { path: string; render: (base: string) => string; }

export function targetsFor(agent: ProjectConfig['agent']): Target[] {
  switch (agent) {
    case 'claude':
      return [
        { path: '.claude/skills/ui/SKILL.md', render: (b) => `---\nname: ui\ndescription: Build UI for this project from contracts. Use whenever creating or changing screens or UI components.\n---\n\n${b}` },
        { path: 'CLAUDE.md', render: () => `# Project instructions\n\nUI work (screens, components) follows the \`ui\` skill in \`.claude/skills/ui/SKILL.md\`. Read it before touching \`ui/\` or \`screens/\`.\n` },
      ];
    case 'cursor':
      return [{ path: '.cursor/rules/ui.mdc', render: (b) => `---\ndescription: UI rules for this project\nglobs: ["ui/**", "screens/**", "ui-spec/**", "src/**"]\nalwaysApply: false\n---\n\n${b}` }];
    case 'codex':
      return [{ path: 'AGENTS.md', render: (b) => b }];
    case 'copilot':
      return [{ path: '.github/copilot-instructions.md', render: (b) => b }];
  }
}

const MARK_START = '<!-- fw:start -->', MARK_END = '<!-- fw:end -->';

/** Write rules files. For CLAUDE.md-style pointer files, only the marked block is replaced so user content survives. */
export function writeRules(root: string, config: ProjectConfig, catalog: Catalog, hasOutline = true): string[] {
  const base = baseRules(config, catalog, hasOutline);
  const written: string[] = [];
  for (const t of targetsFor(config.agent)) {
    const full = join(root, t.path);
    mkdirSync(dirname(full), { recursive: true });
    const block = `${MARK_START}\n${t.render(base).trimEnd()}\n${MARK_END}\n`;
    let out = block;
    if (existsSync(full)) {
      const cur = readFileSync(full, 'utf8');
      const s = cur.indexOf(MARK_START), e = cur.indexOf(MARK_END);
      out = s >= 0 && e > s ? cur.slice(0, s) + block + cur.slice(e + MARK_END.length + 1) : cur.trimEnd() + '\n\n' + block;
    }
    writeFileSync(full, out);
    written.push(t.path);
  }
  return written;
}
