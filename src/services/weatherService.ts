import type { City, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_QUERY_LENGTH = 100;
const FORECAST_DAYS = 5;
const DEFAULT_TIMEZONE = 'UTC';
const TIMEOUT_ERROR_MESSAGE = 'A conexão demorou mais de 10 segundos. Tente novamente.';
const NETWORK_ERROR_MESSAGE = 'Não foi possível carregar os dados. Tente novamente.';
const CITY_REQUEST_ERROR_MESSAGE = 'Não foi possível carregar os dados. Tente novamente.';
const WEATHER_REQUEST_ERROR_MESSAGE = 'Não foi possível carregar os dados. Tente novamente.';
const INCOMPLETE_WEATHER_ERROR_MESSAGE = 'Dados meteorológicos incompletos. Tente novamente.';
const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'precipitation',
  'pressure_msl',
  'weather_code',
];
const DAILY_FIELDS = ['weather_code', 'temperature_2m_max', 'temperature_2m_min'];

interface OpenMeteoGeocodingResult {
  id?: number;
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface OpenMeteoCurrentWeather {
  time?: string | null;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  pressure_msl?: number | null;
  weather_code?: number | null;
}

interface OpenMeteoDailyForecast {
  time?: Array<string | null> | null;
  weather_code?: Array<number | null> | null;
  temperature_2m_max?: Array<number | null> | null;
  temperature_2m_min?: Array<number | null> | null;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError(TIMEOUT_ERROR_MESSAGE);
    }

    throw new WeatherServiceError(NETWORK_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0 || trimmedName.length > MAX_QUERY_LENGTH) {
    return [];
  }

  const response = await fetchWithTimeout(
    `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError(CITY_REQUEST_ERROR_MESSAGE);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError(CITY_REQUEST_ERROR_MESSAGE);
  }

  if (!isRecord(data)) {
    throw new WeatherServiceError(CITY_REQUEST_ERROR_MESSAGE);
  }

  const results = data.results;

  if (results !== undefined && results !== null && !Array.isArray(results)) {
    throw new WeatherServiceError(CITY_REQUEST_ERROR_MESSAGE);
  }

  return (results ?? [])
    .slice(0, 10)
    .filter(isValidGeocodingResult)
    .map((result) => ({
      id: toOptionalId(result.id),
      name: result.name,
      country: toOptionalString(result.country),
      admin1: toOptionalString(result.admin1),
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: normalizeTimezone(result.timezone),
    }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  if (!isValidCity(city)) {
    throw new WeatherServiceError(WEATHER_REQUEST_ERROR_MESSAGE);
  }

  const url = new URL(FORECAST_API_URL);
  url.searchParams.set('latitude', city.latitude.toString());
  url.searchParams.set('longitude', city.longitude.toString());
  url.searchParams.set('current', CURRENT_FIELDS.join(','));
  url.searchParams.set('daily', DAILY_FIELDS.join(','));
  url.searchParams.set('forecast_days', FORECAST_DAYS.toString());
  url.searchParams.set('timezone', 'auto');

  const response = await fetchWithTimeout(url.toString());

  if (!response.ok) {
    throw new WeatherServiceError(WEATHER_REQUEST_ERROR_MESSAGE);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError(WEATHER_REQUEST_ERROR_MESSAGE);
  }

  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError(INCOMPLETE_WEATHER_ERROR_MESSAGE);
  }

  return {
    city,
    current: mapCurrentWeather(data.current as OpenMeteoCurrentWeather),
    forecast: mapForecastDays(data.daily as OpenMeteoDailyForecast),
    unit: 'celsius',
  };
}

function mapCurrentWeather(current: OpenMeteoCurrentWeather): WeatherData['current'] {
  if (!isFiniteNumber(current.temperature_2m) || !isFiniteNumber(current.weather_code)) {
    throw new WeatherServiceError(INCOMPLETE_WEATHER_ERROR_MESSAGE);
  }

  return {
    ...(isNonEmptyString(current.time) ? { time: current.time } : {}),
    temperatureC: current.temperature_2m,
    humidity: toOptionalNumber(current.relative_humidity_2m),
    windSpeed: toOptionalNumber(current.wind_speed_10m),
    precipitation: toOptionalNumber(current.precipitation) ?? 0,
    pressure: toOptionalNumber(current.pressure_msl),
    weatherCode: current.weather_code,
  };
}

function mapForecastDays(
  daily: OpenMeteoDailyForecast,
): [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay] {
  if (
    !hasFiveItems(daily.time) ||
    !hasFiveItems(daily.weather_code) ||
    !hasFiveItems(daily.temperature_2m_max) ||
    !hasFiveItems(daily.temperature_2m_min)
  ) {
    throw new WeatherServiceError(INCOMPLETE_WEATHER_ERROR_MESSAGE);
  }

  const forecast = daily.time.map((date, index) => ({
    date,
    temperatureMinC: daily.temperature_2m_min?.[index],
    temperatureMaxC: daily.temperature_2m_max?.[index],
    weatherCode: daily.weather_code?.[index],
  }));

  if (!isFiveDayForecast(forecast)) {
    throw new WeatherServiceError(INCOMPLETE_WEATHER_ERROR_MESSAGE);
  }

  return forecast;
}

function isValidGeocodingResult(result: unknown): result is OpenMeteoGeocodingResult & {
  name: string;
  latitude: number;
  longitude: number;
} {
  return (
    isRecord(result) &&
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    typeof result.latitude === 'number' &&
    Number.isFinite(result.latitude) &&
    typeof result.longitude === 'number' &&
    Number.isFinite(result.longitude)
  );
}

function isFiveDayForecast(
  forecast: Array<{
    date: string | null | undefined;
    temperatureMinC: number | null | undefined;
    temperatureMaxC: number | null | undefined;
    weatherCode: number | null | undefined;
  }>,
): forecast is [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay] {
  return (
    forecast.length === FORECAST_DAYS &&
    forecast.every(
      (day) =>
        isNonEmptyString(day.date) &&
        isFiniteNumber(day.temperatureMinC) &&
        isFiniteNumber(day.temperatureMaxC) &&
        isFiniteNumber(day.weatherCode),
    )
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toOptionalNumber(value: unknown): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

function toOptionalId(value: unknown): string | undefined {
  return isFiniteNumber(value) || typeof value === 'string' ? String(value) : undefined;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function hasFiveItems<T>(value: T[] | null | undefined): value is [T, T, T, T, T] {
  return Array.isArray(value) && value.length === FORECAST_DAYS;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidCity(value: unknown): value is City {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.name) &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isNonEmptyString(value.timezone) &&
    isValidTimezone(value.timezone)
  );
}

function normalizeTimezone(value: unknown): string {
  if (!isNonEmptyString(value) || !isValidTimezone(value)) {
    return DEFAULT_TIMEZONE;
  }

  return value;
}

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
