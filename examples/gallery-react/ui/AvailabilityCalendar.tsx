import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { tokens, sp, alpha } from './tokens';
import { Icon } from './Icon';

export interface AvailabilityCalendarProps {
  month: string;
  days: { date: string; status: 'available' | 'limited' | 'booked' | 'closed'; priceLabel?: string }[];
  selectedStart?: string;
  selectedEnd?: string;
  min?: string;
  max?: string;
  weekStart?: 'monday' | 'sunday';
  legend?: { available: string; limited: string; booked: string; closed: string };
  onDayPress?: (value: string) => void;
  onMonthChange?: (value: string) => void;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
function isoOf(y: number, m: number, day: number) { return `${y}-${pad2(m)}-${pad2(day)}`; }
function ymString(y: number, m: number) { return `${y}-${pad2(m)}`; }
// Uses local-time Date components only (never toISOString/UTC), so this is immune to timezone shifts.
function shiftYm(y: number, m: number, delta: number) {
  const d = new Date(y, m - 1 + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}
function weekdayLabels(weekStart: 'monday' | 'sunday'): string[] {
  const startIdx = weekStart === 'monday' ? 1 : 0; // 0 = Sunday
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
  const sunday = new Date(2023, 0, 1); // a known Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + ((startIdx + i) % 7));
    return fmt.format(d);
  });
}

export function AvailabilityCalendar({
  month, days, selectedStart, selectedEnd, min, max, weekStart = 'monday', legend, onDayPress, onMonthChange,
}: AvailabilityCalendarProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const startIdx = weekStart === 'monday' ? 1 : 0;
  const offset = (firstWeekday - startIdx + 7) % 7;
  const byDate = new Map(days.map((d) => [d.date, d]));
  const now = new Date();
  const today = isoOf(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const prev = shiftYm(y, m, -1);
  const next = shiftYm(y, m, 1);
  const canPrev = !min || ymString(prev.y, prev.m) >= min;
  const canNext = !max || ymString(next.y, next.m) <= max;
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
  const names = weekdayLabels(weekStart);

  const inRange = (iso: string) => {
    if (!selectedStart) return false;
    const end = selectedEnd ?? selectedStart;
    return iso >= selectedStart && iso <= end;
  };

  const focusDay = (day: number) => {
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    el?.focus();
  };
  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const dayAttr = target.dataset?.day;
    if (!dayAttr) return;
    const day = Number(dayAttr);
    const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -7 : e.key === 'ArrowDown' ? 7 : 0;
    if (!delta) return;
    const nextDay = day + delta;
    if (nextDay < 1 || nextDay > daysInMonth) return;
    e.preventDefault();
    focusDay(nextDay);
  };

  const cells: ReactNode[] = [];
  for (let i = 0; i < offset; i++) cells.push(<div key={`b${i}`} role="gridcell" aria-hidden />);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = isoOf(y, m, day);
    const info = byDate.get(iso);
    const status = info?.status ?? 'available';
    const pressable = status === 'available' || status === 'limited';
    const isEnd = iso === selectedStart || iso === selectedEnd;
    const selected = isEnd || inRange(iso);
    const isToday = iso === today;
    const date = new Date(y, m - 1, day);
    const fullDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    const label = `${fullDate}, ${status}${info?.priceLabel ? `, ${info.priceLabel}` : ''}`;
    const dayColor = isEnd ? tokens.color.surface : status === 'closed' ? tokens.color.muted : tokens.color.text;

    const inner = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontWeight: isEnd ? 700 : 500, color: dayColor, textDecoration: status === 'booked' ? 'line-through' : undefined, opacity: status === 'closed' ? 0.5 : 1 }}>
          {day}
        </span>
        {info?.priceLabel && <span style={{ fontSize: 10, color: isEnd ? tokens.color.surface : tokens.color.muted }}>{info.priceLabel}</span>}
        {status === 'limited' && <span aria-hidden style={{ width: 4, height: 4, borderRadius: '50%', background: isEnd ? tokens.color.surface : tokens.color.primary }} />}
      </div>
    );
    const cellStyle = {
      width: '100%', boxSizing: 'border-box' as const, padding: sp(1), borderRadius: tokens.radius.sm,
      background: isEnd ? tokens.color.primary : selected ? alpha(tokens.color.primary, 0.12) : 'transparent',
      border: isToday ? `1px solid ${tokens.color.primary}` : '1px solid transparent',
    };

    cells.push(
      <div key={iso} role="gridcell">
        {pressable ? (
          <button
            type="button"
            data-day={day}
            aria-label={label}
            aria-selected={selected || undefined}
            onClick={() => onDayPress?.(iso)}
            style={{ ...cellStyle, display: 'block', border: cellStyle.border, cursor: 'pointer', font: 'inherit' }}
          >
            {inner}
          </button>
        ) : (
          // booked and closed days are not pressable and never emit dayPress.
          <div data-day={day} tabIndex={-1} aria-label={label} aria-disabled="true" style={{ ...cellStyle, display: 'block' }}>
            {inner}
          </div>
        )}
      </div>,
    );
  }
  while (cells.length % 7 !== 0) cells.push(<div key={`p${cells.length}`} role="gridcell" aria-hidden />);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp(2) }}>
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canPrev}
          onClick={() => onMonthChange?.(ymString(prev.y, prev.m))}
          style={{ background: 'none', border: 0, cursor: canPrev ? 'pointer' : 'not-allowed', opacity: canPrev ? 1 : 0.4 }}
        >
          <Icon name="chevron-left" />
        </button>
        <span style={{ fontWeight: 700, color: tokens.color.text }}>{monthLabel}</span>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canNext}
          onClick={() => onMonthChange?.(ymString(next.y, next.m))}
          style={{ background: 'none', border: 0, cursor: canNext ? 'pointer' : 'not-allowed', opacity: canNext ? 1 : 0.4 }}
        >
          <Icon name="chevron-right" />
        </button>
      </div>
      <div
        ref={gridRef}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={onGridKeyDown}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
      >
        <div role="row" style={{ display: 'contents' }}>
          {names.map((n, i) => (
            <div key={i} role="columnheader" style={{ textAlign: 'center', fontSize: 12, color: tokens.color.muted }}>{n}</div>
          ))}
        </div>
        {rows.map((week, ri) => (
          <div key={ri} role="row" style={{ display: 'contents' }}>
            {week}
          </div>
        ))}
      </div>
      {legend && (
        <div style={{ display: 'flex', gap: sp(4), flexWrap: 'wrap', marginTop: sp(3) }}>
          <LegendItem label={legend.available} />
          <LegendItem label={legend.limited} dot />
          <LegendItem label={legend.booked} strike />
          <LegendItem label={legend.closed} muted />
        </div>
      )}
    </div>
  );
}

function LegendItem({ label, dot, strike, muted }: { label: string; dot?: boolean; strike?: boolean; muted?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: sp(1), fontSize: 12, color: tokens.color.muted }}>
      <span
        aria-hidden
        style={{
          width: 16, height: 16, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.muted}`,
          display: 'grid', placeItems: 'center', background: muted ? alpha(tokens.color.muted, 0.15) : undefined,
        }}
      >
        {dot && <span style={{ width: 4, height: 4, borderRadius: '50%', background: tokens.color.primary }} />}
        {strike && <span style={{ fontSize: 12 }}>-</span>}
      </span>
      {label}
    </span>
  );
}
