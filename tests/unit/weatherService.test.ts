import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const fetchMock = vi.fn<typeof fetch>();
const city: City = {
  id: 'seattle-us',
  name: 'Seattle',
  country: 'EUA',
  admin1: 'Washington',
  latitude: 47.60621,
  longitude: -122.33207,
  timezone: 'America/Los_Angeles',
};

describe('searchCities', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns an empty list for blank input without calling the network', async () => {
    await expect(searchCities('   ')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns an empty list for an empty input without calling the network', async () => {
    await expect(searchCities('')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call the network for queries longer than 100 characters', async () => {
    await expect(searchCities('a'.repeat(101))).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes accents, apostrophes and hyphens in the city query', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 456,
              name: "L'Hospitalet-dels-Infants",
              latitude: 40.99,
              longitude: 0.93,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(searchCities(" L'Hospitalet-dels-Infants ")).resolves.toMatchObject([
      { name: "L'Hospitalet-dels-Infants" },
    ]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.searchParams.get('name')).toBe("L'Hospitalet-dels-Infants");
  });

  it('maps geocoding results to cities using the encoded city name', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 123,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(searchCities(' São Paulo ')).resolves.toEqual([
      {
        id: '123',
        name: 'São Paulo',
        country: 'Brasil',
        admin1: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('returns an empty list when geocoding results are missing', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await expect(searchCities('Seattle')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError when geocoding results have an invalid shape', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ results: { name: 'Seattle' } }), { status: 200 }),
    );

    await expect(searchCities('Seattle')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar os dados. Tente novamente.',
    });
  });

  it('uses a valid timezone fallback when geocoding omits timezone', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [{ name: 'Seattle', latitude: 47.6, longitude: -122.3 }],
        }),
        { status: 200 },
      ),
    );

    await expect(searchCities('Seattle')).resolves.toMatchObject([
      { name: 'Seattle', timezone: 'UTC' },
    ]);
  });

  it('throws WeatherServiceError when geocoding returns a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('throws WeatherServiceError when geocoding JSON is invalid', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{not valid json', { status: 200 }));

    await expect(searchCities('Seattle')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar os dados. Tente novamente.',
    });
  });

  it('throws WeatherServiceError when forecast JSON is invalid', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{not valid json', { status: 200 }));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar os dados. Tente novamente.',
    });
  });

  it('converts timeout aborts to WeatherServiceError', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce((_input, init) => {
      const signal = init?.signal;

      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const request = searchCities('Seattle');
    const assertion = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar os dados. Tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });

  it('converts network failures to WeatherServiceError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(searchCities('Seattle')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar os dados. Tente novamente.',
    });
  });

  it('clears the timeout after the request finishes', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }));

    await searchCities('Seattle');

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });
});

describe('getWeather', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('maps current weather and five daily forecast items', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            relative_humidity_2m: 64,
            wind_speed_10m: 9,
            pressure_msl: 1018,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [2, 3, 61, 80, 1],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).resolves.toEqual({
      city,
      current: {
        time: '2026-09-16T12:00',
        temperatureC: 19,
        humidity: 64,
        windSpeed: 9,
        pressure: 1018,
        weatherCode: 2,
      },
      forecast: [
        { date: '2026-09-16', temperatureMinC: 13, temperatureMaxC: 21, weatherCode: 2 },
        { date: '2026-09-17', temperatureMinC: 12, temperatureMaxC: 20, weatherCode: 3 },
        { date: '2026-09-18', temperatureMinC: 11, temperatureMaxC: 18, weatherCode: 61 },
        { date: '2026-09-19', temperatureMinC: 10, temperatureMaxC: 17, weatherCode: 80 },
        { date: '2026-09-20', temperatureMinC: 14, temperatureMaxC: 22, weatherCode: 1 },
      ],
      unit: 'celsius',
    });

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));

    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe('47.60621');
    expect(requestUrl.searchParams.get('longitude')).toBe('-122.33207');
    expect(requestUrl.searchParams.get('current')).toBe(
      'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl,weather_code',
    );
    expect(requestUrl.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_max,temperature_2m_min',
    );
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
  });

  it('accepts a valid forecast when current time is absent', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: { temperature_2m: 19, weather_code: 2 },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [2, 3, 61, 80, 1],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: { temperatureC: 19, weatherCode: 2 },
    });
  });

  it('omits precipitation when the optional value is null', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            precipitation: null,
            relative_humidity_2m: 64,
            wind_speed_10m: 9,
            pressure_msl: 1018,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [2, 3, 61, 80, 1],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeather(city);

    expect(weather.current).not.toHaveProperty('precipitation');
  });

  it('normalizes nullable optional current fields without exposing null', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            relative_humidity_2m: null,
            wind_speed_10m: null,
            precipitation: null,
            pressure_msl: null,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [2, 3, 61, 80, 1],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeather(city);

    expect(weather).toMatchObject({
      current: {
        humidity: undefined,
        windSpeed: undefined,
        pressure: undefined,
      },
    });
    expect(weather.current).not.toHaveProperty('precipitation');
  });

  it('throws WeatherServiceError when the forecast payload is missing current or daily', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Dados meteorológicos incompletos. Tente novamente.',
    });
  });

  it('throws WeatherServiceError when the current payload is missing a required field', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            relative_humidity_2m: 60,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [0, 1, 2, 3, 95],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Dados meteorológicos incompletos. Tente novamente.',
    });
  });

  it('throws WeatherServiceError when forecast data is incomplete', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            weather_code: 2,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('throws WeatherServiceError when daily forecast arrays are incomplete', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'],
            weather_code: [0, 1, 2, 3],
            temperature_2m_max: [21, 20, 18, 17],
            temperature_2m_min: [13, 12, 11, 10],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Dados meteorológicos incompletos. Tente novamente.',
    });
  });

  it('rejects a daily forecast containing a null essential value', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 19,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            weather_code: [2, 3, null, 80, 1],
            temperature_2m_max: [21, 20, 18, 17, 22],
            temperature_2m_min: [13, 12, 11, 10, 14],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Dados meteorológicos incompletos. Tente novamente.',
    });
  });
});
