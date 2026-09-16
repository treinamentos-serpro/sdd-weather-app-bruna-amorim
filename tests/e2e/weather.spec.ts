import { expect, test } from '@playwright/test';

const mockForecastResponse = {
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 60,
    wind_speed_10m: 5,
    precipitation: 0,
    pressure_msl: 1012,
    weather_code: 0,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    weather_code: [0, 1, 2, 3, 95],
    temperature_2m_max: [12, 13, 14, 15, 16],
    temperature_2m_min: [2, 1, 0, -1, -2],
  },
};

test('searches a city, shows the forecast and converts the current temperature to Fahrenheit', async ({
  page,
}) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 5809844,
            name: 'Seattle',
            country: 'United States',
            admin1: 'Washington',
            latitude: 47.60621,
            longitude: -122.33207,
            timezone: 'America/Los_Angeles',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockForecastResponse),
    });
  });

  await page.goto('/');

  await page.getByLabel('Cidade').fill('Seattle');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /seattle/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();

  const currentWeatherSection = page.getByRole('region', { name: 'Clima atual' });

  await expect(currentWeatherSection.getByText('32°F')).toBeVisible();
});

test('shows the empty state when geocoding returns no results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('does not request geocoding for empty or whitespace-only searches', async ({ page }) => {
  let geocodingRequests = 0;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequests += 1;
    await route.continue();
  });

  await page.goto('/');

  const searchInput = page.getByLabel('Cidade');
  const searchButton = page.getByRole('button', { name: 'Buscar' });

  await searchInput.fill('   ');
  await searchButton.click();

  expect(geocodingRequests).toBe(0);
  await expect(page.getByRole('alert')).toContainText(/digite o nome de uma cidade/i);
});

test('accepts accents, apostrophes and hyphens in a city search', async ({ page }) => {
  let requestedCity = '';

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    requestedCity = new URL(route.request().url()).searchParams.get('name') ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 456,
            name: "L'Hospitalet-dels-Infants",
            country: 'Espanha',
            latitude: 40.99,
            longitude: 0.93,
            timezone: 'Europe/Madrid',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockForecastResponse),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill(" L'Hospitalet-dels-Infants ");
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /l'hospitalet-dels-infants/i })).toBeVisible();
  expect(requestedCity).toBe("L'Hospitalet-dels-Infants");
});

test('shows a recoverable error when the forecast is incomplete', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 5809844,
            name: 'Seattle',
            country: 'United States',
            latitude: 47.60621,
            longitude: -122.33207,
            timezone: 'America/Los_Angeles',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-09-16T12:00',
          temperature_2m: 20,
          weather_code: 0,
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Seattle');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(/dados meteorológicos incompletos/i);
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});

test('renders the main search flow correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 5809844,
            name: 'Seattle',
            country: 'United States',
            admin1: 'Washington',
            latitude: 47.60621,
            longitude: -122.33207,
            timezone: 'America/Los_Angeles',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockForecastResponse),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Seattle');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /seattle/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

  const currentWeatherSection = page.getByRole('region', { name: 'Clima atual' });

  await expect(currentWeatherSection.getByText('0°C')).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();
  await expect(currentWeatherSection.getByText('32°F')).toBeVisible();
});
