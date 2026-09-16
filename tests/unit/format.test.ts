import { formatForecastDayLabel, getShortDate } from '../../src/lib/format';

describe('format utility', () => {
  it('labels the first and second forecast days as Hoje and Amanhã', () => {
    expect(formatForecastDayLabel('2026-09-16', 0)).toBe('Hoje');
    expect(formatForecastDayLabel('2026-09-17', 1)).toBe('Amanhã');
  });

  it('returns the weekday label for later forecast days', () => {
    expect(formatForecastDayLabel('2026-09-18', 2)).toBe('Sex');
    expect(formatForecastDayLabel('2026-09-19', 3)).toBe('Sáb');
  });

  it('keeps the weekday tied to the local civil date in extreme timezones', () => {
    expect(formatForecastDayLabel('2026-09-18', 2, 'Pacific/Kiritimati')).toBe('Sex');
  });

  it('formats the short date string as dd/mm', () => {
    expect(getShortDate('2026-09-16')).toBe('16/09');
    expect(getShortDate('2027-01-02')).toBe('02/01');
  });
});
