import { formatTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatOptionalMetric(value: number | null | undefined, suffix: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return `${Math.round(value)}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCodeInfo(current.weatherCode);
  const location = [city.name, city.admin1, city.country].filter(Boolean).join(', ');
  const metrics = [
    {
      label: 'Umidade',
      value: formatOptionalMetric(current.humidity, '%'),
    },
    {
      label: 'Vento',
      value: formatOptionalMetric(current.windSpeed, ' km/h'),
    },
    {
      label: 'Precipitação',
      value: formatOptionalMetric(current.precipitation, ' mm'),
    },
    {
      label: 'Pressão',
      value: formatOptionalMetric(current.pressure, ' hPa'),
    },
  ];

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">Agora</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{location}</h2>
          <p className="mt-3 text-lg text-white/80">{condition.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
          <span aria-hidden="true" className="text-5xl leading-none text-sun sm:text-6xl">
            {condition.icon}
          </span>
          <p className="break-words text-6xl font-bold leading-none tracking-normal text-white sm:text-8xl">
            {formatTemperature(current.temperatureC, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-xl border border-white/10 bg-night-800/50 p-4" key={metric.label}>
            <dt className="text-sm text-white/70">{metric.label}</dt>
            <dd className="mt-2 text-xl font-semibold text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
