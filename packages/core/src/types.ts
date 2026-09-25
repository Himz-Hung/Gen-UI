// The `t` type system. Every prop, event, param and domain field is described
// with these nodes so that docs, catalog, check and verify read one source.

export type TypeKind = 'string' | 'number' | 'boolean' | 'enum' | 'ref' | 'array' | 'object' | 'void' | 'node';

export interface TypeNode {
  kind: TypeKind;
  /** enum values */
  values?: string[];
  /** ref target: a domain type name */
  ref?: string;
  /** array item */
  of?: TypeNode;
  /** object fields */
  fields?: Record<string, TypeNode>;
  optional?: boolean;
  default?: unknown;
  description?: string;
}

class Builder implements TypeNode {
  kind: TypeKind;
  values?: string[];
  ref?: string;
  of?: TypeNode;
  fields?: Record<string, TypeNode>;
  optional?: boolean;
  default?: unknown;
  description?: string;

  constructor(node: TypeNode) {
    this.kind = node.kind;
    Object.assign(this, node);
  }
  /** Prop may be omitted. */
  opt(): Builder { return new Builder({ ...this, optional: true }); }
  /** Prop may be omitted; this value is used when it is. */
  def(value: unknown): Builder { return new Builder({ ...this, optional: true, default: value }); }
  /** Human description, shown to the agent. */
  desc(text: string): Builder { return new Builder({ ...this, description: text }); }
}

export const t = {
  string: () => new Builder({ kind: 'string' }),
  number: () => new Builder({ kind: 'number' }),
  boolean: () => new Builder({ kind: 'boolean' }),
  enum: (values: readonly string[]) => new Builder({ kind: 'enum', values: [...values] }),
  /** Reference to a domain type declared with defineDomain, e.g. t.ref('Card'). */
  ref: (name: string) => new Builder({ kind: 'ref', ref: name }),
  array: (of: TypeNode) => new Builder({ kind: 'array', of: plain(of) }),
  object: (fields: Record<string, TypeNode>) =>
    new Builder({ kind: 'object', fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, plain(v)])) }),
  /** Event with no payload. */
  void: () => new Builder({ kind: 'void' }),
  /** Slot content: child elements. */
  node: () => new Builder({ kind: 'node' }),
};

/** Strip the Builder prototype so contracts serialize to plain JSON. */
export function plain(node: TypeNode): TypeNode {
  const out: TypeNode = { kind: node.kind };
  if (node.values) out.values = [...node.values];
  if (node.ref) out.ref = node.ref;
  if (node.of) out.of = plain(node.of);
  if (node.fields) out.fields = Object.fromEntries(Object.entries(node.fields).map(([k, v]) => [k, plain(v)]));
  if (node.optional) out.optional = true;
  if (node.default !== undefined) out.default = node.default;
  if (node.description) out.description = node.description;
  return out;
}

/** Render a type as short text: string, 'a' | 'b', Card[], { x: number } */
export function typeText(node: TypeNode): string {
  switch (node.kind) {
    case 'string': case 'number': case 'boolean': case 'void': case 'node': return node.kind;
    case 'enum': return (node.values ?? []).map((v) => `'${v}'`).join(' | ');
    case 'ref': return node.ref ?? 'unknown';
    case 'array': return `${typeText(node.of!)}[]`;
    case 'object': return `{ ${Object.entries(node.fields ?? {}).map(([k, v]) => `${k}${v.optional ? '?' : ''}: ${typeText(v)}`).join('; ')} }`;
  }
}

/** Parse a data type string used in screen specs: "Card", "Card[]", "string", "number[]" */
export function parseTypeString(s: string): TypeNode {
  const trimmed = s.trim();
  if (trimmed.endsWith('[]')) return { kind: 'array', of: parseTypeString(trimmed.slice(0, -2)) };
  if (trimmed === 'string' || trimmed === 'number' || trimmed === 'boolean') return { kind: trimmed };
  return { kind: 'ref', ref: trimmed };
}

/** Structural equality of two types, ignoring optional/default/description. */
export function sameType(a: TypeNode, b: TypeNode): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'enum': return JSON.stringify([...(a.values ?? [])].sort()) === JSON.stringify([...(b.values ?? [])].sort());
    case 'ref': return a.ref === b.ref;
    case 'array': return sameType(a.of!, b.of!);
    case 'object': {
      const ak = Object.keys(a.fields ?? {}).sort(), bk = Object.keys(b.fields ?? {}).sort();
      if (ak.join() !== bk.join()) return false;
      return ak.every((k) => sameType(a.fields![k], b.fields![k]));
    }
    default: return true;
  }
}

/** Does a literal JSON value fit this type? Returns an error string or null. */
export function checkLiteral(value: unknown, node: TypeNode): string | null {
  switch (node.kind) {
    case 'string': return typeof value === 'string' ? null : `expected string, got ${describe(value)}`;
    case 'number': return typeof value === 'number' ? null : `expected number, got ${describe(value)}`;
    case 'boolean': return typeof value === 'boolean' ? null : `expected boolean, got ${describe(value)}`;
    case 'enum': return typeof value === 'string' && node.values!.includes(value)
      ? null : `expected one of ${typeText(node)}, got ${describe(value)}`;
    case 'array': {
      if (!Array.isArray(value)) return `expected ${typeText(node)}, got ${describe(value)}`;
      for (let i = 0; i < value.length; i++) { const e = checkLiteral(value[i], node.of!); if (e) return `[${i}] ${e}`; }
      return null;
    }
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return `expected object, got ${describe(value)}`;
      const v = value as Record<string, unknown>;
      for (const [k, f] of Object.entries(node.fields!)) {
        if (v[k] === undefined) { if (!f.optional) return `missing field "${k}"`; continue; }
        const e = checkLiteral(v[k], f); if (e) return `.${k} ${e}`;
      }
      for (const k of Object.keys(v)) if (!node.fields![k]) return `unknown field "${k}"`;
      return null;
    }
    case 'ref': return `type ${node.ref} must be bound with { "path": "/..." }, not written inline`;
    case 'void': return 'void has no value';
    case 'node': return 'slot content must be given as children ids, not as a prop value';
  }
}

function describe(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'string') return `"${v}"`;
  return typeof v === 'object' ? 'object' : String(v);
}
