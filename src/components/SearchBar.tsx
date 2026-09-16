import type { FormEvent } from 'react';
import { useState } from 'react';

const MAX_QUERY_LENGTH = 100;

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const trimmedCity = city.trim();
  const isSubmitDisabled = disabled;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedCity.length === 0) {
      setValidationMessage('Digite o nome de uma cidade.');
      return;
    }

    if (trimmedCity.length > MAX_QUERY_LENGTH) {
      setValidationMessage('O nome da cidade deve ter no máximo 100 caracteres.');
      return;
    }

    setValidationMessage(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row"
      aria-busy={disabled}
      role="search"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          className="w-full rounded-xl border border-white/10 bg-night-800/80 px-4 py-3 text-base text-white placeholder:text-white/60 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Buscar cidade"
          type="search"
          value={city}
        />
      </div>
      <button
        className="rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/60 disabled:hover:bg-white/15"
        disabled={isSubmitDisabled}
        type="submit"
      >
        Buscar
      </button>
      {validationMessage && (
        <p className="text-sm text-red-200" role="alert">
          {validationMessage}
        </p>
      )}
    </form>
  );
}
