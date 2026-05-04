import { describe, it, expect, vi, afterEach } from 'vitest';
import { geocodeCity } from './geocode';

const mockFetch = (data: unknown, ok = true) =>
  vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => data });

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('geocodeCity', () => {
  it('returns lat/lon for a known city', async () => {
    vi.stubGlobal('fetch', mockFetch([{ lat: '52.5170365', lon: '13.3888599' }]));
    const result = await geocodeCity('Berlin');
    expect(result).toEqual({ lat: 52.5170365, lon: 13.3888599 });
  });

  it('returns null when no results found', async () => {
    vi.stubGlobal('fetch', mockFetch([]));
    const result = await geocodeCity('xyznonexistentcity');
    expect(result).toBeNull();
  });

  it('throws on HTTP error', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false));
    await expect(geocodeCity('Berlin')).rejects.toThrow('HTTP 500');
  });

  it('appends country name to query when provided', async () => {
    const fetchMock = mockFetch([{ lat: '48.8566', lon: '2.3522' }]);
    vi.stubGlobal('fetch', fetchMock);
    await geocodeCity('Paris', 'France');
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('q')).toBe('Paris, France');
    expect(calledUrl.searchParams.get('format')).toBe('json');
    expect(calledUrl.searchParams.get('limit')).toBe('1');
  });

  it('uses only city name when country not provided', async () => {
    const fetchMock = mockFetch([{ lat: '52.5170365', lon: '13.3888599' }]);
    vi.stubGlobal('fetch', fetchMock);
    await geocodeCity('Berlin');
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('q')).toBe('Berlin');
  });

  it('sends User-Agent header', async () => {
    const fetchMock = mockFetch([{ lat: '51.5074', lon: '-0.1278' }]);
    vi.stubGlobal('fetch', fetchMock);
    await geocodeCity('London');
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['User-Agent']).toMatch(/TeamWeatherMap/);
  });
});
