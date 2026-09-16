import { act, renderHook, waitFor } from '@testing-library/react';

import { useWeather } from '../../src/hooks/useWeather';
import * as weatherService from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

const seattle: City = {
  id: 'seattle-us',
  name: 'Seattle',
  country: 'EUA',
  admin1: 'Washington',
  latitude: 47.60621,
  longitude: -122.33207,
  timezone: 'America/Los_Angeles',
};

const tacoma: City = {
  id: 'tacoma-us',
  name: 'Tacoma',
  country: 'EUA',
  admin1: 'Washington',
  latitude: 47.25288,
  longitude: -122.44429,
  timezone: 'America/Los_Angeles',
};

const seattleWeather: WeatherData = {
  city: seattle,
  current: {
    time: '2026-09-16T12:00',
    temperatureC: 19,
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
};

const tacomaWeather: WeatherData = {
  ...seattleWeather,
  city: tacoma,
};

describe('useWeather', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with an idle empty state', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('shows multiple city results before loading weather', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValueOnce([seattle, tacoma]);
    vi.spyOn(weatherService, 'getWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Seattle ');
    });

    expect(weatherService.searchCities).toHaveBeenCalledWith('Seattle');
    expect(weatherService.getWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('results');
    expect(result.current.cities).toEqual([seattle, tacoma]);
    expect(result.current.data).toBeNull();
    expect(result.current.query).toBe('Seattle');
    expect(result.current.error).toBeNull();
  });

  it('loads weather after selecting a city result', async () => {
    vi.spyOn(weatherService, 'getWeather').mockResolvedValueOnce(seattleWeather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(seattle);
    });

    expect(weatherService.getWeather).toHaveBeenCalledWith(seattle);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(seattleWeather);
  });

  it('sets empty status when search has no results', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValueOnce([]);
    vi.spyOn(weatherService, 'getWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Nowhere');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
    expect(weatherService.getWeather).not.toHaveBeenCalled();
  });

  it('selects a city and loads its weather', async () => {
    vi.spyOn(weatherService, 'getWeather').mockResolvedValueOnce(tacomaWeather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(tacoma);
    });

    expect(weatherService.getWeather).toHaveBeenCalledWith(tacoma);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(tacomaWeather);
    expect(result.current.query).toBe('Tacoma');
  });

  it('sets error status when a service call fails', async () => {
    vi.spyOn(weatherService, 'searchCities').mockRejectedValueOnce(
      new weatherService.WeatherServiceError('Falha de rede.'),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');
    expect(result.current.data).toBeNull();
  });

  it('retries the last search operation', async () => {
    vi.spyOn(weatherService, 'searchCities')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([seattle]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValueOnce(seattleWeather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(weatherService.searchCities).toHaveBeenCalledTimes(2);
    expect(weatherService.searchCities).toHaveBeenLastCalledWith('Seattle');
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(seattleWeather);
  });

  it('retries the forecast for the resolved city after an offline failure', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValueOnce([seattle]);
    vi.spyOn(weatherService, 'getWeather')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Não foi possível conectar'))
      .mockResolvedValueOnce(seattleWeather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(weatherService.searchCities).toHaveBeenCalledTimes(1);
    expect(weatherService.getWeather).toHaveBeenCalledTimes(2);
    expect(weatherService.getWeather).toHaveBeenLastCalledWith(seattle);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(seattleWeather);
  });

  it('ignores stale search results when a newer search finishes first', async () => {
    let resolveFirstSearch: (cities: City[]) => void = () => undefined;
    vi.spyOn(weatherService, 'searchCities')
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([tacoma]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValueOnce(tacomaWeather);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('Seattle');
    });
    await act(async () => {
      await result.current.search('Tacoma');
    });
    act(() => {
      resolveFirstSearch([seattle]);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(tacomaWeather);
    });
    expect(result.current.query).toBe('Tacoma');
  });
});
