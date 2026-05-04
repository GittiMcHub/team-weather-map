const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat: string;
  lon: string;
}

export async function geocodeCity(name: string, countryName?: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', countryName ? `${name}, ${countryName}` : name);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'TeamWeatherMap/1.0 (team-weather-map)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as NominatimResult[];
  if (!data.length) return null;

  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}
