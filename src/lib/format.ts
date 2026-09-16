function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function getShortDate(date: string) {
  const parsedDate = parseLocalDate(date);
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}`;
}

export function formatForecastDayLabel(date: string, position: number, timezone = 'UTC') {
  if (position === 0) {
    return 'Hoje';
  }

  if (position === 1) {
    return 'Amanhã';
  }

  const shortWeekday = new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, weekday: 'short' })
    .format(new Date(`${date}T12:00:00Z`))
    .replace('.', '');

  return shortWeekday.charAt(0).toUpperCase() + shortWeekday.slice(1);
}
