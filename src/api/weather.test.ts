import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchWeather, fetchWeekendWeather } from './weather';

const mockFetch = (data: unknown, ok = true) =>
  vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => data });

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const coords = { lat: 52.52, lon: 13.405 };

describe('fetchWeather', () => {
  it('returns temp and code on success', async () => {
    vi.stubGlobal('fetch', mockFetch({ daily: { temperature_2m_max: [22.7], weathercode: [3] } }));
    const result = await fetchWeather(coords);
    expect(result).toEqual({ temp: 23, code: 3 });
  });

  it('rounds temperature to nearest integer', async () => {
    vi.stubGlobal('fetch', mockFetch({ daily: { temperature_2m_max: [18.4], weathercode: [0] } }));
    const result = await fetchWeather(coords);
    expect(result.temp).toBe(18);
  });

  it('retries 3 times then throws on repeated network failure', async () => {
    // Spy on setTimeout to make retry delays instant (call resolve immediately)
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: TimerHandler) => {
      (fn as () => void)();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchWeather(coords)).rejects.toThrow('Network error');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('fetchWeekendWeather', () => {
  const weekendPayload = {
    daily: {
      time: ['2026-01-08', '2026-01-09', '2026-01-10', '2026-01-11'],
      temperature_2m_max:  [5, 6, 18, 12],
      temperature_2m_min:  [1, 2,  8,  5],
      weathercode:         [3, 0,  2,  1],
    },
  };

  it('maps Saturday (dow=6) and Sunday (dow=0)', async () => {
    // 2026-01-10 is Saturday, 2026-01-11 is Sunday
    vi.stubGlobal('fetch', mockFetch(weekendPayload));
    const result = await fetchWeekendWeather(coords);
    expect(result.sat?.date).toBe('2026-01-10');
    expect(result.sat?.temp).toBe(18);
    expect(result.sun?.date).toBe('2026-01-11');
    expect(result.sun?.temp).toBe(12);
  });

  it('returns empty object if no weekend days in range', async () => {
    const noWeekend = {
      daily: {
        time: ['2026-01-06', '2026-01-07'],
        temperature_2m_max: [10, 11],
        temperature_2m_min: [5, 6],
        weathercode: [0, 1],
      },
    };
    vi.stubGlobal('fetch', mockFetch(noWeekend));
    const result = await fetchWeekendWeather(coords);
    expect(result.sat).toBeUndefined();
    expect(result.sun).toBeUndefined();
  });
});
