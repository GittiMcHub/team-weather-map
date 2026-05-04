import { useState } from 'react';
import type { TeamMember, City } from '../../types';
import { uid } from '../../utils/avatar';
import { AVATAR_COLORS } from '../../constants';
import { Avatar } from '../ui/Avatar';
import { Field } from '../ui/Field';
import { PhotoCropper } from './PhotoCropper';

interface TabTeamProps {
  members: TeamMember[];
  cities: City[];
  onChange: (members: TeamMember[]) => void;
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%',
};

export function TabTeam({ members, cities, onChange }: TabTeamProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const editing = members.find(m => m.id === editId) ?? null;

  const updateMember = (id: string, patch: Partial<TeamMember>) =>
    onChange(members.map(m => m.id === id ? { ...m, ...patch } : m));

  const addMember = () => {
    const m: TeamMember = { id: uid(), name: 'New member', photo: '', cityId: cities[0]?.id ?? '', colorIdx: members.length % AVATAR_COLORS.length };
    onChange([...members, m]);
    setEditId(m.id);
  };

  const removeMember = (id: string) => {
    onChange(members.filter(m => m.id !== id));
    if (editId === id) setEditId(null);
  };

  const listPanelStyle: React.CSSProperties = {
    width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column',
    border: '1px solid #f0ede8', borderRadius: 12, overflow: 'hidden', maxHeight: 340,
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Left pane — member list */}
      <div style={listPanelStyle}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { setEditId(editId === m.id ? null : m.id); setShowCropper(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                textAlign: 'left', width: '100%',
                background: editId === m.id ? '#f5f3f0' : i % 2 === 0 ? '#fff' : '#fafaf9',
                borderBottom: '1px solid #f0ede8',
                fontWeight: editId === m.id ? 600 : 400,
              }}
            >
              <Avatar name={m.name} photo={m.photo} colorIdx={m.colorIdx} size={28} />
              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={addMember}
          style={{ padding: '10px 12px', fontSize: 13, color: '#666', borderTop: members.length > 0 ? '1px solid #f0ede8' : undefined, textAlign: 'left' }}
        >
          + Add member
        </button>
      </div>

      {/* Right pane — detail / cropper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!editing && (
          <div style={{ color: '#bbb', fontSize: 13, paddingTop: 20 }}>Select a member to edit</div>
        )}

        {editing && !showCropper && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Name">
              <input style={inputStyle} value={editing.name} onChange={e => updateMember(editing.id, { name: e.target.value })} />
            </Field>
            <Field label="City">
              <select style={inputStyle} value={editing.cityId} onChange={e => updateMember(editing.id, { cityId: e.target.value })}>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Avatar colour">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {AVATAR_COLORS.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => updateMember(editing.id, { colorIdx: idx })}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: color, border: editing.colorIdx === idx ? '2.5px solid #333' : '2px solid transparent' }}
                    aria-label={`Color ${idx}`}
                  />
                ))}
              </div>
            </Field>
            <button
              onClick={() => setShowCropper(true)}
              style={{ alignSelf: 'flex-start', fontSize: 12, color: '#555', textDecoration: 'underline', background: 'none' }}
            >
              {editing.photo ? 'Change photo' : 'Add photo'}
            </button>
            <button
              onClick={() => removeMember(editing.id)}
              style={{ alignSelf: 'flex-start', marginTop: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid #e57373', color: '#e57373', fontSize: 13 }}
            >
              Remove member
            </button>
          </div>
        )}

        {editing && showCropper && (
          <PhotoCropper
            onCrop={url => { updateMember(editing.id, { photo: url }); setShowCropper(false); }}
            onCancel={() => setShowCropper(false)}
          />
        )}
      </div>
    </div>
  );
}
