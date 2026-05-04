export interface Country {
  id: string;
  name: string;
  flag: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number | string;
  lon: number | string;
}

export interface TeamMember {
  id: string;
  name: string;
  photo: string;
  cityId: string;
  colorIdx: number;
}

export interface ColConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  cityPosition: 'top' | 'bottom';
}

export interface WeatherData {
  temp: number;
  code: number;
}

export interface WeekendDayData {
  temp: number;
  tempMin: number;
  code: number;
  date: string;
}

export interface WeekendData {
  sat?: WeekendDayData;
  sun?: WeekendDayData;
}

export type WeatherMap = Record<string, WeatherData | null>;
export type WeekendMap = Record<string, WeekendData | null>;

export interface WeatherInfo {
  label: string;
  icon: string;
}

export interface VibeInfo {
  emoji: string;
  text: string;
}

export interface ConfigSavePayload {
  members: TeamMember[];
  countries: Country[];
  cities: City[];
  colConfig: ColConfig;
}
