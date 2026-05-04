type View = 'today' | 'weekend' | 'map';

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onManage: () => void;
  onRefresh: () => void;
}

const VIEWS: Array<{ id: View; label: string }> = [
  { id: 'today', label: '☀️ Today' },
  { id: 'weekend', label: '🏖️ Last Weekend' },
  { id: 'map', label: '🗺️ Map' },
];

export function Header({ view, onViewChange, onManage, onRefresh }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #ebe8e3',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            style={{
              padding: '1em',
              borderRadius: 20,
              background: view === v.id ? '#1a1916' : 'transparent',
              color: view === v.id ? '#fff' : '#555',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onRefresh}
          title="Refresh weather data"
          style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid #ddd', fontSize: 13, color: '#555', fontWeight: 500 }}
        >
          ↻ Refresh
        </button>
        <button
          onClick={onManage}
          style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid #ddd', fontSize: 13, color: '#555', fontWeight: 500 }}
        >
          Manage
        </button>
      </div>
    </header>
  );
}
