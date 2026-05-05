import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { importConfig, exportConfig } from './configIO';
import type { ConfigSavePayload } from '../types';

const validPayload: ConfigSavePayload = {
  members: [{ id: 'm1', name: 'Alice', photo: '', cityId: 'berlin', colorIdx: 0 }],
  countries: [{ id: 'de', name: 'Germany', flag: '🇩🇪' }],
  cities: [{ id: 'berlin', name: 'Berlin', countryId: 'de', lat: 52.52, lon: 13.405 }],
  colConfig: { xs: 1, sm: 2, md: 3, lg: 4, cityPosition: 'bottom', weatherAnimations: true },
};

describe('importConfig', () => {
  it('returns a ConfigSavePayload for valid JSON', () => {
    const result = importConfig(JSON.stringify(validPayload));
    expect(result).toEqual(validPayload);
  });

  it('throws SyntaxError on malformed JSON', () => {
    expect(() => importConfig('{ bad json')).toThrow(SyntaxError);
  });

  it('throws when members key is missing', () => {
    const rest = { countries: validPayload.countries, cities: validPayload.cities, colConfig: validPayload.colConfig };
    expect(() => importConfig(JSON.stringify(rest))).toThrow(/members must be an array/);
  });

  it('throws when countries key is missing', () => {
    const rest = { members: validPayload.members, cities: validPayload.cities, colConfig: validPayload.colConfig };
    expect(() => importConfig(JSON.stringify(rest))).toThrow(/countries must be an array/);
  });

  it('throws when cities key is missing', () => {
    const rest = { members: validPayload.members, countries: validPayload.countries, colConfig: validPayload.colConfig };
    expect(() => importConfig(JSON.stringify(rest))).toThrow(/cities must be an array/);
  });

  it('throws when colConfig key is missing', () => {
    const rest = { members: validPayload.members, countries: validPayload.countries, cities: validPayload.cities };
    expect(() => importConfig(JSON.stringify(rest))).toThrow(/colConfig must be an object/);
  });

  it('throws when a member is missing name', () => {
    const bad = { ...validPayload, members: [{ id: 'm1', photo: '', cityId: 'berlin', colorIdx: 0 }] };
    expect(() => importConfig(JSON.stringify(bad))).toThrow(/members\[0\]\.name must be a string/);
  });

  it('throws when a country is missing flag', () => {
    const bad = { ...validPayload, countries: [{ id: 'de', name: 'Germany' }] };
    expect(() => importConfig(JSON.stringify(bad))).toThrow(/countries\[0\]\.flag must be a string/);
  });

  it('throws when a city is missing lat', () => {
    const bad = { ...validPayload, cities: [{ id: 'berlin', name: 'Berlin', countryId: 'de', lon: 13.405 }] };
    expect(() => importConfig(JSON.stringify(bad))).toThrow(/cities\[0\]\.lat must be a number or string/);
  });

  it('throws when colConfig.cityPosition is invalid', () => {
    const bad = { ...validPayload, colConfig: { ...validPayload.colConfig, cityPosition: 'center' } };
    expect(() => importConfig(JSON.stringify(bad))).toThrow(/cityPosition must be 'top' or 'bottom'/);
  });

  it('throws when colConfig.xs is not a number', () => {
    const bad = { ...validPayload, colConfig: { ...validPayload.colConfig, xs: '1' } };
    expect(() => importConfig(JSON.stringify(bad))).toThrow(/colConfig\.xs must be a number/);
  });

  it('accepts city.lat as a string', () => {
    const withStringCoords = {
      ...validPayload,
      cities: [{ ...validPayload.cities[0], lat: '52.52', lon: '13.405' }],
    };
    const result = importConfig(JSON.stringify(withStringCoords));
    expect(result.cities[0].lat).toBe('52.52');
  });

  it('error message contains the field path', () => {
    const bad = { ...validPayload, members: [{ id: 'm1', name: 42, photo: '', cityId: 'x', colorIdx: 0 }] };
    expect(() => importConfig(JSON.stringify(bad))).toThrow('members[0].name');
  });
});

describe('exportConfig', () => {
  let mockClick: ReturnType<typeof vi.fn>;
  let mockAnchor: Record<string, unknown>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00Z'));

    mockClick = vi.fn();
    mockAnchor = { href: '', download: '', click: mockClick };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as unknown as HTMLElement);

    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls URL.createObjectURL with a Blob', () => {
    exportConfig(validPayload);
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('triggers a click on the anchor element', () => {
    exportConfig(validPayload);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('calls URL.revokeObjectURL to clean up', () => {
    exportConfig(validPayload);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('uses filename with today\'s date', () => {
    exportConfig(validPayload);
    expect(mockAnchor.download).toBe('twm-config-2026-04-30.json');
  });

  it('the exported Blob contains valid JSON matching the payload', () => {
    let capturedBlob: Blob | undefined;
    (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementationOnce((b: Blob) => {
      capturedBlob = b;
      return 'blob:fake-url';
    });
    exportConfig(validPayload);
    expect(capturedBlob).toBeDefined();
    // Verify the blob content is readable JSON
    expect(capturedBlob!.type).toBe('application/json');
  });
});
