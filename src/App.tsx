import { useEffect, useRef, useState } from 'react';
import CityResultsList from './components/CityResultsList';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, cities, error, loadingMessage, query, search, selectCity, retry } =
    useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status !== 'idle' && status !== 'loading') {
      mainRef.current?.focus();
    }
  }, [status]);

  function renderContent() {
    if (status === 'idle') {
      return (
        <EmptyState
          hint="Digite uma cidade para visualizar o clima atual e a previsão dos próximos dias."
          title="Busque uma cidade"
        />
      );
    }

    if (status === 'loading') {
      return <LoadingState message={loadingMessage ?? 'Carregando...'} />;
    }

    if (status === 'results') {
      return <CityResultsList cities={cities} onSelect={selectCity} />;
    }

    if (status === 'empty') {
      return (
        <EmptyState
          hint="Tente outro nome, confira a grafia ou pesquise uma cidade próxima."
          title="Nenhuma cidade encontrada."
        />
      );
    }

    if (status === 'error') {
      return (
        <ErrorState
          message={error ?? 'Não foi possível carregar os dados. Tente novamente.'}
          onRetry={() => {
            void retry();
          }}
        />
      );
    }

    if (!data) {
      return (
        <EmptyState
          hint="Digite uma cidade para visualizar o clima atual e a previsão dos próximos dias."
          title="Busque uma cidade"
        />
      );
    }

    return (
      <div className="space-y-6">
        <CurrentWeather city={data.city} current={data.current} unit={unit} />
        <ForecastList forecast={data.forecast} timezone={data.city.timezone} unit={unit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-900 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-accent-400">
                SDD Weather
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-normal text-white sm:text-5xl">
                Previsão do tempo
              </h1>
              <p className="mt-3 text-sm text-white/75">
                {query ? `Busca atual: ${query}` : 'Digite uma cidade para começar'}
              </p>
            </div>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>

          <SearchBar
            disabled={status === 'loading'}
            onSearch={(city) => {
              void search(city);
            }}
          />
        </header>

        <main
          aria-busy={status === 'loading'}
          aria-label="Resultado da busca"
          ref={mainRef}
          tabIndex={-1}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
