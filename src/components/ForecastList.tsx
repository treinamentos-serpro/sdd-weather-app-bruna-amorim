import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  timezone: string;
}

export default function ForecastList({ forecast, unit, timezone }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="space-y-4">
      <h2 className="text-xl font-semibold text-white" id="forecast-heading">
        Previsão de 5 dias
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, position) => (
          <ForecastCard
            day={day}
            key={day.date}
            position={position}
            timezone={timezone}
            unit={unit}
          />
        ))}
      </div>
    </section>
  );
}
