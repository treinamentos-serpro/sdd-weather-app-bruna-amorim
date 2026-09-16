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

export function formatForecastDayLabel(date: string, position: number, _timezone = 'UTC') {
  if (position === 0) {
    return 'Hoje';
  }

  if (position === 1) {
    return 'Amanhã';
  }

  const [year, month, day] = date.split('-').map(Number);
  const shortWeekday = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'short' })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .replace('.', '');

  return shortWeekday.charAt(0).toUpperCase() + shortWeekday.slice(1);
}
