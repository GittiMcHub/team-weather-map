import type { City, TeamMember, WeekendData } from '../../types';
import { weekendVibe } from '../../utils/weather';
import { Avatar } from '../ui/Avatar';
import { DayCol } from './DayCol';

interface WeekendTileProps {
  city: City;
  flag: string;
  weekend: WeekendData | null | undefined;
  members: TeamMember[];
  cityPosition: 'top' | 'bottom';
}

export function WeekendTile({ city, flag, weekend, members, cityPosition }: WeekendTileProps) {
  const vibe = weekend ? weekendVibe(weekend.sat, weekend.sun) : null;

  // City name left, vibe text right — always on the same row
  const nameEl = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{city.name}</span>
      {vibe && (
        <span style={{ fontSize: 12, color: '#888' }}>{vibe.emoji} {vibe.text}</span>
      )}
    </div>
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
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {
          members.length > 0 &&
          (
          members.map(m => (
            <Avatar key={m.id} name={m.name} photo={m.photo} colorIdx={m.colorIdx} size={28} />
          ))
      )
      }
            <span style={{ fontSize: 20, lineHeight: 1, marginLeft: 'auto', marginTop: 2 }}>{flag}</span>
      </div>



      {/* Weather row — flag always right-aligned on this row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <DayCol label="Sat" data={weekend === undefined ? undefined : (weekend?.sat ?? null)} />
        <DayCol label="Sun" data={weekend === undefined ? undefined : (weekend?.sun ?? null)} />

      </div>

      {cityPosition === 'bottom' && nameEl}
    </div>
  );
}
