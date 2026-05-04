import type { Country, City, ColConfig } from '../types';

export const LS_KEYS = {
  MEMBERS:       'twm-members',
  COUNTRIES:     'twm-countries',
  CITIES:        'twm-cities',
  COLS:          'twm-cols',
  WEATHER_CACHE: 'twm-weather-cache',
  WEEKEND_CACHE: 'twm-weekend-cache',
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
} as const;

export const AVATAR_COLORS = [
  '#e57373', '#f06292', '#ba68c8', '#9575cd',
  '#7986cb', '#64b5f6', '#4dd0e1', '#4db6ac',
  '#81c784', '#aed581', '#ffd54f', '#ffb74d',
  '#a1887f', '#90a4ae',
];

export const DEFAULT_COL_CONFIG: ColConfig = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  cityPosition: 'bottom',
};

export const DEFAULT_COUNTRIES: Country[] = [
  { id: 'de', name: 'Germany',        flag: '🇩🇪' },
  { id: 'us', name: 'United States',  flag: '🇺🇸' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'fr', name: 'France',         flag: '🇫🇷' },
  { id: 'jp', name: 'Japan',          flag: '🇯🇵' },
];

export const DEFAULT_CITIES: City[] = [
  { id: 'berlin',    name: 'Berlin',    country: 'de', lat: 52.52,   lon: 13.405  },
  { id: 'newyork',  name: 'New York',  country: 'us', lat: 40.7128, lon: -74.006 },
  { id: 'london',   name: 'London',    country: 'gb', lat: 51.5074, lon: -0.1278 },
  { id: 'paris',    name: 'Paris',     country: 'fr', lat: 48.8566, lon: 2.3522  },
  { id: 'tokyo',    name: 'Tokyo',     country: 'jp', lat: 35.6762, lon: 139.6503},
];
