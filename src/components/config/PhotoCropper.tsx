import { useState, useRef, useEffect } from 'react';

interface PhotoCropperProps {
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}

export function PhotoCropper({ onCrop, onCancel }: PhotoCropperProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const SIZE = 200;

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    const s = Math.min(SIZE / img.naturalWidth, SIZE / img.naturalHeight) * scale;
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (SIZE - w) / 2 + offset.x, (SIZE - h) / 2 + offset.y, w, h);
  };

  useEffect(() => { draw(); });

  const loadUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; setImgSrc(url); setOffset({ x: 0, y: 0 }); setScale(1); };
    img.src = url;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => loadUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };

  const handleSave = () => {
    draw();
    const url = canvasRef.current?.toDataURL('image/jpeg', 0.72) ?? '';
    if (url) onCrop(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="file" accept="image/*" onChange={onFileChange} data-testid="photo-file-input" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>or URL</span>
        <input
          type="url"
          placeholder="Paste image URL"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onBlur={() => urlInput && loadUrl(urlInput)}
          style={{ flex: 1, minWidth: 0, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
        />
      </div>

      <div
        style={{ width: SIZE, height: SIZE, overflow: 'hidden', borderRadius: '50%', cursor: imgSrc ? 'grab' : 'default', border: '2px solid #ddd', alignSelf: 'center', background: '#f5f3f0' }}
        onMouseDown={imgSrc ? onMouseDown : undefined}
        onMouseMove={imgSrc ? onMouseMove : undefined}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
      >
        <canvas ref={canvasRef} width={SIZE} height={SIZE} />
      </div>

      {imgSrc && (
        <input type="range" min={0.5} max={3} step={0.05} value={scale} onChange={e => setScale(Number(e.target.value))} aria-label="zoom" />
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>Cancel</button>
        <button
          onClick={handleSave}
          disabled={!imgSrc}
          data-testid="photo-crop-save"
          style={{ padding: '6px 14px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 13, opacity: imgSrc ? 1 : 0.4 }}
        >
          Use photo
        </button>
      </div>
    </div>
  );
}
