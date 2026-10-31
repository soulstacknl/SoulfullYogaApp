export const WEEKDAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
export const MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Lessons hang off a calendar day, so dates are ISO strings (YYYY-MM-DD) in
// local time — never via toISOString(), which would shift them to UTC.
export function isoOf(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

// `time` uses the schedule's display format, e.g. "19.00".
export function toDate(iso: string, time = '00.00'): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const [h, min] = time.split('.').map(Number);
  return new Date(y, m - 1, d, h, min);
}

export function plusDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toDate(toIso).getTime() - toDate(fromIso).getTime()) / 86400000);
}

export function weekdayOf(iso: string): string {
  return WEEKDAYS[toDate(iso).getDay()];
}

// "Maandag 2 november"
export function dateLabel(iso: string): string {
  const d = toDate(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// "ma 2 nov"
export function shortDate(iso: string): string {
  const d = toDate(iso);
  return `${WEEKDAYS[d.getDay()].slice(0, 2).toLowerCase()} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

// First day of the month `offset` months from `reference` (0 = this month).
export function monthStart(offset: number, reference = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth() + offset, 1);
}
