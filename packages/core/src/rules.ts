import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Catalog, ProjectConfig } from './define.ts';

/**
 * Agent rules: one source, rendered per agent dialect.
 * The base text stays short on purpose; contract details are read on demand via `fw docs`.
 */
export function baseRules(config: ProjectConfig, catalog: Catalog): string {
  const names = Object.values(catalog.components).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const byCat = new Map<string, string[]>();
  for (const c of names) byCat.set(c.category, [...(byCat.get(c.category) ?? []), c.name]);
  const platforms = config.platforms.join(', ');
  return `# UI rules for ${config.name}

This project builds UI from contracts (\`ui-rules/\`, \`ui-spec/components/\`). Target platform(s): ${platforms}.
Design tokens live in \`ui-spec/project.ts\`. Never hard-code colors, spacing, radius or fonts.

## The six rules

1. **Need a component that is not yet in \`ui/\`?** Run \`fw docs <Name>\`, read the contract, write the implementation into \`ui/<Name>.<ext>\`, then run \`fw verify <Name>\` until it passes. Never write a component anywhere else. Never rewrite one that already exists in \`ui/\`.
2. **Building a screen?** Write \`screens/<name>.ui.json\` first (see \`ui-spec/screens/<name>.ts\` for what it needs). No code yet.
3. **Specs only use names from \`ui.catalog.json\`.** Run \`fw check screens/<name>.ui.json\` until it passes. Props are literals or \`{ "path": "/dataName" }\`; events map to action names declared in the screen — never code.
4. **Compose the screen in \`src/screens/<Name>Screen.tsx\` from \`ui/\` only.** No raw markup/widgets outside \`ui/\`. Run \`fw check src/screens/<Name>Screen.tsx\`. App shell (router, store, main) lives in \`src/\` outside \`screens/\` and is hand-written.
5. **Tokens** come from \`ui-spec/project.ts\`.
6. **Navigation** follows \`ui-spec/flows/\`. Do not invent routes. \`fw check ui-spec/flows\` checks them.

Before finishing, run \`fw check\` with no arguments: it checks everything.
If a needed component has no contract, write one in \`ui-spec/components/<Name>.rule.ts\` (compose from existing primitives), then follow rule 1. Every \`fw\` command refreshes the catalog.

## Catalog (names only — read details with \`fw docs <Name>\`)

${[...byCat.entries()].map(([cat, ns]) => `- **${cat}**: ${ns.join(', ')}`).join('\n')}

## Commands

\`fw docs <Name>\` · \`fw verify <Name>\` · \`fw check <spec.ui.json>\` · \`fw check <Screen.tsx>\` · \`fw check\` (everything)
`;
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
export function writeRules(root: string, config: ProjectConfig, catalog: Catalog): string[] {
  const base = baseRules(config, catalog);
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
