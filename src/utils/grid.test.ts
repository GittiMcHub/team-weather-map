import { describe, it, expect } from 'vitest';
import { getCols } from './grid';
import { DEFAULT_COL_CONFIG } from '../constants';

const cfg = DEFAULT_COL_CONFIG; // xs:1 sm:2 md:3 lg:4

describe('getCols', () => {
  it('returns xs cols below sm breakpoint', () => expect(getCols(320, cfg)).toBe(1));
  it('returns sm cols at sm breakpoint', () => expect(getCols(480, cfg)).toBe(2));
  it('returns md cols at md breakpoint', () => expect(getCols(768, cfg)).toBe(3));
  it('returns lg cols at lg breakpoint', () => expect(getCols(1024, cfg)).toBe(4));
  it('returns lg cols above lg breakpoint', () => expect(getCols(1440, cfg)).toBe(4));
});
