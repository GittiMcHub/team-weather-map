import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

beforeEach(() => localStorage.clear());

describe('useLocalStorage', () => {
  it('returns fallback when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify(99));
    const { result } = renderHook(() => useLocalStorage('key', 0));
    expect(result.current[0]).toBe(99);
  });

  it('writes value to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0));
    act(() => result.current[1](7));
    expect(JSON.parse(localStorage.getItem('key')!)).toBe(7);
    expect(result.current[0]).toBe(7);
  });

  it('returns fallback on JSON.parse failure', () => {
    localStorage.setItem('key', 'not-valid-json{');
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('arr', []));
    act(() => result.current[1]([1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });
});
