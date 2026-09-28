// Hand-written i18n for the example (no library). Strings come from ui-spec/strings/, the language list
// from ui-spec/project.ts. Pick a language with ?lang=vi; it is remembered for the session.
import type { Strings } from '@himz-genui/core';
import project from '../ui-spec/project';
import en from '../ui-spec/strings/en';
import vi from '../ui-spec/strings/vi';

const ALL: Record<string, Strings> = { en, vi };
const LANGS = project.languages ?? ['en'];

function pick(): string {
  const asked = new URLSearchParams(location.search).get('lang');
  try {
    if (asked && LANGS.includes(asked)) sessionStorage.setItem('lang', asked);
    const saved = sessionStorage.getItem('lang');
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* storage blocked: fall through */ }
  return asked && LANGS.includes(asked) ? asked : LANGS[0];
}

export const lang = pick();

function lookup(tree: Strings, key: string): string | undefined {
  let cur: string | Strings | undefined = tree;
  for (const part of key.split('.')) cur = typeof cur === 'object' ? cur[part] : undefined;
  return typeof cur === 'string' ? cur : undefined;
}

/** Translated text for a key from ui-spec/strings/, with {placeholders} filled. Falls back to the default language. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const text = lookup(ALL[lang], key) ?? lookup(ALL[LANGS[0]], key) ?? key;
  return text.replace(/\{(\w+)\}/g, (m, p) => (p in params ? String(params[p]) : m));
}
document.documentElement.lang = lang;
