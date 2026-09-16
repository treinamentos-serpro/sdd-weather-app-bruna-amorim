import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 'sao-paulo-br',
    name: 'Sao Paulo',
    country: 'Brasil',
    admin1: 'Sao Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    time: '2026-09-16T12:00',
    temperatureC: 24,
    humidity: 68,
    windSpeed: 14,
    precipitation: 0,
    pressure: 1016,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinC: 18,
      temperatureMaxC: 26,
      weatherCode: 2,
      precipitationProbability: 20,
    },
    {
      date: '2026-09-17',
      temperatureMinC: 17,
      temperatureMaxC: 25,
      weatherCode: 3,
      precipitationProbability: 35,
    },
    {
      date: '2026-09-18',
      temperatureMinC: 16,
      temperatureMaxC: 23,
      weatherCode: 61,
      precipitationProbability: 80,
    },
    {
      date: '2026-09-19',
      temperatureMinC: 15,
      temperatureMaxC: 22,
      weatherCode: 80,
      precipitationProbability: 70,
    },
    {
      date: '2026-09-20',
      temperatureMinC: 17,
      temperatureMaxC: 27,
      weatherCode: 1,
      precipitationProbability: 10,
    },
  ],
  unit: 'celsius',
};
