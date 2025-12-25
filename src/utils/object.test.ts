import { describe, expect, it } from 'vitest';

import { cloneDeepWith, isObject, setPath } from './object';

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

describe('cloneDeepWith', () => {
  it('should clone a simple object', () => {
    const obj = { a: 1, b: 2 };
    const cloned = cloneDeepWith(obj, () => undefined);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should clone nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const cloned = cloneDeepWith(obj, () => undefined);

    expect(cloned).toEqual(obj);
    expect(cloned.a).not.toBe(obj.a);
    expect(cloned.a.b).not.toBe(obj.a.b);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, [3, 4]];
    const cloned = cloneDeepWith(arr, () => undefined);

    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[2]).not.toBe(arr[2]);
  });

  it('should apply customizer function', () => {
    const obj = { a: 'hello', b: 'world' };
    const cloned = cloneDeepWith(obj, (value) => {
      if (typeof value === 'string') {
        return value.toUpperCase();
      }
      return undefined;
    });

    expect(cloned).toEqual({ a: 'HELLO', b: 'WORLD' });
  });

  it('should handle mixed arrays and objects', () => {
    const obj = { arr: [{ x: 1 }, { y: 2 }] };
    const cloned = cloneDeepWith(obj, () => undefined);

    expect(cloned).toEqual(obj);
    expect(cloned.arr).not.toBe(obj.arr);
    expect(cloned.arr[0]).not.toBe(obj.arr[0]);
  });

  it('should return primitives as-is when no customizer matches', () => {
    expect(cloneDeepWith(42, () => undefined)).toBe(42);
    expect(cloneDeepWith('string', () => undefined)).toBe('string');
    expect(cloneDeepWith(true, () => undefined)).toBe(true);
  });
});

describe('setPath', () => {
  it('should set a simple path', () => {
    const obj: Record<string, unknown> = {};
    setPath(obj, 'a', 1);

    expect(obj).toEqual({ a: 1 });
  });

  it('should set a nested path', () => {
    const obj: Record<string, unknown> = {};
    setPath(obj, 'a.b.c', 1);

    expect(obj).toEqual({ a: { b: { c: 1 } } });
  });

  it('should overwrite existing values', () => {
    const obj = { a: { b: 1 } };
    setPath(obj, 'a.b', 2);

    expect(obj).toEqual({ a: { b: 2 } });
  });

  it('should create intermediate objects when path does not exist', () => {
    const obj = { a: 1 };
    setPath(obj, 'b.c.d', 'value');

    expect(obj).toEqual({ a: 1, b: { c: { d: 'value' } } });
  });

  it('should overwrite non-object intermediate values', () => {
    const obj = { a: 'string' };
    setPath(obj, 'a.b', 1);

    expect(obj).toEqual({ a: { b: 1 } });
  });
});
