import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeAssistant } from '../types/homeassistant';
import { evaluateTemplate } from './evaluate-template';

describe('evaluateTemplate', () => {
  const mockHass = {
    user: {
      id: 'user123',
      name: 'Test User',
      is_admin: true,
      is_owner: true,
      credentials: [],
    },
    states: {
      'sensor.temperature': {
        entity_id: 'sensor.temperature',
        state: '25',
        attributes: {
          unit_of_measurement: '°C',
          friendly_name: 'Temperature',
        },
        last_changed: '2024-01-01T00:00:00Z',
        last_updated: '2024-01-01T00:00:00Z',
        context: { id: 'ctx1', user_id: null, parent_id: null },
      },
      'sensor.humidity': {
        entity_id: 'sensor.humidity',
        state: '60',
        attributes: {
          unit_of_measurement: '%',
          friendly_name: 'Humidity',
        },
        last_changed: '2024-01-01T00:00:00Z',
        last_updated: '2024-01-01T00:00:00Z',
        context: { id: 'ctx2', user_id: null, parent_id: null },
      },
    },
  } as HomeAssistant;

  beforeEach(() => {
    // Mock getComputedStyle for CSS variable evaluation
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {
        getPropertyValue: (prop: string) => {
          const cssVars: Record<string, string> = {
            '--primary-color': '#ff0000',
          };
          return cssVars[prop] || '';
        },
      } as CSSStyleDeclaration;
    });
  });

  it('should return plain strings unchanged', () => {
    expect(evaluateTemplate('Hello World', mockHass)).toBe('Hello World');
    expect(evaluateTemplate('No template here', mockHass)).toBe('No template here');
  });

  it('should evaluate a template accessing state', () => {
    expect(evaluateTemplate('${states["sensor.temperature"].state}', mockHass)).toBe('25');
  });

  it('should evaluate a template with arithmetic', () => {
    expect(evaluateTemplate('${Number(states["sensor.temperature"].state) * 2}', mockHass)).toBe(
      50
    );
  });

  it('should evaluate a template returning an array', () => {
    const result = evaluateTemplate('${[1, 2, 3]}', mockHass);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should evaluate a template returning a string array and apply CSS variable resolution', () => {
    const result = evaluateTemplate('${["var(--primary-color)", "#00ff00"]}', mockHass);
    expect(result).toEqual(['#ff0000', '#00ff00']);
  });

  it('should evaluate a template returning a stringified array', () => {
    const result = evaluateTemplate('${"[1, 2, 3]"}', mockHass);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should access user information', () => {
    expect(evaluateTemplate('${user.name}', mockHass)).toBe('Test User');
    expect(evaluateTemplate('${user.is_admin}', mockHass)).toBe(true);
  });

  it('should evaluate multiple templates', () => {
    expect(evaluateTemplate('${user.name} ${user.is_admin}', mockHass)).toBe('Test User true');
  });

  it('should evaluate multiple templates with CSS variables', () => {
    expect(evaluateTemplate('${user.name} ${user.is_admin} var(--primary-color)', mockHass)).toBe(
      'Test User true #ff0000'
    );
  });

  it('should evaluate multiple templates with CSS variables and arrays', () => {
    expect(
      evaluateTemplate(
        '${user.name} ${user.is_admin} var(--primary-color) ${["var(--primary-color)", "#00ff00"]}',
        mockHass
      )
    ).toBe('Test User true #ff0000 #ff0000,#00ff00');
  });
});
