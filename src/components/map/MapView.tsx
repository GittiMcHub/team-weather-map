import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet-marker.css';
import type { City, Country, TeamMember, WeatherMap } from '../../types';
import { weatherInfo, weatherAnimationClass } from '../../utils/weather';
import { initials } from '../../utils/avatar';
import { AVATAR_COLORS as COLORS } from '../../constants';

// Vite-safe Leaflet icon fix (app uses L.divIcon exclusively, this is defensive)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const TILE_W = 150;
const TILE_H = 90;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const TILE_INIT_OFFSET_Y = 65;
const SEP_PAD = 14;

type Pt = { x: number; y: number };

function separateTiles(dots: Pt[]): Pt[] {
  const tiles = dots.map(p => ({ x: p.x, y: p.y - TILE_INIT_OFFSET_Y }));
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const a = tiles[i], b = tiles[j];
        const ox = TILE_W + SEP_PAD - Math.abs(a.x - b.x);
        const oy = TILE_H + SEP_PAD - Math.abs(a.y - b.y);
        if (ox > 0 && oy > 0) {
          if (ox <= oy) {
            const d = (ox / 2 + 0.5) * (b.x >= a.x ? 1 : -1);
            a.x -= d; b.x += d;
          } else {
            const d = (oy / 2 + 0.5) * (b.y >= a.y ? 1 : -1);
            a.y -= d; b.y += d;
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return tiles;
}

type CityEntry = {
  lat: number; lon: number;
  flag: string; name: string;
  temp: number | null; code: number | null;
  cityMembers: TeamMember[];
};

// Updates layersRef.current synchronously before any fitBounds call to prevent
// duplicate markers when Leaflet fires zoomend synchronously inside fitBounds.
// Returns bounds for caller to fitBounds on, or null if no valid cities.
function buildMapMarkers(
  map: L.Map,
  layersRef: { current: L.Layer[] },
  cities: City[],
  countries: Country[],
  members: TeamMember[],
  weather: WeatherMap,
  animationsEnabled: boolean,
): L.LatLngBounds | null {
  layersRef.current.forEach(l => l.remove());

  const entries: CityEntry[] = [];
  for (const city of cities) {
    const lat = parseFloat(String(city.lat));
    const lon = parseFloat(String(city.lon));
    if (isNaN(lat) || isNaN(lon)) continue;
    const w = weather[city.id];
    const country = countries.find(c => c.id === city.countryId);
    entries.push({
      lat, lon,
      flag: country?.flag ?? '',
      name: city.name,
      temp: w?.temp ?? null,
      code: w?.code ?? null,
      cityMembers: members.filter(m => m.cityId === city.id),
    });
  }

  if (entries.length === 0) {
    layersRef.current = [];
    return null;
  }

  const dotPx = entries.map(e => {
    const pt = map.latLngToContainerPoint([e.lat, e.lon]);
    return { x: pt.x, y: pt.y };
  });

  const tilePx = separateTiles(dotPx);
  const newLayers: L.Layer[] = [];

  entries.forEach((e, i) => {
    const dp = dotPx[i];
    const tp = tilePx[i];

    const dot = L.circleMarker([e.lat, e.lon], {
      radius: 4,
      color: '#fff',
      fillColor: '#2563eb',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);
    newLayers.push(dot);

    const tileLL = map.containerPointToLatLng([tp.x, tp.y]);

    if (Math.hypot(tp.x - dp.x, tp.y - dp.y) > 12) {
      const line = L.polyline([[e.lat, e.lon], [tileLL.lat, tileLL.lng]], {
        color: '#2563eb',
        weight: 1.5,
        opacity: 0.45,
        dashArray: '4 4',
      }).addTo(map);
      newLayers.push(line);
    }

    const info = e.code !== null ? weatherInfo(e.code) : null;
    const animClass = animationsEnabled ? weatherAnimationClass(e.code) : '';
    const avatarHtml = e.cityMembers.slice(0, 6).map(m => {
      const color = COLORS[m.colorIdx % COLORS.length];
      return m.photo
        ? `<div class="weather-marker-avatar" style="background:${color}"><img src="${m.photo}" alt="${escapeHtml(m.name)}"/></div>`
        : `<div class="weather-marker-avatar" style="background:${color}">${initials(m.name)}</div>`;
    }).join('');

    const tileHtml = `<div class="map-tile${animClass ? ' ' + animClass : ''}">
      <div class="map-tile-header">
        <span class="map-tile-flag">${escapeHtml(e.flag)}</span>
        <span class="map-tile-city">${escapeHtml(e.name)}</span>
      </div>
      <div class="map-tile-weather">
        <span class="map-tile-icon">${info?.icon ?? '🌡️'}</span>
        <span class="map-tile-temp">${e.temp !== null ? `${e.temp}°` : '…'}</span>
      </div>
      ${avatarHtml ? `<div class="map-tile-avatars">${avatarHtml}</div>` : ''}
    </div>`;

    const icon = L.divIcon({
      html: tileHtml,
      className: '',
      iconSize: [TILE_W, TILE_H],
      iconAnchor: [TILE_W / 2, TILE_H / 2],
    });
    const marker = L.marker([tileLL.lat, tileLL.lng], { icon }).addTo(map);
    newLayers.push(marker);
  });

  // Update ref before returning so any synchronous event handlers (e.g. zoomend
  // fired by the caller's fitBounds) see the new layer list.
  layersRef.current = newLayers;

  return L.latLngBounds(entries.map(e => [e.lat, e.lon] as [number, number]));
}

interface MapViewProps {
  cities: City[];
  countries: Country[];
  members: TeamMember[];
  weather: WeatherMap;
  visible: boolean;
  animationsEnabled: boolean;
}

export function MapView({ cities, countries, members, weather, visible, animationsEnabled }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const dataRef = useRef({ cities, countries, members, weather, animationsEnabled });
  dataRef.current = { cities, countries, members, weather, animationsEnabled };

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([30, 10], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    map.on('zoomend', () => {
      const { cities, countries, members, weather, animationsEnabled: anim } = dataRef.current;
      buildMapMarkers(map, layersRef, cities, countries, members, weather, anim);
      // no fitBounds — user-triggered zoom, don't reset view
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Invalidate size + redraw when tab becomes visible.
  // fitBounds must run here too: the data effect may have called fitBounds while the
  // container was display:none (0×0 px), producing a wrong zoom. invalidateSize() gives
  // Leaflet the real dimensions; the subsequent fitBounds then sets the correct zoom.
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      map.invalidateSize();
      const { cities, countries, members, weather } = dataRef.current;
      const bounds = buildMapMarkers(map, layersRef, cities, countries, members, weather, animationsEnabled);
      if (bounds) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
      }
    }, 50);
    return () => clearTimeout(id);
  }, [visible, animationsEnabled]);

  // Rebuild + fit bounds when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // fitBounds called AFTER buildMapMarkers updates layersRef, so any
    // synchronous zoomend from fitBounds sees the correct layer list.
    const bounds = buildMapMarkers(map, layersRef, cities, countries, members, weather, animationsEnabled);
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
    }
  }, [cities, countries, members, weather, animationsEnabled]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      data-testid="map-container"
    />
  );
}
