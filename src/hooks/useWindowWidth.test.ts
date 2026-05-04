import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowWidth } from './useWindowWidth';

describe('useWindowWidth', () => {
  it('returns the current window.innerWidth', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1200);
  });

  it('updates when resize event fires', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    const { result } = renderHook(() => useWindowWidth());
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(400);
  });

  it('removes the resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowWidth());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });
});
