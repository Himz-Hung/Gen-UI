import project from '../ui-spec/project';
export const tokens = project.tokens;
export const sp = (i: string | number) => `${tokens.spacing[Number(i)] ?? 0}px`;
export const font = (which: 'body' | 'heading') => `${tokens.font[which]}, system-ui, sans-serif`;
