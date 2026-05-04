import { useState, useEffect } from 'react';
import type { Country, City } from '../../types';
import { uid } from '../../utils/avatar';
import { Field } from '../ui/Field';
import { FlagPicker } from './FlagPicker';
import { geocodeCity } from '../../api/geocode';

interface TabPlacesProps {
  countries: Country[];
  cities: City[];
  onChangeCountries: (c: Country[]) => void;
  onChangeCities: (c: City[]) => void;
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%',
};

const colStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  border: '1px solid #f0ede8', borderRadius: 12, overflow: 'hidden',
};

export function TabPlaces({ countries, cities, onChangeCountries, onChangeCities }: TabPlacesProps) {
  const [selCountryId, setSelCountryId] = useState<string>(countries[0]?.id ?? '');
  const [selCityId, setSelCityId] = useState<string | null>(null);
  const [showFlagPicker, setShowFlagPicker] = useState(false);
  const [combinedLatLon, setCombinedLatLon] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const citiesForCountry = cities.filter(c => c.country === selCountryId);
  const selCountry = countries.find(c => c.id === selCountryId) ?? null;
  const selCity = cities.find(c => c.id === selCityId) ?? null;

  const rightMode = selCity ? 'city' : selCountry ? 'country' : 'none';

  // Reset combined field when a different city is selected
  useEffect(() => {
    if (selCity) {
      setCombinedLatLon(`${selCity.lat}, ${selCity.lon}`);
    } else {
      setCombinedLatLon('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selCityId]);

  const updateCity = (id: string, patch: Partial<City>) =>
    onChangeCities(cities.map(c => c.id === id ? { ...c, ...patch } : c));

  const updateCountry = (id: string, patch: Partial<Country>) =>
    onChangeCountries(countries.map(c => c.id === id ? { ...c, ...patch } : c));

  const handleLatChange = (val: string) => {
    if (!selCity) return;
    updateCity(selCity.id, { lat: val });
    setCombinedLatLon(`${val}, ${selCity.lon}`);
  };

  const handleLonChange = (val: string) => {
    if (!selCity) return;
    updateCity(selCity.id, { lon: val });
    setCombinedLatLon(`${selCity.lat}, ${val}`);
  };

  const handleCombinedChange = (val: string) => {
    if (!selCity) return;
    setCombinedLatLon(val);
    const comma = val.indexOf(',');
    if (comma !== -1) {
      const lat = val.slice(0, comma).trim();
      const lon = val.slice(comma + 1).trim();
      updateCity(selCity.id, { lat, lon });
    }
  };

  const handleGeocode = () => {
    if (!selCity) return;
    setLookupLoading(true);
    setLookupError(null);
    void geocodeCity(selCity.name, selCountry?.name)
      .then(result => {
        if (result) {
          updateCity(selCity.id, { lat: result.lat, lon: result.lon });
          setCombinedLatLon(`${result.lat}, ${result.lon}`);
        } else {
          setLookupError('City not found');
        }
      })
      .catch(() => setLookupError('Lookup failed'))
      .finally(() => setLookupLoading(false));
  };

  const addCity = () => {
    const c: City = { id: uid(), name: 'New city', country: selCountryId, lat: '', lon: '' };
    onChangeCities([...cities, c]);
    setSelCityId(c.id);
  };

  const removeCity = (id: string) => {
    onChangeCities(cities.filter(c => c.id !== id));
    if (selCityId === id) setSelCityId(null);
  };

  const addCountry = () => {
    const c: Country = { id: uid(), name: 'New country', flag: '🌍' };
    onChangeCountries([...countries, c]);
    setSelCountryId(c.id);
    setSelCityId(null);
  };

  const removeCountry = (id: string) => {
    onChangeCountries(countries.filter(c => c.id !== id));
    onChangeCities(cities.filter(c => c.country !== id));
    const next = countries.find(c => c.id !== id);
    setSelCountryId(next?.id ?? '');
    setSelCityId(null);
  };

  const columnHeight = 320;

  return (
    <>
      <div style={{ display: 'flex', gap: 8, height: columnHeight }}>
        {/* Countries column */}
        <div style={{ ...colStyle, width: 155, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Countries</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {countries.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setSelCountryId(c.id); setSelCityId(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', width: '100%', textAlign: 'left',
                  background: selCountryId === c.id ? '#f5f3f0' : i % 2 === 0 ? '#fff' : '#fafaf9',
                  borderBottom: '1px solid #f0ede8',
                  fontWeight: selCountryId === c.id ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 15 }}>{c.flag}</span>
                <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={addCountry}
            style={{ padding: '8px 12px', fontSize: 13, color: '#666', borderTop: '1px solid #f0ede8', textAlign: 'left', flexShrink: 0 }}
          >
            + Add
          </button>
        </div>

        {/* Cities column */}
        <div style={{ ...colStyle, width: 155, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Cities
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {citiesForCountry.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelCityId(selCityId === c.id ? null : c.id)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 12px', width: '100%', textAlign: 'left',
                  background: selCityId === c.id ? '#f5f3f0' : i % 2 === 0 ? '#fff' : '#fafaf9',
                  borderBottom: '1px solid #f0ede8',
                  fontWeight: selCityId === c.id ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
          {selCountryId && (
            <button
              onClick={addCity}
              style={{ padding: '8px 12px', fontSize: 13, color: '#666', borderTop: '1px solid #f0ede8', textAlign: 'left', flexShrink: 0 }}
            >
              + Add
            </button>
          )}
        </div>

        {/* Detail pane */}
        <div style={{ flex: 1, overflowY: 'auto', paddingLeft: 4 }}>
          {rightMode === 'none' && (
            <div style={{ color: '#bbb', fontSize: 13, paddingTop: 20 }}>Select a country or city</div>
          )}

          {rightMode === 'country' && selCountry && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Flag emoji">
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, width: 56 }}
                    value={selCountry.flag}
                    onChange={e => updateCountry(selCountry.id, { flag: e.target.value })}
                  />
                  <button
                    onClick={() => setShowFlagPicker(true)}
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}
                  >
                    Pick flag
                  </button>
                </div>
              </Field>
              <Field label="Name">
                <input
                  style={inputStyle}
                  value={selCountry.name}
                  onChange={e => updateCountry(selCountry.id, { name: e.target.value })}
                />
              </Field>
              <button
                onClick={() => removeCountry(selCountry.id)}
                style={{ alignSelf: 'flex-start', marginTop: 4, padding: '6px 14px', borderRadius: 8, border: '1px solid #e57373', color: '#e57373', fontSize: 13 }}
              >
                Remove country
              </button>
            </div>
          )}

          {rightMode === 'city' && selCity && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Name">
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={inputStyle}
                    value={selCity.name}
                    onChange={e => { updateCity(selCity.id, { name: e.target.value }); setLookupError(null); }}
                  />
                  <button
                    onClick={handleGeocode}
                    disabled={lookupLoading || !selCity.name.trim()}
                    title="Look up coordinates via OpenStreetMap"
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {lookupLoading ? '…' : <>&#128269;</>}
                  </button>
                </div>
                {lookupError && (
                  <span style={{ fontSize: 11, color: '#e57373', marginTop: 2 }}>{lookupError}</span>
                )}
              </Field>
              <Field label="Lat, Lon">
                <input
                  style={inputStyle}
                  placeholder="e.g. 52.5200, 13.4050"
                  value={combinedLatLon}
                  onChange={e => handleCombinedChange(e.target.value)}
                />
              </Field>
              <Field label="Latitude">
                <input
                  style={inputStyle}
                  value={String(selCity.lat)}
                  onChange={e => handleLatChange(e.target.value)}
                />
              </Field>
              <Field label="Longitude">
                <input
                  style={inputStyle}
                  value={String(selCity.lon)}
                  onChange={e => handleLonChange(e.target.value)}
                />
              </Field>
              <button
                onClick={() => removeCity(selCity.id)}
                style={{ alignSelf: 'flex-start', marginTop: 4, padding: '6px 14px', borderRadius: 8, border: '1px solid #e57373', color: '#e57373', fontSize: 13 }}
              >
                Remove city
              </button>
            </div>
          )}
        </div>
      </div>

      {showFlagPicker && selCountry && (
        <FlagPicker
          onSelect={flag => updateCountry(selCountry.id, { flag })}
          onClose={() => setShowFlagPicker(false)}
        />
      )}
    </>
  );
}
