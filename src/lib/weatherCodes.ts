interface WeatherCodeInfo {
  label: string;
  icon: string;
}

const weatherCodes: Record<number, WeatherCodeInfo> = {
  0: { label: 'Céu limpo', icon: '☀' },
  1: { label: 'Principalmente limpo', icon: '◐' },
  2: { label: 'Parcialmente nublado', icon: '◑' },
  3: { label: 'Nublado', icon: '☁' },
  45: { label: 'Neblina', icon: '≋' },
  48: { label: 'Neblina com geada', icon: '≋' },
  51: { label: 'Garoa fraca', icon: '☂' },
  53: { label: 'Garoa moderada', icon: '☂' },
  55: { label: 'Garoa intensa', icon: '☂' },
  61: { label: 'Chuva fraca', icon: '☂' },
  63: { label: 'Chuva moderada', icon: '☂' },
  65: { label: 'Chuva forte', icon: '☂' },
  80: { label: 'Pancadas fracas', icon: '☂' },
  81: { label: 'Pancadas moderadas', icon: '☂' },
  82: { label: 'Pancadas fortes', icon: '☂' },
  95: { label: 'Tempestade', icon: '⚡' },
};

const fallbackWeatherCode: WeatherCodeInfo = {
  label: 'Condição indisponível',
  icon: '○',
};

export function getWeatherCodeInfo(weatherCode: number | null | undefined) {
  if (typeof weatherCode !== 'number' || !Number.isFinite(weatherCode)) {
    return fallbackWeatherCode;
  }

  return weatherCodes[weatherCode] ?? fallbackWeatherCode;
}
