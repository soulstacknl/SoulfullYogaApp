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
