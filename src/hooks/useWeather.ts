import { useRef, useState } from 'react';

import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'results' | 'success' | 'error' | 'empty';

type LastOperation = { type: 'search'; name: string } | { type: 'selectCity'; city: City };

interface UseWeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  loadingMessage: string | null;
}

interface UseWeatherResult extends UseWeatherState {
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<UseWeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
    loadingMessage: null,
  });
  const lastOperationRef = useRef<LastOperation | null>(null);
  const requestIdRef = useRef(0);

  async function search(name: string): Promise<void> {
    const currentRequestId = nextRequestId();
    const query = name.trim();
    lastOperationRef.current = { type: 'search', name };
    setState((current) => ({
      ...current,
      status: 'loading',
      error: null,
      query,
      loadingMessage: 'Buscando cidade...',
    }));

    try {
      const cities = await searchCities(query);

      if (!isCurrentRequest(currentRequestId)) {
        return;
      }

      if (cities.length === 0) {
        setState((current) => ({ ...current, status: 'empty', data: null, cities, error: null }));
        return;
      }

      if (cities.length > 1) {
        setState((current) => ({
          ...current,
          status: 'results',
          data: null,
          cities,
          loadingMessage: null,
        }));
        return;
      }

      const city = cities[0];
      lastOperationRef.current = { type: 'selectCity', city };
      setState((current) => ({ ...current, cities, loadingMessage: 'Carregando previsão...' }));
      await loadWeather(city, currentRequestId);
    } catch (error) {
      handleError(error, currentRequestId);
    }
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequestId = nextRequestId();
    lastOperationRef.current = { type: 'selectCity', city };
    setState((current) => ({
      ...current,
      status: 'loading',
      error: null,
      query: city.name,
      loadingMessage: 'Carregando previsão...',
    }));

    await loadWeather(city, currentRequestId);
  }

  async function retry(): Promise<void> {
    const lastOperation = lastOperationRef.current;

    if (!lastOperation) {
      return;
    }

    if (lastOperation.type === 'search') {
      await search(lastOperation.name);
      return;
    }

    await selectCity(lastOperation.city);
  }

  function nextRequestId(): number {
    requestIdRef.current += 1;
    return requestIdRef.current;
  }

  function isCurrentRequest(requestId: number): boolean {
    return requestId === requestIdRef.current;
  }

  async function loadWeather(city: City, requestId: number): Promise<void> {
    try {
      const data = await getWeather(city);

      if (!isCurrentRequest(requestId)) {
        return;
      }

      setState((current) => ({
        ...current,
        status: 'success',
        data,
        error: null,
        query: city.name,
        loadingMessage: null,
      }));
    } catch (error) {
      handleError(error, requestId);
    }
  }

  function handleError(error: unknown, requestId: number): void {
    if (!isCurrentRequest(requestId)) {
      return;
    }

    setState((current) => ({
      ...current,
      status: 'error',
      data: null,
      error: getErrorMessage(error),
      loadingMessage: null,
    }));
  }

  return {
    ...state,
    search,
    selectCity,
    retry,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof WeatherServiceError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível carregar os dados.';
}
