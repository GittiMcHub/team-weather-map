import { useState, useEffect } from 'react';
import type { WeatherMap, WeekendMap, ConfigSavePayload, TeamMember, Country, City, ColConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWindowWidth } from './hooks/useWindowWidth';
import { LS_KEYS, DEFAULT_COUNTRIES, DEFAULT_CITIES, DEFAULT_COL_CONFIG } from './constants';
import { fetchWeather, fetchWeekendWeather } from './api/weather';
import { getCols } from './utils/grid';
import { Header } from './components/layout/Header';
import { CityTile } from './components/tiles/CityTile';
import { WeekendTile } from './components/tiles/WeekendTile';
import { MapView } from './components/map/MapView';
import { ConfigModal } from './components/config/ConfigModal';

type View = 'today' | 'weekend' | 'map';

export default function App() {
  const [members,   setMembers]   = useLocalStorage<TeamMember[]>(LS_KEYS.MEMBERS,   []);
  const [countries, setCountries] = useLocalStorage<Country[]>   (LS_KEYS.COUNTRIES, DEFAULT_COUNTRIES);
  const [cities,    setCities]    = useLocalStorage<City[]>       (LS_KEYS.CITIES,    DEFAULT_CITIES);
  const [colConfig, setColConfig] = useLocalStorage<ColConfig>    (LS_KEYS.COLS,      DEFAULT_COL_CONFIG);

  const today = new Date().toISOString().slice(0, 10);

  const [weatherCache, setWeatherCache] = useLocalStorage<{ date: string; data: WeatherMap } | null>(LS_KEYS.WEATHER_CACHE, null);
  const [weekendCache, setWeekendCache] = useLocalStorage<{ date: string; data: WeekendMap } | null>(LS_KEYS.WEEKEND_CACHE, null);

  const [view, setView] = useState<View>('today');
  const [showConfig, setShowConfig] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [weather, setWeather] = useState<WeatherMap>(
    weatherCache?.date === today ? weatherCache.data : {}
  );
  const [weekend, setWeekend] = useState<WeekendMap>(
    weekendCache?.date === today ? weekendCache.data : {}
  );

  const width = useWindowWidth();
  const cols = getCols(width, colConfig);

  useEffect(() => {
    cities.forEach(city => {
      if (weather[city.id] !== undefined) return;
      fetchWeather(city)
        .then(data => setWeather(prev => ({ ...prev, [city.id]: data })))
        .catch(() => setWeather(prev => ({ ...prev, [city.id]: null })));
    });
  }, [cities, refreshKey]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cities.forEach(city => {
      if (weekend[city.id] !== undefined) return;
      fetchWeekendWeather(city)
        .then(data => setWeekend(prev => ({ ...prev, [city.id]: data })))
        .catch(() => setWeekend(prev => ({ ...prev, [city.id]: null })));
    });
  }, [cities, refreshKey]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Object.keys(weather).length > 0)
      setWeatherCache({ date: today, data: weather });
  }, [weather]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Object.keys(weekend).length > 0)
      setWeekendCache({ date: today, data: weekend });
  }, [weekend]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    setWeather({});
    setWeekend({});
    setWeatherCache(null);
    setWeekendCache(null);
    setRefreshKey(k => k + 1);
  };

  const handleSave = (payload: ConfigSavePayload) => {
    setMembers(payload.members);
    setCountries(payload.countries);
    setCities(payload.cities);
    setColConfig(payload.colConfig);
    // Clear weather for cities that have changed
    const cityIds = new Set(payload.cities.map(c => c.id));
    setWeather(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => cityIds.has(id))));
    setWeekend(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => cityIds.has(id))));
  };

  const getFlag = (city: { countryId: string }) =>
    countries.find(c => c.id === city.countryId)?.flag ?? '';

  const getCityMembers = (cityId: string) => members.filter(m => m.cityId === cityId);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 12,
    padding: '1%',
    flex: 1,
    alignContent: 'start',
  };

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ paddingTop: '2%', paddingLeft: '2%' }}>
          <h1>Team Weather</h1>
          <p style={{ color: 'grey' }}>{new Date().toDateString()}</p>
        </div>
        <Header view={view} onViewChange={setView} onManage={() => setShowConfig(true)} onRefresh={handleRefresh} />

        {/* Today */}
        <div style={{ ...gridStyle, display: view === 'today' ? 'grid' : 'none' }}>
          {cities.map(city => (
            <CityTile
              key={city.id}
              city={city}
              flag={getFlag(city)}
              weather={weather[city.id]}
              members={getCityMembers(city.id)}
              cityPosition={colConfig.cityPosition}
            />
          ))}
        </div>

        {/* Weekend */}
        <div style={{ ...gridStyle, display: view === 'weekend' ? 'grid' : 'none' }}>
          {cities.map(city => (
            <WeekendTile
              key={city.id}
              city={city}
              flag={getFlag(city)}
              weekend={weekend[city.id]}
              members={getCityMembers(city.id)}
              cityPosition={colConfig.cityPosition}
            />
          ))}
        </div>

        {/* Map — rendered as a single tile card so the page footer stays visible */}
        <div style={{ display: view === 'map' ? 'flex' : 'none', flex: 1, minHeight: 0, padding: '5%' }}>
          <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', background: '#fff' }}>
            <MapView
              cities={cities}
              countries={countries}
              members={members}
              weather={weather}
              visible={view === 'map'}
            />
          </div>
        </div>
      </div>

      <footer style={{
        flexShrink: 0,
        borderTop: '1px solid #ebe8e3',
        padding: '6px 20px',
        fontSize: 11,
        color: '#aaa',
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <span>Weather: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>Open-Meteo</a></span>
        <span>Geocoding: <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>Nominatim</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>© OpenStreetMap contributors</a></span>
        <span>Map tiles: <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>© CARTO</a></span>
        <span>Map: <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>Leaflet</a></span>
        <span>UI: <a href="https://react.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>React</a></span>
      </footer>

      {showConfig && (
        <ConfigModal
          members={members}
          countries={countries}
          cities={cities}
          colConfig={colConfig}
          onSave={handleSave}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
}
