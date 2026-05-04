import type { WeatherInfo, VibeInfo, WeekendDayData } from '../types';

export function weatherInfo(code: number): WeatherInfo {
  if (code === 0)                         return { icon: '☀️',  label: 'Clear' };
  if (code <= 3)                          return { icon: '⛅',  label: 'Partly cloudy' };
  if (code <= 48)                         return { icon: '☁️',  label: 'Cloudy' };
  if (code <= 67)                         return { icon: '🌧️', label: 'Rain' };
  if (code <= 77)                         return { icon: '❄️',  label: 'Snow' };
  if (code <= 82)                         return { icon: '🌦️', label: 'Showers' };
  if (code <= 99)                         return { icon: '⛈️',  label: 'Thunderstorm' };
  return { icon: '🌡️', label: 'Unknown' };
}

export function weekendVibe(
  sat: WeekendDayData | null | undefined,
  sun: WeekendDayData | null | undefined,
): VibeInfo {
  if (!sat && !sun) return { emoji: '❓', text: 'No data' };

  const codes = [sat?.code, sun?.code].filter((c): c is number => c !== undefined);
  const avgCode = codes.reduce((a, b) => a + b, 0) / codes.length;
  const temps = [sat?.temp, sun?.temp].filter((t): t is number => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  if (avgCode === 0 && avgTemp >= 20) return { emoji: '🎉', text: 'Perfect!' };
  if (avgCode === 0)                  return { emoji: '☀️', text: 'Sunny!' };
  if (avgCode <= 3 && avgTemp >= 15)  return { emoji: '😊', text: 'Pretty nice' };
  if (avgCode <= 3)                   return { emoji: '🙂', text: 'Not bad' };
  if (avgCode <= 48)                  return { emoji: '😐', text: 'Bit grey' };
  if (avgCode <= 67)                  return { emoji: '😩', text: 'Rained out' };
  if (avgCode <= 77)                  return { emoji: '🥶', text: 'Snowy' };
  if (avgCode <= 82)                  return { emoji: '🌦️', text: 'Showery' };
  return { emoji: '⛈️', text: 'Stormy' };
}
