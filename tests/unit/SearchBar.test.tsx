import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import CurrentWeather from '../../src/components/CurrentWeather';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

describe('SearchBar', () => {
  it('does not call onSearch when the input is empty', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with the trimmed city name when a term is submitted', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText(/cidade/i);
    await user.type(input, '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });
});

describe('temperature unit conversion', () => {
  it('changes the displayed temperature from 0°C to 32°F when Fahrenheit is selected', async () => {
    const user = userEvent.setup();

    function TemperatureToggleFixture() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather
            city={{
              id: '1',
              name: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            }}
            current={{
              time: '2026-09-16T12:00',
              temperatureC: 0,
              weatherCode: 0,
            }}
            unit={unit}
          />
        </>
      );
    }

    render(<TemperatureToggleFixture />);

    expect(screen.getByText('0°C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
  });

  it('renders a dash instead of invalid current weather values', () => {
    render(
      <CurrentWeather
        city={{
          id: '1',
          name: 'São Paulo',
          latitude: -23.55,
          longitude: -46.63,
          timezone: 'America/Sao_Paulo',
        }}
        current={{
          time: '2026-09-16T12:00',
          temperatureC: Number.NaN,
          humidity: Number.NaN,
          windSpeed: undefined,
          precipitation: undefined,
          pressure: Number.NaN,
          weatherCode: Number.NaN,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(5);
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });
});
