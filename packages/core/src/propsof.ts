import ts from 'typescript';
import { dirname, sep } from 'node:path';

/** One prop as the TypeScript checker sees it. `library` names the package it comes from when declared in node_modules. */
export interface ResolvedProp { optional: boolean; typeText: string; library?: string }

/**
 * Props of an exported React component, resolved with the type checker: function components, arrow consts,
 * forwardRef / memo (their call signature), and props types that extend or intersect library types (MUI's
 * ButtonProps, React.ButtonHTMLAttributes…). Returns null when the component or its props cannot be resolved
 * (no such export, or React types missing so forwardRef is `any`).
 */
export function resolveProps(root: string, file: string, exportName: string): Map<string, ResolvedProp> | null {
  const program = ts.createProgram([file], compilerOptions(root));
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(file);
  const mod = sf && checker.getSymbolAtLocation(sf);
  if (!sf || !mod) return null;
  const exp = checker.getExportsOfModule(mod).find((s) => s.name === exportName);
  if (!exp) return null;
  const sym = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
  const type = checker.getTypeOfSymbolAtLocation(sym, sf);
  if (type.flags & ts.TypeFlags.Any) return null;
  const sig = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  const param = sig?.getParameters()[0];
  if (!param) return null;
  const props = checker.getTypeOfSymbolAtLocation(param, sf);
  if (props.flags & ts.TypeFlags.Any) return null;
  const out = new Map<string, ResolvedProp>();
  for (const p of checker.getPropertiesOfType(props)) {
    if (p.name === 'key' || p.name === 'ref') continue;
    const decl = p.declarations?.[0];
    const t = checker.typeToString(checker.getTypeOfSymbolAtLocation(p, sf), undefined, ts.TypeFormatFlags.NoTruncation);
    out.set(p.name, {
      optional: !!(p.flags & ts.SymbolFlags.Optional),
      typeText: t.replace(/\s*\|\s*(undefined|null)\b/g, '').replace(/^(undefined|null)\s*\|\s*/, ''), // optionality is the flag, not the type
      library: decl ? libraryOf(decl.getSourceFile().fileName) : undefined,
    });
  }
  return out;
}

/** node_modules/@mui/material/Button/Button.d.ts → @mui/material; node_modules/@types/react → react */
function libraryOf(fileName: string): string | undefined {
  const parts = fileName.split(/[\\/]/);
  const i = parts.lastIndexOf('node_modules');
  if (i < 0) return undefined;
  const pkg = parts[i + 1]?.startsWith('@') ? `${parts[i + 1]}/${parts[i + 2]}` : parts[i + 1];
  return pkg?.replace(/^@types\//, '');
}

/** The project's tsconfig when there is one (paths, jsx), else sensible defaults for a React app. */
function compilerOptions(root: string): ts.CompilerOptions {
  const defaults: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, noEmit: true, allowJs: true };
  const cfg = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
  if (!cfg || !cfg.startsWith(root + sep) && dirname(cfg) !== root) return defaults;
  const read = ts.readConfigFile(cfg, ts.sys.readFile);
  if (read.error) return defaults;
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(cfg));
  return { ...defaults, ...parsed.options, noEmit: true };
}

