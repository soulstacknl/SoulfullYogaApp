const WEEKDAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const MONTHS = [
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

export function todayWeekdayName(date = new Date()): string {
  return WEEKDAYS[date.getDay()];
}

export function todayDutchLabel(date = new Date()): string {
  return `${todayWeekdayName(date)} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

const WEEKDAY_OFFSET_FROM_MONDAY: Record<string, number> = {
  Maandag: 0,
  Dinsdag: 1,
  Woensdag: 2,
  Donderdag: 3,
  Vrijdag: 4,
  Zaterdag: 5,
  Zondag: 6,
};

function mondayOfWeek(referenceDate: Date): Date {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Date of a given weekday name, `weekOffset` weeks from the current week
// (0 = this week, 1 = next week, ...), anchored to the real current date.
export function dateForWeekday(dayName: string, weekOffset: number, referenceDate = new Date()): Date {
  const monday = mondayOfWeek(referenceDate);
  const offset = WEEKDAY_OFFSET_FROM_MONDAY[dayName] ?? 0;
  const result = new Date(monday);
  result.setDate(monday.getDate() + offset + weekOffset * 7);
  return result;
}

export function formatDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${date.getFullYear()}`;
}
