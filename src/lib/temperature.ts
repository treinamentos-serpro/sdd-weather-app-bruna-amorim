import type { Unit } from '../types/weather';

export function toFahrenheit(celsius: number) {
  return Math.round((celsius * 9) / 5 + 32);
}

export function convertTemperature(value: number, unit: Unit) {
  if (unit === 'fahrenheit') {
    return toFahrenheit(value);
  }

  return Math.round(value);
}

export function unitLabel(unit: Unit) {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(celsius: number | null | undefined, unit: Unit) {
  if (typeof celsius !== 'number' || !Number.isFinite(celsius)) {
    return '—';
  }

  const converted = convertTemperature(celsius, unit);

  return `${converted}${unitLabel(unit)}`;
}
