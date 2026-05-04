import { describe, it, expect } from 'vitest';
import { weatherInfo, weekendVibe } from './weather';
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

const day = (code: number, temp: number): WeekendDayData => ({
  code, temp, tempMin: temp - 5, date: '2026-01-01',
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
});
