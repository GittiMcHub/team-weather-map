import { useState } from 'react';
import type { TeamMember, Country, City, ColConfig, ConfigSavePayload } from '../../types';
import { exportConfig, importConfig } from '../../utils/configIO';
import { TabTeam } from './TabTeam';
import { TabPlaces } from './TabPlaces';
import { TabLayout } from './TabLayout';

type Tab = 'team' | 'places' | 'layout';

interface ConfigModalProps {
  members: TeamMember[];
  countries: Country[];
  cities: City[];
  colConfig: ColConfig;
  onSave: (payload: ConfigSavePayload) => void;
  onClose: () => void;
}

export function ConfigModal({ members, countries, cities, colConfig, onSave, onClose }: ConfigModalProps) {
  const [tab, setTab] = useState<Tab>('team');
  const [localMembers, setLocalMembers] = useState(members);
  const [localCountries, setLocalCountries] = useState(countries);
  const [localCities, setLocalCities] = useState(cities);
  const [localCols, setLocalCols] = useState(colConfig);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = () => {
    const validCities = localCities.map(c => ({
      ...c,
      lat: parseFloat(String(c.lat)),
      lon: parseFloat(String(c.lon)),
    })).filter(c => !isNaN(c.lat) && !isNaN(c.lon));

    onSave({ members: localMembers, countries: localCountries, cities: validCities, colConfig: localCols });
    onClose();
  };

  const handleExport = () => {
    const validCities = localCities.map(c => ({
      ...c,
      lat: parseFloat(String(c.lat)),
      lon: parseFloat(String(c.lon)),
    })).filter(c => !isNaN(c.lat) && !isNaN(c.lon));
    exportConfig({ members: localMembers, countries: localCountries, cities: validCities, colConfig: localCols });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const inputEl = e.target;
    void file.text().then((text) => {
      try {
        const payload = importConfig(text);
        setLocalMembers(payload.members);
        setLocalCountries(payload.countries);
        setLocalCities(payload.cities);
        setLocalCols(payload.colConfig);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed');
      }
      inputEl.value = '';
    });
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'team', label: 'Team' },
    { id: 'places', label: 'Places' },
    { id: 'layout', label: 'Layout' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        {/* Header */}
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Settings</span>
          <button onClick={onClose} style={{ fontSize: 22, color: '#999', padding: '0 4px' }} aria-label="Close">×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, padding: '12px 20px 0', borderBottom: '1px solid #f0ede8' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: tab === t.id ? '#1a1916' : '#999',
                borderBottom: `2px solid ${tab === t.id ? '#1a1916' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {tab === 'team' && <TabTeam members={localMembers} cities={localCities} onChange={setLocalMembers} />}
          {tab === 'places' && <TabPlaces countries={localCountries} cities={localCities} onChangeCountries={setLocalCountries} onChangeCities={setLocalCities} />}
          {tab === 'layout' && <TabLayout config={localCols} onChange={setLocalCols} />}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0ede8', display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleExport} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, color: '#555' }}>Export JSON</button>
              <label style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, color: '#555', cursor: 'pointer' }}>
                Import JSON
                <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} aria-label="Import JSON file" />
              </label>
            </div>
            {importError && <span role="alert" style={{ fontSize: 12, color: '#e57373' }}>{importError}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, color: '#555' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '8px 18px', borderRadius: 10, background: '#1a1916', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
