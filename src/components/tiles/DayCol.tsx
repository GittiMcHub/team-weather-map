import type { WeekendDayData } from '../../types';
import { weatherInfo } from '../../utils/weather';
import { LoadingBar } from '../ui/LoadingBar';

interface DayColProps {
  label: string;
  data: WeekendDayData | null | undefined;
}

export function DayCol({ label, data }: DayColProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center'
        ,background: 'rgb(250, 249, 247)'
      , paddingTop: '1em'
      , paddingBottom: '1em'
      , margin: '5px'
        , borderRadius: '12px'
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </span>
      {data === undefined && <LoadingBar />}
      {data === null && <span style={{ fontSize: 12, color: '#bbb' }}>—</span>}
      {data && (
        <>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{weatherInfo(data.code).icon}</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{data.temp}°</span>
          <span style={{ fontSize: 11, color: '#888' }}>{data.tempMin}° min</span>
        </>
      )}
    </div>
  );
}
