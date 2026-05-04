import { useState } from 'react';
import { initials } from '../../utils/avatar';
import { AVATAR_COLORS } from '../../constants';

interface AvatarProps {
  name: string;
  photo: string;
  colorIdx: number;
  size?: number;
}

export function Avatar({ name, photo, colorIdx, size = 36 }: AvatarProps) {
  const [imgErr, setImgErr] = useState(false);
  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: size * 0.38,
    overflow: 'hidden',
    flexShrink: 0,
  };

  if (photo && !imgErr) {
    return (
      <div style={style}>
        <img
          src={photo}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }

  return (
    <div style={style} aria-label={name}>
      {initials(name)}
    </div>
  );
}
