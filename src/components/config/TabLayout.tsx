import type { ColConfig } from '../../types';
import { Field } from '../ui/Field';

interface TabLayoutProps {
  config: ColConfig;
  onChange: (cfg: ColConfig) => void;
}

const BP_LABELS: Array<[keyof Omit<ColConfig, 'cityPosition' | 'weatherAnimations'>, string]> = [
  ['xs', 'Mobile (< 480 px)'],
  ['sm', 'Small (≥ 480 px)'],
  ['md', 'Medium (≥ 768 px)'],
  ['lg', 'Large (≥ 1024 px)'],
];

export function TabLayout({ config, onChange }: TabLayoutProps) {
  const set = (key: keyof ColConfig, val: number | string) =>
    onChange({ ...config, [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="City name position">
            <div style={{ display: 'flex', gap: 8 }}>
                {(['top', 'bottom'] as const).map(pos => (
                    <button
                        key={pos}
                        onClick={() => set('cityPosition', pos)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 8,
                            border: '1.5px solid',
                            borderColor: config.cityPosition === pos ? '#333' : '#ddd',
                            background: config.cityPosition === pos ? '#333' : '#fff',
                            color: config.cityPosition === pos ? '#fff' : '#555',
                            fontWeight: 500,
                            fontSize: 13,
                            textTransform: 'capitalize',
                        }}
                    >
                        {pos}
                    </button>
                ))}
            </div>
        </Field>

        <Field label="Weather animations">
            <div style={{ display: 'flex', gap: 8 }}>
                {([true, false] as const).map(val => (
                    <button
                        key={String(val)}
                        onClick={() => onChange({ ...config, weatherAnimations: val })}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 8,
                            border: '1.5px solid',
                            borderColor: config.weatherAnimations === val ? '#333' : '#ddd',
                            background: config.weatherAnimations === val ? '#333' : '#fff',
                            color: config.weatherAnimations === val ? '#fff' : '#555',
                            fontWeight: 500,
                            fontSize: 13,
                        }}
                    >
                        {val ? 'On' : 'Off'}
                    </button>
                ))}
            </div>
        </Field>

      {BP_LABELS.map(([key, label]) => (
        <Field key={key} label={label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range"
              min={1}
              max={6}
              value={config[key]}
              onChange={e => set(key, Number(e.target.value))}
              style={{ flex: 1 }}
              aria-label={`${label} columns`}
            />
            <span style={{ width: 20, textAlign: 'center', fontWeight: 600 }}>{config[key]}</span>
          </div>
        </Field>
      ))}

    </div>
  );
}
