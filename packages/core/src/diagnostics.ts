export interface Diagnostic {
  level: 'error' | 'warning';
  where: string;   // e.g. elements.kpi.props.totals
  message: string;
}

export class Report {
  items: Diagnostic[] = [];
  constructor(public file: string) {}
  error(where: string, message: string) { this.items.push({ level: 'error', where, message }); }
  warn(where: string, message: string) { this.items.push({ level: 'warning', where, message }); }
  get errors() { return this.items.filter((d) => d.level === 'error'); }
  get ok() { return this.errors.length === 0; }
  print(): void {
    for (const d of this.items) {
      const tag = d.level === 'error' ? 'error' : 'warn ';
      console.log(`${tag}  ${this.file}  ${d.where}\n       ${d.message}`);
    }
    const e = this.errors.length, w = this.items.length - e;
    console.log(`${this.ok ? 'PASS' : 'FAIL'}  ${this.file}  (${e} error${e === 1 ? '' : 's'}, ${w} warning${w === 1 ? '' : 's'})`);
  }
}
