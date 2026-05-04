import { describe, it, expect } from 'vitest';
import { uid, initials } from './avatar';

describe('uid', () => {
  it('returns a non-empty string', () => expect(typeof uid()).toBe('string'));
  it('generates unique values', () => expect(uid()).not.toBe(uid()));
});

describe('initials', () => {
  it('returns single initial for one word', () => expect(initials('Alice')).toBe('A'));
  it('returns first+last initials for two words', () => expect(initials('John Doe')).toBe('JD'));
  it('returns first+last initials for three words', () => expect(initials('Mary Jane Watson')).toBe('MW'));
  it('returns ? for empty string', () => expect(initials('')).toBe('?'));
  it('handles extra whitespace', () => expect(initials('  Bob  ')).toBe('B'));
  it('uppercases initials', () => expect(initials('alice bob')).toBe('AB'));
});
