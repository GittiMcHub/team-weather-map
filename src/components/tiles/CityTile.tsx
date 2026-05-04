import type { City, TeamMember, WeatherData } from '../../types';
import { weatherInfo } from '../../utils/weather';
import { Avatar } from '../ui/Avatar';
import { LoadingBar } from '../ui/LoadingBar';

interface CityTileProps {
  city: City;
  flag: string;
  weather: WeatherData | null | undefined;
  members: TeamMember[];
  cityPosition: 'top' | 'bottom';
}

export function CityTile({ city, flag, weather, members, cityPosition }: CityTileProps) {
  const info = weather ? weatherInfo(weather.code) : null;

  const nameEl = (
    <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{city.name}</span>
  );

  const membersEl = members.length > 0 ? (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {members.map(m => (
        <Avatar key={m.id} name={m.name} photo={m.photo} colorIdx={m.colorIdx} size={28} />
      ))}
    </div>
  ) : (
    <span style={{ fontSize: 11, color: '#ccc' }}>No members</span>
  );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {cityPosition === 'top' && nameEl}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {membersEl}
      <span style={{ fontSize: 20, lineHeight: 1 }}>{flag}</span>
    </div>
      {/* Weather row — flag always right-aligned on this row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          {weather === undefined && <LoadingBar />}
          {weather === null && (
            <span style={{ fontSize: 12, color: '#bbb' }}>Unavailable</span>
          )}
          {weather && info && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center'
                  ,background: 'rgb(250, 249, 247)'
                  , paddingTop: '1em'
                  , paddingBottom: '1em'
                  , margin: '5px'
                  , borderRadius: '12px'
              }}>
              <span style={{ fontSize: 36, lineHeight: 1 }}>{info.icon}</span>
              <div>
                <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{weather.temp}°</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{info.label}</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {cityPosition === 'bottom' && nameEl}
    </div>
  );
}
