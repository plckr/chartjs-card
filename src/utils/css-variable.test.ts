import { beforeEach, describe, expect, it, vi } from 'vitest';

import { evaluateCssVariable } from './css-variable';

describe('evaluateCssVariable', () => {
  beforeEach(() => {
    // Mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {
        getPropertyValue: (prop: string) => {
          const cssVars: Record<string, string> = {
            '--primary-color': '#ff0000',
            '--secondary-color': '#00ff00',
            '--empty-var': '',
          };

          return cssVars[prop] || '';
        },
      } as CSSStyleDeclaration;
    });
  });

  it('should return the input if it is not a string', () => {
    expect(evaluateCssVariable(null as unknown as string)).toBe(null);
    expect(evaluateCssVariable(undefined as unknown as string)).toBe(undefined);
    expect(evaluateCssVariable(123 as unknown as string)).toBe(123);
  });

  it('should return the input if it is an empty string', () => {
    expect(evaluateCssVariable('')).toBe('');
    expect(evaluateCssVariable('   ')).toBe('   ');
  });

  it('should return the input if it does not contain a CSS variable', () => {
    expect(evaluateCssVariable('plain text')).toBe('plain text');
    expect(evaluateCssVariable('#ff0000')).toBe('#ff0000');
  });

  it('should resolve a CSS variable', () => {
    expect(evaluateCssVariable('var(--primary-color)')).toBe('#ff0000');
  });

  it('should use fallback when CSS variable is empty', () => {
    expect(evaluateCssVariable('var(--empty-var, #0000ff)')).toBe('#0000ff');
  });

  it('should return empty string when CSS variable is not found, neither fallback is provided', () => {
    expect(evaluateCssVariable('var(--nonexistent)')).toBe('');
    expect(evaluateCssVariable('var(--nonexistent, var(--nonexistent))')).toBe('');
  });

  it('should use fallback when CSS variable does not exist', () => {
    expect(evaluateCssVariable('var(--nonexistent, #0000ff)')).toBe('#0000ff');
  });

  it('should handle nested CSS variable fallbacks', () => {
    expect(evaluateCssVariable('var(--nonexistent, var(--primary-color))')).toBe('#ff0000');
  });

  it('should keep additional characters in the passed parameter', () => {
    expect(evaluateCssVariable('var(--primary-color) test')).toBe('#ff0000 test');
    expect(evaluateCssVariable('var(--nonexistent, #0000ff) test')).toBe('#0000ff test');
    expect(evaluateCssVariable('var(--nonexistent, var(--nonexistent, #0000ff)) test')).toBe(
      '#0000ff test'
    );
  });

  it('should handle multiple CSS variables in the passed parameter', () => {
    expect(evaluateCssVariable('var(--primary-color) var(--secondary-color)')).toBe(
      '#ff0000 #00ff00'
    );
    expect(evaluateCssVariable('var(--primary-color) var(--nonexistent, #0000ff)')).toBe(
      '#ff0000 #0000ff'
    );
    expect(
      evaluateCssVariable('var(--primary-color) var(--nonexistent, var(--nonexistent, #0000ff))')
    ).toBe('#ff0000 #0000ff');
  });

  it('should ignore whitespace inside the var()', () => {
    expect(evaluateCssVariable('var(--nonexistent, var(--nonexistent, #000) )test')).toBe(
      '#000test'
    );
  });
});
