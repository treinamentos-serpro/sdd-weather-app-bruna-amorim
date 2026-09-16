export type Unit = 'celsius' | 'fahrenheit';

export type TemperatureUnit = Unit;

export interface City {
  id?: string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  time?: string;
  temperatureC: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  pressure?: number;
  weatherCode: number;
}

export interface ForecastDay {
  date: string;
  temperatureMinC: number;
  temperatureMaxC: number;
  weatherCode: number;
  precipitationProbability?: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
  unit: Unit;
}
