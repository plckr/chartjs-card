export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function setPath(obj: object, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj as Record<string, unknown>;

  for (const key of keys.slice(0, -1)) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}
