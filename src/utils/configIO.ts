import type { ConfigSavePayload, TeamMember, Country, City, ColConfig } from '../types';

function assertString(val: unknown, path: string): asserts val is string {
  if (typeof val !== 'string') throw new Error(`Invalid config: ${path} must be a string`);
}

function assertNumber(val: unknown, path: string): asserts val is number {
  if (typeof val !== 'number') throw new Error(`Invalid config: ${path} must be a number`);
}

function assertArray(val: unknown, path: string): asserts val is unknown[] {
  if (!Array.isArray(val)) throw new Error(`Invalid config: ${path} must be an array`);
}

function assertObject(val: unknown, path: string): asserts val is Record<string, unknown> {
  if (typeof val !== 'object' || val === null || Array.isArray(val))
    throw new Error(`Invalid config: ${path} must be an object`);
}

function validateMember(val: unknown, i: number): TeamMember {
  assertObject(val, `members[${i}]`);
  assertString(val.id, `members[${i}].id`);
  assertString(val.name, `members[${i}].name`);
  assertString(val.photo, `members[${i}].photo`);
  assertString(val.cityId, `members[${i}].cityId`);
  assertNumber(val.colorIdx, `members[${i}].colorIdx`);
  return val as unknown as TeamMember;
}

function validateCountry(val: unknown, i: number): Country {
  assertObject(val, `countries[${i}]`);
  assertString(val.id, `countries[${i}].id`);
  assertString(val.name, `countries[${i}].name`);
  assertString(val.flag, `countries[${i}].flag`);
  return val as unknown as Country;
}

function validateCity(val: unknown, i: number): City {
  assertObject(val, `cities[${i}]`);
  assertString(val.id, `cities[${i}].id`);
  assertString(val.name, `cities[${i}].name`);
  assertString(val.countryId, `cities[${i}].countryId`);
  if (typeof val.lat !== 'number' && typeof val.lat !== 'string')
    throw new Error(`Invalid config: cities[${i}].lat must be a number or string`);
  if (typeof val.lon !== 'number' && typeof val.lon !== 'string')
    throw new Error(`Invalid config: cities[${i}].lon must be a number or string`);
  return val as unknown as City;
}

function validateColConfig(val: unknown): ColConfig {
  assertObject(val, 'colConfig');
  assertNumber(val.xs, 'colConfig.xs');
  assertNumber(val.sm, 'colConfig.sm');
  assertNumber(val.md, 'colConfig.md');
  assertNumber(val.lg, 'colConfig.lg');
  if (val.cityPosition !== 'top' && val.cityPosition !== 'bottom')
    throw new Error("Invalid config: colConfig.cityPosition must be 'top' or 'bottom'");
  return val as unknown as ColConfig;
}

export function importConfig(json: string): ConfigSavePayload {
  const data: unknown = JSON.parse(json);
  assertObject(data, 'root');
  assertArray(data.members, 'members');
  assertArray(data.countries, 'countries');
  assertArray(data.cities, 'cities');
  assertObject(data.colConfig, 'colConfig');

  return {
    members: data.members.map(validateMember),
    countries: data.countries.map(validateCountry),
    cities: data.cities.map(validateCity),
    colConfig: validateColConfig(data.colConfig),
  };
}

export function exportConfig(payload: ConfigSavePayload): void {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `twm-config-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
