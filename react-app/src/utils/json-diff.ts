export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Change = {
  /** Path inside the compared value, e.g. ['prompts', 0, 'answer']. */
  path: (string | number)[];
  kind: 'changed' | 'added' | 'removed';
  before?: Json;
  after?: Json;
};

const isObject = (v: Json | undefined): v is { [key: string]: Json } =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every leaf-level difference between two JSON values. */
export function diffJson(before: Json | undefined, after: Json | undefined, path: Change['path'] = []): Change[] {
  if (before === undefined && after === undefined) return [];
  if (before === undefined) return [{ path, kind: 'added', after }];
  if (after === undefined) return [{ path, kind: 'removed', before }];

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    return Array.from({ length }, (_, i) => diffJson(before[i], after[i], [...path, i])).flat();
  }
  if (isObject(before) && isObject(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return keys.flatMap((key) => diffJson(before[key], after[key], [...path, key]));
  }
  return before === after ? [] : [{ path, kind: 'changed', before, after }];
}

/** 'prompts[0].answer' → 'Prompts › 1 › Answer'. */
export function formatPath(path: Change['path']): string {
  return path.map((part) => (typeof part === 'number' ? `#${part + 1}` : humanise(part))).join(' › ');
}

/** 'lookingFor' → 'Looking for'. */
export function humanise(key: string): string {
  const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Short one-line preview of a value for the change list. */
export function previewValue(value: Json | undefined): string {
  if (value === undefined) return '—';
  if (value === null) return 'empty';
  if (typeof value === 'string') return value === '' ? '""' : `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
