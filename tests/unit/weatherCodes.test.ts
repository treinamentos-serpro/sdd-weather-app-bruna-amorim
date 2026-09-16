import { getWeatherCodeInfo } from '../../src/lib/weatherCodes';

describe('weatherCodes utility', () => {
  it('returns the mapped label and icon for a known code', () => {
    expect(getWeatherCodeInfo(0)).toEqual({ label: 'Céu limpo', icon: '☀' });
    expect(getWeatherCodeInfo(95)).toEqual({ label: 'Tempestade', icon: '⚡' });
  });

  it('returns the fallback info for an unknown code', () => {
    expect(getWeatherCodeInfo(999)).toEqual({
      label: 'Condição indisponível',
      icon: '○',
    });
  });
});
