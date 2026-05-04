import { useState } from 'react';

interface FlagPickerProps {
  onSelect: (flag: string, name: string) => void;
  onClose: () => void;
}

const FLAGS: Array<[string, string]> = [
  ['🇦🇫', 'Afghanistan'], ['🇦🇱', 'Albania'], ['🇩🇿', 'Algeria'], ['🇦🇩', 'Andorra'],
  ['🇦🇴', 'Angola'], ['🇦🇬', 'Antigua and Barbuda'], ['🇦🇷', 'Argentina'], ['🇦🇲', 'Armenia'],
  ['🇦🇺', 'Australia'], ['🇦🇹', 'Austria'], ['🇦🇿', 'Azerbaijan'], ['🇧🇸', 'Bahamas'],
  ['🇧🇭', 'Bahrain'], ['🇧🇩', 'Bangladesh'], ['🇧🇧', 'Barbados'], ['🇧🇾', 'Belarus'],
  ['🇧🇪', 'Belgium'], ['🇧🇿', 'Belize'], ['🇧🇯', 'Benin'], ['🇧🇹', 'Bhutan'],
  ['🇧🇴', 'Bolivia'], ['🇧🇦', 'Bosnia'], ['🇧🇼', 'Botswana'], ['🇧🇷', 'Brazil'],
  ['🇧🇳', 'Brunei'], ['🇧🇬', 'Bulgaria'], ['🇧🇫', 'Burkina Faso'], ['🇧🇮', 'Burundi'],
  ['🇨🇻', 'Cabo Verde'], ['🇰🇭', 'Cambodia'], ['🇨🇲', 'Cameroon'], ['🇨🇦', 'Canada'],
  ['🇨🇫', 'Central African Republic'], ['🇹🇩', 'Chad'], ['🇨🇱', 'Chile'], ['🇨🇳', 'China'],
  ['🇨🇴', 'Colombia'], ['🇰🇲', 'Comoros'], ['🇨🇬', 'Congo'], ['🇨🇩', 'DR Congo'],
  ['🇨🇷', 'Costa Rica'], ['🇭🇷', 'Croatia'], ['🇨🇺', 'Cuba'], ['🇨🇾', 'Cyprus'],
  ['🇨🇿', 'Czechia'], ['🇩🇰', 'Denmark'], ['🇩🇯', 'Djibouti'], ['🇩🇲', 'Dominica'],
  ['🇩🇴', 'Dominican Republic'], ['🇪🇨', 'Ecuador'], ['🇪🇬', 'Egypt'], ['🇸🇻', 'El Salvador'],
  ['🇬🇶', 'Equatorial Guinea'], ['🇪🇷', 'Eritrea'], ['🇪🇪', 'Estonia'], ['🇸🇿', 'Eswatini'],
  ['🇪🇹', 'Ethiopia'], ['🇫🇯', 'Fiji'], ['🇫🇮', 'Finland'], ['🇫🇷', 'France'],
  ['🇬🇦', 'Gabon'], ['🇬🇲', 'Gambia'], ['🇬🇪', 'Georgia'], ['🇩🇪', 'Germany'],
  ['🇬🇭', 'Ghana'], ['🇬🇷', 'Greece'], ['🇬🇩', 'Grenada'], ['🇬🇹', 'Guatemala'],
  ['🇬🇳', 'Guinea'], ['🇬🇼', 'Guinea-Bissau'], ['🇬🇾', 'Guyana'], ['🇭🇹', 'Haiti'],
  ['🇭🇳', 'Honduras'], ['🇭🇺', 'Hungary'], ['🇮🇸', 'Iceland'], ['🇮🇳', 'India'],
  ['🇮🇩', 'Indonesia'], ['🇮🇷', 'Iran'], ['🇮🇶', 'Iraq'], ['🇮🇪', 'Ireland'],
  ['🇮🇱', 'Israel'], ['🇮🇹', 'Italy'], ['🇯🇲', 'Jamaica'], ['🇯🇵', 'Japan'],
  ['🇯🇴', 'Jordan'], ['🇰🇿', 'Kazakhstan'], ['🇰🇪', 'Kenya'], ['🇰🇮', 'Kiribati'],
  ['🇰🇼', 'Kuwait'], ['🇰🇬', 'Kyrgyzstan'], ['🇱🇦', 'Laos'], ['🇱🇻', 'Latvia'],
  ['🇱🇧', 'Lebanon'], ['🇱🇸', 'Lesotho'], ['🇱🇷', 'Liberia'], ['🇱🇾', 'Libya'],
  ['🇱🇮', 'Liechtenstein'], ['🇱🇹', 'Lithuania'], ['🇱🇺', 'Luxembourg'], ['🇲🇬', 'Madagascar'],
  ['🇲🇼', 'Malawi'], ['🇲🇾', 'Malaysia'], ['🇲🇻', 'Maldives'], ['🇲🇱', 'Mali'],
  ['🇲🇹', 'Malta'], ['🇲🇭', 'Marshall Islands'], ['🇲🇷', 'Mauritania'], ['🇲🇺', 'Mauritius'],
  ['🇲🇽', 'Mexico'], ['🇫🇲', 'Micronesia'], ['🇲🇩', 'Moldova'], ['🇲🇨', 'Monaco'],
  ['🇲🇳', 'Mongolia'], ['🇲🇪', 'Montenegro'], ['🇲🇦', 'Morocco'], ['🇲🇿', 'Mozambique'],
  ['🇲🇲', 'Myanmar'], ['🇳🇦', 'Namibia'], ['🇳🇷', 'Nauru'], ['🇳🇵', 'Nepal'],
  ['🇳🇱', 'Netherlands'], ['🇳🇿', 'New Zealand'], ['🇳🇮', 'Nicaragua'], ['🇳🇪', 'Niger'],
  ['🇳🇬', 'Nigeria'], ['🇲🇰', 'North Macedonia'], ['🇳🇴', 'Norway'], ['🇴🇲', 'Oman'],
  ['🇵🇰', 'Pakistan'], ['🇵🇼', 'Palau'], ['🇵🇦', 'Panama'], ['🇵🇬', 'Papua New Guinea'],
  ['🇵🇾', 'Paraguay'], ['🇵🇪', 'Peru'], ['🇵🇭', 'Philippines'], ['🇵🇱', 'Poland'],
  ['🇵🇹', 'Portugal'], ['🇶🇦', 'Qatar'], ['🇷🇴', 'Romania'], ['🇷🇺', 'Russia'],
  ['🇷🇼', 'Rwanda'], ['🇰🇳', 'Saint Kitts'], ['🇱🇨', 'Saint Lucia'], ['🇻🇨', 'Saint Vincent'],
  ['🇼🇸', 'Samoa'], ['🇸🇲', 'San Marino'], ['🇸🇹', 'São Tomé'], ['🇸🇦', 'Saudi Arabia'],
  ['🇸🇳', 'Senegal'], ['🇷🇸', 'Serbia'], ['🇸🇨', 'Seychelles'], ['🇸🇱', 'Sierra Leone'],
  ['🇸🇬', 'Singapore'], ['🇸🇰', 'Slovakia'], ['🇸🇮', 'Slovenia'], ['🇸🇧', 'Solomon Islands'],
  ['🇸🇴', 'Somalia'], ['🇿🇦', 'South Africa'], ['🇸🇸', 'South Sudan'], ['🇪🇸', 'Spain'],
  ['🇱🇰', 'Sri Lanka'], ['🇸🇩', 'Sudan'], ['🇸🇷', 'Suriname'], ['🇸🇪', 'Sweden'],
  ['🇨🇭', 'Switzerland'], ['🇸🇾', 'Syria'], ['🇹🇼', 'Taiwan'], ['🇹🇯', 'Tajikistan'],
  ['🇹🇿', 'Tanzania'], ['🇹🇭', 'Thailand'], ['🇹🇱', 'Timor-Leste'], ['🇹🇬', 'Togo'],
  ['🇹🇴', 'Tonga'], ['🇹🇹', 'Trinidad and Tobago'], ['🇹🇳', 'Tunisia'], ['🇹🇷', 'Turkey'],
  ['🇹🇲', 'Turkmenistan'], ['🇹🇻', 'Tuvalu'], ['🇺🇬', 'Uganda'], ['🇺🇦', 'Ukraine'],
  ['🇦🇪', 'UAE'], ['🇬🇧', 'United Kingdom'], ['🇺🇸', 'United States'], ['🇺🇾', 'Uruguay'],
  ['🇺🇿', 'Uzbekistan'], ['🇻🇺', 'Vanuatu'], ['🇻🇪', 'Venezuela'], ['🇻🇳', 'Vietnam'],
  ['🇾🇪', 'Yemen'], ['🇿🇲', 'Zambia'], ['🇿🇼', 'Zimbabwe'],
];

export function FlagPicker({ onSelect, onClose }: FlagPickerProps) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? FLAGS.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))
    : FLAGS;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0ede8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            autoFocus
            placeholder="Search country…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          />
          <button onClick={onClose} style={{ fontSize: 20, color: '#aaa', padding: '0 4px' }} aria-label="Close flag picker">×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))', gap: 2 }}>
          {filtered.map(([flag, name]) => (
            <button
              key={flag}
              title={name}
              onClick={() => { onSelect(flag, name); onClose(); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', borderRadius: 8, fontSize: 22, lineHeight: 1, gap: 2 }}
            >
              {flag}
              <span style={{ fontSize: 9, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#bbb', fontSize: 13, padding: 20 }}>No results</div>
          )}
        </div>
      </div>
    </div>
  );
}
