import { useId, useState } from 'react';
import { tokens, sp } from './tokens';

export interface DateRangePickerProps {
  label: string;
  start: string;
  end: string;
  min?: string;
  max?: string;
  disabledDates?: string[];
  minNights?: number;
  maxNights?: number;
  summary?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: { start: string; end: string }) => void;
}

const DAY = 86400000;

function parseIso(s?: string | null): number | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toIso(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function formatIso(iso: string): string {
  const ms = parseIso(iso);
  if (ms == null) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(ms);
}

/** Pure range-validity check, mirroring the Flutter contract's `isAllowed`: shared by the widget and tests. */
export function isRangeAllowed(startIso: string, endIso: string, opts: { disabledDates?: string[]; minNights?: number; maxNights?: number } = {}): boolean {
  const s = parseIso(startIso);
  const e = parseIso(endIso);
  if (s == null || e == null) return false;
  const nights = Math.round((e - s) / DAY);
  if (nights < 1) return false;
  if (opts.minNights != null && nights < opts.minNights) return false;
  if (opts.maxNights != null && nights > opts.maxNights) return false;
  const blocked = new Set((opts.disabledDates ?? []).map((d) => parseIso(d)).filter((v): v is number => v != null));
  for (let d = s; d < e; d += DAY) if (blocked.has(d)) return false;
  return true;
}

function monthGrid(y: number, m: number): (number | null)[][] {
  const first = Date.UTC(y, m, 1);
  const firstWeekday = (new Date(first).getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(Date.UTC(y, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function DateRangePicker({ label, start, end, min, max, disabledDates = [], minNights, maxNights, summary, placeholder, hint, error, disabled = false, onChange }: DateRangePickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const msgId = `${id}-msg`;
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<string | null>(null);
  // The visible month pair is independent of the pick in progress, so picking a start in the
  // right-hand month never shifts the grid, and the field stays browsable to any month.
  const [view, setView] = useState<{ y: number; m: number } | null>(null);

  const minMs = parseIso(min);
  const maxMs = parseIso(max);
  const blocked = new Set(disabledDates.map((d) => parseIso(d)).filter((v): v is number => v != null));

  const baseMonthMs = view
    ? Date.UTC(view.y, view.m, 1)
    : parseIso(start) ?? Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1);
  const baseDate = new Date(baseMonthMs);
  const y0 = baseDate.getUTCFullYear();
  const m0 = baseDate.getUTCMonth();
  const next = m0 === 11 ? { y: y0 + 1, m: 0 } : { y: y0, m: m0 + 1 };
  const prevMonth = m0 === 0 ? { y: y0 - 1, m: 11 } : { y: y0, m: m0 - 1 };

  const text = start ? `${formatIso(start)}${end ? ` – ${formatIso(end)}` : ' – '}` : '';

  function openPicker() {
    if (disabled) return;
    // The first pick always sets a fresh start; re-opening does not resume an in-progress pick.
    setDraftStart(null);
    setView(null);
    setOpen(true);
  }

  function goToMonth(y: number, m: number) {
    setView({ y, m });
  }

  function pick(ms: number) {
    const iso = toIso(ms);
    if (!draftStart) { setDraftStart(iso); return; }
    const s = parseIso(draftStart)!;
    if (ms <= s) { setDraftStart(iso); return; } // a pick before/at the start restarts from that date
    if (!isRangeAllowed(draftStart, iso, { disabledDates, minNights, maxNights })) return;
    onChange?.({ start: draftStart, end: iso });
    setDraftStart(null);
    setOpen(false);
  }

  function dayDisabled(ms: number): boolean {
    if (minMs != null && ms < minMs) return true;
    if (maxMs != null && ms > maxMs) return true;
    if (blocked.has(ms)) return true;
    if (draftStart) {
      const s = parseIso(draftStart)!;
      if (ms > s && !isRangeAllowed(draftStart, toIso(ms), { disabledDates, minNights, maxNights })) return true;
    }
    return false;
  }

  function renderMonth(y: number, m: number) {
    const rows = monthGrid(y, m);
    const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m, 1));
    return (
      <div key={`${y}-${m}`} style={{ minWidth: 220 }}>
        <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: sp(2) }}>{monthLabel}</div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((ms, ci) => {
                  if (ms == null) return <td key={ci} />;
                  const iso = toIso(ms);
                  const isStart = (draftStart ?? start) === iso;
                  const isEnd = !draftStart && end === iso;
                  const dis = dayDisabled(ms);
                  return (
                    <td key={ci} style={{ padding: 2 }}>
                      <button
                        type="button"
                        disabled={dis}
                        aria-label={iso}
                        aria-pressed={isStart || isEnd}
                        onClick={() => pick(ms)}
                        style={{ width: 32, height: 32, border: 'none', borderRadius: tokens.radius.sm, background: isStart || isEnd ? tokens.color.primary : 'transparent', color: isStart || isEnd ? '#fff' : dis ? tokens.color.muted : tokens.color.text, cursor: dis ? 'not-allowed' : 'pointer' }}
                      >
                        {new Date(ms).getUTCDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const helper = error ?? summary ?? hint;

  return (
    <div style={{ display: 'grid', gap: sp(1), position: 'relative' }}>
      <label id={labelId} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={text ? `${labelId} ${id}-value` : labelId}
        aria-invalid={!!error || undefined}
        aria-describedby={helper ? msgId : undefined}
        style={{ width: '100%', boxSizing: 'border-box', height: 40, textAlign: 'left', borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${sp(3)}`, font: 'inherit', background: tokens.color.surface, color: tokens.color.text, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <span id={`${id}-value`}>{text || placeholder || ''}</span>
      </button>
      {open && (
        // Two months side by side on wide screens, one on narrow: a wrapping flex row does this without matchMedia.
        <div role="dialog" aria-label={label} style={{ position: 'absolute', top: '100%', zIndex: 10, marginTop: sp(1), display: 'grid', gap: sp(2), background: tokens.color.surface, border: `1px solid ${tokens.color.muted}`, borderRadius: tokens.radius.md, padding: sp(3) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" aria-label="Previous month" onClick={() => goToMonth(prevMonth.y, prevMonth.m)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.color.text }}>‹</button>
            <button type="button" aria-label="Next month" onClick={() => goToMonth(next.y, next.m)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.color.text }}>›</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(4) }}>
            {renderMonth(y0, m0)}
            {renderMonth(next.y, next.m)}
          </div>
        </div>
      )}
      {helper && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{helper}</div>}
    </div>
  );
}
