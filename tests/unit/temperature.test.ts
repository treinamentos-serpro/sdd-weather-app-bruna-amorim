import {
  convertTemperature,
  formatTemperature,
  toFahrenheit,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature utilities', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %s°C to %s°F', (celsius, expectedFahrenheit) => {
    expect(toFahrenheit(celsius)).toBe(expectedFahrenheit);
  });

  it('converts temperatures according to the selected unit', () => {
    expect(convertTemperature(0, 'celsius')).toBe(0);
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'celsius')).toBe(-40);
  });

  it('formats temperatures with rounding and the correct unit symbol', () => {
    expect(formatTemperature(0.4, 'celsius')).toBe('0°C');
    expect(formatTemperature(0.6, 'celsius')).toBe('1°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
    expect(formatTemperature(10.4, 'fahrenheit')).toBe('51°F');
  });

  it('returns the correct unit label', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
