import { describe, it, expect } from 'vitest';
import { weatherInfo, weekendVibe, weatherAnimationClass, weekendAnimationCode } from './weather';
import type { WeekendDayData } from '../types';

describe('weatherInfo', () => {
  it('returns Clear for code 0', () => expect(weatherInfo(0).label).toBe('Clear'));
  it('returns Partly cloudy for codes 1-3', () => {
    expect(weatherInfo(1).label).toBe('Partly cloudy');
    expect(weatherInfo(3).label).toBe('Partly cloudy');
  });
  it('returns Cloudy for codes 4-48', () => {
    expect(weatherInfo(4).label).toBe('Cloudy');
    expect(weatherInfo(48).label).toBe('Cloudy');
  });
  it('returns Rain for codes 49-67', () => {
    expect(weatherInfo(49).label).toBe('Rain');
    expect(weatherInfo(67).label).toBe('Rain');
  });
  it('returns Snow for codes 68-77', () => {
    expect(weatherInfo(68).label).toBe('Snow');
    expect(weatherInfo(77).label).toBe('Snow');
  });
  it('returns Showers for codes 78-82', () => {
    expect(weatherInfo(80).label).toBe('Showers');
  });
  it('returns Thunderstorm for codes 83-99', () => {
    expect(weatherInfo(95).label).toBe('Thunderstorm');
  });
  it('returns Unknown for out-of-range codes', () => {
    expect(weatherInfo(100).label).toBe('Unknown');
  });
});

const day = (code: number, temp: number, tempMin = temp - 5): WeekendDayData => ({
  code, temp, tempMin, date: '2026-01-01',
});

describe('weekendVibe', () => {
  it('returns no-data when both are nullish', () => {
    expect(weekendVibe(null, null).text).toBe('No data');
    expect(weekendVibe(undefined, undefined).text).toBe('No data');
  });
  it('returns Perfect for clear + warm', () => {
    expect(weekendVibe(day(0, 22), day(0, 24)).text).toBe('Perfect!');
  });
  it('returns Sunny for clear but cool', () => {
    expect(weekendVibe(day(0, 10), day(0, 12)).text).toBe('Sunny!');
  });
  it('returns Pretty nice for partly cloudy and warm', () => {
    expect(weekendVibe(day(2, 18), day(1, 20)).text).toBe('Pretty nice');
  });
  it('returns Rained out for heavy rain', () => {
    expect(weekendVibe(day(60, 15), day(65, 14)).text).toBe('Rained out');
  });
  it('works with only Saturday', () => {
    const result = weekendVibe(day(0, 25), undefined);
    expect(result.text).not.toBe('No data');
  });
  it('works with only Sunday', () => {
    const result = weekendVibe(null, day(0, 25));
    expect(result.text).not.toBe('No data');
  });

  // Regression: showers (80) + rain (63) averaged to 71 (snow bucket) before fix
  it('does not return Snowy for showers+rain at tropical temps', () => {
    const result = weekendVibe(day(80, 36), day(63, 34));
    expect(result.text).not.toBe('Snowy');
  });

  // Regression: thunderstorm (95) + rain (63) must not land in snow bucket
  it('does not return Snowy for thunderstorm+rain at high temps', () => {
    const result = weekendVibe(day(95, 36), day(63, 34));
    expect(result.text).not.toBe('Snowy');
  });

  it('returns Snowy for actual snow codes at cold temps (Ladakh-like)', () => {
    expect(weekendVibe(day(71, 2, -10), day(73, 2, -10)).text).toBe('Snowy');
  });

  it('returns Stormy for two thunderstorm days', () => {
    expect(weekendVibe(day(95, 28), day(99, 26)).text).toBe('Stormy');
  });

  it('returns Showery for mixed showers weekend', () => {
    expect(weekendVibe(day(80, 18), day(82, 17)).text).toBe('Showery');
  });
});

describe('weatherAnimationClass', () => {
  it('returns wx-sunny for codes 0-3', () => {
    expect(weatherAnimationClass(0)).toBe('wx-sunny');
    expect(weatherAnimationClass(3)).toBe('wx-sunny');
  });
  it('returns wx-cloudy for codes 4-48', () => {
    expect(weatherAnimationClass(4)).toBe('wx-cloudy');
    expect(weatherAnimationClass(48)).toBe('wx-cloudy');
  });
  it('returns wx-rainy for rain codes 49-67', () => {
    expect(weatherAnimationClass(49)).toBe('wx-rainy');
    expect(weatherAnimationClass(67)).toBe('wx-rainy');
  });
  it('returns wx-snowy for codes 68-77', () => {
    expect(weatherAnimationClass(68)).toBe('wx-snowy');
    expect(weatherAnimationClass(77)).toBe('wx-snowy');
  });
  it('returns wx-rainy for shower codes 78-82', () => {
    expect(weatherAnimationClass(78)).toBe('wx-rainy');
    expect(weatherAnimationClass(82)).toBe('wx-rainy');
  });
  it('returns wx-stormy for codes 83-99', () => {
    expect(weatherAnimationClass(83)).toBe('wx-stormy');
    expect(weatherAnimationClass(99)).toBe('wx-stormy');
  });
  it('returns empty string for null and undefined', () => {
    expect(weatherAnimationClass(null)).toBe('');
    expect(weatherAnimationClass(undefined)).toBe('');
  });
});

describe('weekendAnimationCode', () => {
  it('returns sat code when sat has higher severity', () => {
    expect(weekendAnimationCode(day(95, 20), day(0, 20))).toBe(95);
  });
  it('returns sun code when sun has higher severity', () => {
    expect(weekendAnimationCode(day(0, 20), day(80, 18))).toBe(80);
  });
  it('returns sat code when severities are equal', () => {
    expect(weekendAnimationCode(day(60, 15), day(65, 14))).toBe(60);
  });
  it('returns sat code when sun is null', () => {
    expect(weekendAnimationCode(day(45, 10), null)).toBe(45);
  });
  it('returns sun code when sat is undefined', () => {
    expect(weekendAnimationCode(undefined, day(80, 18))).toBe(80);
  });
  it('returns null when both are null/undefined', () => {
    expect(weekendAnimationCode(null, null)).toBeNull();
    expect(weekendAnimationCode(undefined, undefined)).toBeNull();
  });
});
