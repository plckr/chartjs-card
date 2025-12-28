import { HomeAssistant } from '../types/homeassistant';
import { isArray } from './array';
import { evaluateCssVariable } from './css-variable';

export function evaluateTemplate(
  template: string,
  hassProp: HomeAssistant,
  onEntityAccess?: (entity: string) => void
): unknown | unknown[] {
  ('use strict');
  const __tagFn = customEvalTagFn;
  const hass = {
    ...hassProp,
    states: new Proxy(hassProp.states, {
      get(target, prop) {
        if (typeof prop === 'string') {
          onEntityAccess?.(prop);
        }
        return target[prop];
      },
    }),
  };
  const { user, states } = hass;
  if (!user && !states && !__tagFn) {
    // used for eval, so that Rollup doesn't remove the variables definition
    console.info('Should never happen');
  }

  const parsedTemplate = template.replaceAll('`', '\\`');
  const evaluated: unknown[] = eval(`__tagFn\`${parsedTemplate}\``);
  if (evaluated.length === 1) {
    return evaluated[0];
  }

  return evaluated?.join('');
}

function stringMatchesArray(value: string): boolean {
  const regexArray = /^\[[^\]]+\]$/g;
  return value.match(regexArray) !== null;
}

function customEvalTagFn(strings: TemplateStringsArray, ...values: any[]): unknown[] {
  const result = strings
    .map((str, i) => {
      const result: unknown[] = [evaluateCssVariable(str)];
      if (values[i] !== undefined) {
        let value = values[i];

        if (typeof value === 'string' && stringMatchesArray(value)) {
          value = eval(value);
        }

        if (typeof value === 'string') {
          value = evaluateCssVariable(value);
        }

        if (isArray(value)) {
          value = value.map((r: unknown) => {
            if (typeof r === 'string') {
              return evaluateCssVariable(r);
            }
            return r;
          });
        }

        result.push(value);
      }
      return result;
    })
    .flat(1)
    .filter((r) => {
      if (typeof r === 'string' && r === '') {
        return false;
      }
      return true;
    });

  return result;
}
