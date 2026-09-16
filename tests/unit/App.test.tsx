import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../../src/App';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';

vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: vi.fn(),
}));

const useWeatherMock = vi.mocked(useWeather);
const searchMock = vi.fn<(name: string) => Promise<void>>();
const selectCityMock = vi.fn<() => Promise<void>>();
const retryMock = vi.fn<() => Promise<void>>();

function renderAppWithWeather(overrides: Partial<ReturnType<typeof useWeather>> = {}) {
  useWeatherMock.mockReturnValue({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
    search: searchMock,
    selectCity: selectCityMock,
    retry: retryMock,
    loadingMessage: null,
    ...overrides,
  });

  return render(<App />);
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the idle state before a search', () => {
    renderAppWithWeather();

    expect(screen.getByRole('heading', { name: /previsão do tempo/i })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /busque uma cidade/i })).toBeInTheDocument();
    expect(screen.getByText(/digite uma cidade para começar/i)).toBeInTheDocument();
  });

  it('calls search from the search form', async () => {
    const user = userEvent.setup();

    renderAppWithWeather();

    await user.type(screen.getByLabelText(/cidade/i), 'Seattle');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(searchMock).toHaveBeenCalledWith('Seattle');
  });

  it('renders weather data from the hook', () => {
    renderAppWithWeather({ status: 'success', data: mockWeatherData, query: 'Sao Paulo' });

    expect(screen.getByRole('heading', { name: /sao paulo/i })).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /previsão de 5 dias/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Resultado da busca' })).toHaveFocus();
  });

  it('converts temperatures when Fahrenheit is selected', async () => {
    const user = userEvent.setup();

    renderAppWithWeather({ status: 'success', data: mockWeatherData });

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('75°F')).toBeInTheDocument();
  });

  it('supports keyboard navigation in the temperature unit toggle', async () => {
    const user = userEvent.setup();

    renderAppWithWeather({ status: 'success', data: mockWeatherData });

    const celsiusButton = screen.getByRole('button', { name: '°C' });
    const fahrenheitButton = screen.getByRole('button', { name: '°F' });

    celsiusButton.focus();
    await user.keyboard('{ArrowRight}');

    expect(fahrenheitButton).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheitButton).toHaveFocus();
  });

  it('announces the loading state with a status role', async () => {
    renderAppWithWeather({ status: 'loading', query: 'Seattle' });

    expect(screen.getByRole('status')).toHaveTextContent(/carregando/i);
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
    expect(screen.getByRole('main', { name: 'Resultado da busca' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('shows the empty state from the hook', () => {
    renderAppWithWeather({ status: 'empty', query: 'Atlantis' });

    expect(screen.getByRole('heading', { name: /nenhuma cidade encontrada/i })).toBeInTheDocument();
  });

  it('calls retry from the error state', async () => {
    const user = userEvent.setup();

    renderAppWithWeather({ status: 'error', error: 'Falha de rede.', query: 'Seattle' });

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/falha de rede/i);
    expect(retryMock).toHaveBeenCalledTimes(1);
  });
});
