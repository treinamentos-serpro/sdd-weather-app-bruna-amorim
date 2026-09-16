import { formatForecastDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  position: number;
  unit: Unit;
  timezone: string;
}

function formatRainProbability(probability: number | null | undefined) {
  if (typeof probability !== 'number' || !Number.isFinite(probability)) {
    return '—';
  }

  return `${Math.round(probability)}%`;
}

export default function ForecastCard({ day, position, timezone, unit }: ForecastCardProps) {
  const condition = getWeatherCodeInfo(day.weatherCode);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            {formatForecastDayLabel(day.date, position, timezone)}
          </h3>
          <p className="mt-1 text-sm text-white/70">{getShortDate(day.date)}</p>
          <p className="mt-1 text-sm text-white/70">{condition.label}</p>
        </div>
        <span aria-hidden="true" className="text-3xl leading-none text-sun">
          {condition.icon}
        </span>
      </div>

      <dl className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-white/70">Máx</dt>
          <dd className="text-lg font-semibold text-white">
            {formatTemperature(day.temperatureMaxC, unit)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-white/70">Mín</dt>
          <dd className="text-lg font-semibold text-white/80">
            {formatTemperature(day.temperatureMinC, unit)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-night-800/50 px-3 py-2">
          <dt className="text-sm text-white/70">Chuva</dt>
          <dd className="font-semibold text-white">
            {formatRainProbability(day.precipitationProbability)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
