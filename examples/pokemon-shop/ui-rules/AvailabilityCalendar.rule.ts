import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'AvailabilityCalendar', category: 'data',
  purpose: 'A month grid showing which days are available, limited, booked or closed, with an optional price per day. Pressing a day lets the screen start a booking.',
  props: {
    month: t.string().desc('visible month, "YYYY-MM"'),
    days: t.array(t.object({
      date: t.string().desc('ISO date'),
      status: t.enum(['available', 'limited', 'booked', 'closed']),
      priceLabel: t.string().opt().desc('pre-formatted, e.g. "$120"'),
    })).desc('days not listed are shown as available without a price'),
    selectedStart: t.string().opt().desc('ISO date, start of the highlighted range'),
    selectedEnd: t.string().opt().desc('ISO date, end of the highlighted range'),
    min: t.string().opt().desc('earliest month that can be shown, "YYYY-MM"'),
    max: t.string().opt().desc('latest month that can be shown, "YYYY-MM"'),
    weekStart: t.enum(['monday', 'sunday']).def('monday'),
    legend: t.object({ available: t.text(), limited: t.text(), booked: t.text(), closed: t.text() }).opt().desc('when given, a legend with these labels is shown under the grid'),
  },
  events: { dayPress: t.string().desc('ISO date of a pressed available or limited day'), monthChange: t.string().desc('requested month, "YYYY-MM"') },
  states: ['default', 'loading'],
  rules: [
    'Seven columns starting at weekStart, weekday names from the platform locale; days of other months are blank.',
    'booked and closed days are not pressable and never emit dayPress; booked is struck through, closed is dimmed, limited has a small dot — status is never shown by color alone.',
    'priceLabel is shown under the day number in tokens.color.muted; the component never formats prices.',
    'Today is outlined; the selected range is filled with a tokens.color.primary tint, its ends solid.',
    'Previous / next month controls emit monthChange and are disabled outside min / max.',
  ],
  a11y: ['A grid; each day is named with its full date, status and price ("Monday 12 October, available, $120").', 'Arrow keys move between days.'],
  composition: { canContain: [] },
  platform: { react: ['role="grid" of buttons; aria-disabled for booked and closed'], flutter: ['a custom grid (GridView with 7 columns or rows of Expanded cells) with Semantics per day'] },
  examples: [{ month: '2026-10', days: [{ date: '2026-10-12', status: 'available', priceLabel: '$120' }, { date: '2026-10-13', status: 'booked' }], legend: { available: 'Available', limited: 'Few left', booked: 'Booked', closed: 'Closed' } }],
});
