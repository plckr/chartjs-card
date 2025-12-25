export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function cloneDeepWith<T>(value: T, customizer: (value: unknown) => unknown): T {
  const customResult = customizer(value);
  if (customResult !== undefined) {
    return customResult as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneDeepWith(item, customizer)) as T;
  }

  if (isObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = cloneDeepWith((value as Record<string, unknown>)[key], customizer);
    }
    return result as T;
  }

  return value;
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
