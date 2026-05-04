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
    padding: '5%',
    flex: 1,
    alignContent: 'start',
  };

  return (
    <>
      <div style={{paddingTop: '2%', paddingLeft: '2%'}}>
        <h1>Team Weather</h1>
        <p style={{ color: "grey" }}>{ new Date().toDateString() }</p>
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

      {/* Map */}
      <div style={{ display: view === 'map' ? 'flex' : 'none', flex: 1, minHeight: 0 }}>
        <MapView
          cities={cities}
          countries={countries}
          members={members}
          weather={weather}
          visible={view === 'map'}
        />
      </div>

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
