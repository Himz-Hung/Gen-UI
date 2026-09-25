import type { ComponentContract } from './define.ts';
import { typeText } from './types.ts';

/** Markdown the agent reads before materializing a component. */
export function renderDocs(c: ComponentContract, platform?: 'react' | 'flutter'): string {
  const L: string[] = [];
  L.push(`# ${c.name}`, '', `_${c.category}_ · contract v${c.version ?? 1}`, '', c.purpose, '');
  L.push('## Props', '', '| prop | type | default | notes |', '|---|---|---|---|');
  for (const [k, v] of Object.entries(c.props)) {
    const def = v.default !== undefined ? `\`${JSON.stringify(v.default)}\`` : v.optional ? '—' : '**required**';
    L.push(`| ${k} | \`${typeText(v)}\` | ${def} | ${v.description ?? ''} |`);
  }
  if (c.children) L.push('', 'Accepts children.');
  if (c.events && Object.keys(c.events).length) {
    L.push('', '## Events', '');
    for (const [k, v] of Object.entries(c.events)) L.push(`- \`${k}\`${v.kind === 'void' ? '' : ` (${typeText(v)})`}${v.description ? ` — ${v.description}` : ''}`);
  }
  if (c.states?.length) L.push('', '## States', '', c.states.map((s) => `\`${s}\``).join(', '));
  if (c.rules?.length) L.push('', '## Rules (every platform)', '', ...c.rules.map((x) => `- ${x}`));
  if (c.a11y?.length) L.push('', '## Accessibility', '', ...c.a11y.map((x) => `- ${x}`));
  if (c.composition) {
    L.push('', '## Composition', '');
    if (c.composition.canContain) L.push(`- May only contain: ${c.composition.canContain.join(', ')}`);
    if (c.composition.cannotBeInside) L.push(`- Never inside: ${c.composition.cannotBeInside.join(', ')}`);
  }
  const plats = platform ? [platform] : (Object.keys(c.platform ?? {}) as ('react' | 'flutter')[]);
  for (const p of plats) {
    const hints = c.platform?.[p];
    if (hints?.length) L.push('', `## ${p} hints (advisory)`, '', ...hints.map((x) => `- ${x}`));
  }
  if (c.examples?.length) {
    L.push('', '## Examples', '', '```json', ...c.examples.map((e) => JSON.stringify(e)), '```');
  }
  return L.join('\n') + '\n';
}
