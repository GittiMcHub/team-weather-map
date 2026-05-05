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

// WMO codes are categorical, not ordinal — averaging raw codes across categories
// produces nonsense (e.g. avg(showers=80, rain=63) = 71 → snow bucket).
// Map each code to a severity integer first, then average those.
function codeSeverity(code: number): number {
  if (code === 0)  return 0; // clear
  if (code <= 3)   return 1; // partly cloudy
  if (code <= 48)  return 2; // cloudy / fog
  if (code <= 67)  return 3; // rain / drizzle
  if (code <= 77)  return 4; // snow
  if (code <= 82)  return 5; // showers
  return 6;                  // thunderstorm
}

export function weekendVibe(
  sat: WeekendDayData | null | undefined,
  sun: WeekendDayData | null | undefined,
): VibeInfo {
  if (!sat && !sun) return { emoji: '❓', text: 'No data' };

  const severities = [sat?.code, sun?.code]
    .filter((c): c is number => c !== undefined)
    .map(codeSeverity);
  // Good-weather vibes need both days to be nice → use average.
  // Bad-weather vibes are defined by the worst day → use max.
  const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
  const maxSeverity = Math.max(...severities);

  const temps = [sat?.temp, sun?.temp].filter((t): t is number => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  if (avgSeverity === 0 && avgTemp >= 20) return { emoji: '🎉', text: 'Perfect!' };
  if (avgSeverity === 0)                  return { emoji: '☀️', text: 'Sunny!' };
  if (avgSeverity <= 1 && avgTemp >= 15)  return { emoji: '😊', text: 'Pretty nice' };
  if (avgSeverity <= 1)                   return { emoji: '🙂', text: 'Not bad' };
  if (maxSeverity <= 2)                   return { emoji: '😐', text: 'Bit grey' };
  if (maxSeverity <= 3)                   return { emoji: '😩', text: 'Rained out' };
  if (maxSeverity <= 4)                   return { emoji: '🥶', text: 'Snowy' };
  if (maxSeverity <= 5)                   return { emoji: '🌦️', text: 'Showery' };
  return { emoji: '⛈️', text: 'Stormy' };
}

export function weatherAnimationClass(code: number | null | undefined): string {
  if (code == null) return '';
  if (code <= 3)  return 'wx-sunny';
  if (code <= 48) return 'wx-cloudy';
  if (code <= 67) return 'wx-rainy';
  if (code <= 77) return 'wx-snowy';
  if (code <= 82) return 'wx-rainy';
  return 'wx-stormy';
}

export function weekendAnimationCode(
  sat: WeekendDayData | null | undefined,
  sun: WeekendDayData | null | undefined,
): number | null {
  const satSev = sat?.code != null ? codeSeverity(sat.code) : -1;
  const sunSev = sun?.code != null ? codeSeverity(sun.code) : -1;
  if (satSev === -1 && sunSev === -1) return null;
  return satSev >= sunSev ? sat!.code : sun!.code;
}
