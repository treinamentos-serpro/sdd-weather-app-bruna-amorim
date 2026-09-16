import type { City } from '../types/weather';

interface CityResultsListProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityResultsList({ cities, onSelect }: CityResultsListProps) {
  return (
    <section aria-labelledby="city-results-heading" aria-live="polite" className="space-y-4">
      <h2 className="text-xl font-semibold text-white" id="city-results-heading">
        Escolha uma cidade
      </h2>
      <ul className="grid gap-3">
        {cities.slice(0, 10).map((city) => (
          <li key={`${city.id ?? city.name}-${city.latitude}-${city.longitude}`}>
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white shadow-glass transition hover:border-accent-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
              onClick={() => onSelect(city)}
              type="button"
            >
              <span className="block font-semibold">{city.name}</span>
              <span className="mt-1 block text-sm text-white/75">
                {[city.admin1, city.country].filter(Boolean).join(', ') || 'Localização disponível'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
