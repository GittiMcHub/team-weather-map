import type { City, WeatherData, WeekendData } from '../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 700;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, RETRY_BASE_MS * (i + 1)));
    }
  }
  throw new Error('unreachable');
}

interface OpenMeteoForecastResponse {
  daily: { temperature_2m_max: number[]; weathercode: number[] };
}

interface OpenMeteoWeekendResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

export async function fetchWeather(city: Pick<City, 'lat' | 'lon'>): Promise<WeatherData> {
  return withRetry(async () => {
    const url = new URL(BASE_URL);
    url.searchParams.set('latitude', String(city.lat));
    url.searchParams.set('longitude', String(city.lon));
    url.searchParams.set('daily', 'temperature_2m_max,weathercode');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '1');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = (await res.json()) as OpenMeteoForecastResponse;
    return {
      temp: Math.round(d.daily.temperature_2m_max[0]),
      code: d.daily.weathercode[0],
    };
  });
}

export async function fetchWeekendWeather(city: Pick<City, 'lat' | 'lon'>): Promise<WeekendData> {
  return withRetry(async () => {
    const url = new URL(BASE_URL);
    url.searchParams.set('latitude', String(city.lat));
    url.searchParams.set('longitude', String(city.lon));
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('past_days', '7');
    url.searchParams.set('forecast_days', '0');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = (await res.json()) as OpenMeteoWeekendResponse;

    const result: WeekendData = {};
    d.daily.time.forEach((dateStr, idx) => {
      const dow = new Date(`${dateStr}T12:00:00`).getDay();
      const entry = {
        temp: Math.round(d.daily.temperature_2m_max[idx]),
        tempMin: Math.round(d.daily.temperature_2m_min[idx]),
        code: d.daily.weathercode[idx],
        date: dateStr,
      };
      if (dow === 6) result.sat = entry;
      if (dow === 0) result.sun = entry;
    });
    return result;
  });
}
